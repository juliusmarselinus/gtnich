import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { sendLoginNotificationEmail, sendWelcomeRegistrationEmail } from '@/lib/resend'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Ambil data survey dari searchParams jika tersedia
  let surveyUsaha = searchParams.get('usaha') || ''
  let surveyKanal = searchParams.get('kanal') || ''
  let surveyHabis = searchParams.get('habis') ? Number(searchParams.get('habis')) : null

  if (code) {
    const cookieStore = await cookies()

    // Fallback ambil data survey dari cookie dapur_survey jika tidak ada di searchParams
    if (!surveyUsaha && !surveyKanal) {
      const cookieSurvey = cookieStore.get('dapur_survey')?.value
      if (cookieSurvey) {
        try {
          const parsed = JSON.parse(cookieSurvey)
          if (parsed.usaha) surveyUsaha = parsed.usaha
          if (parsed.kanal) surveyKanal = parsed.kanal
          if (parsed.habis !== undefined && parsed.habis !== null) surveyHabis = Number(parsed.habis)
        } catch {
          // ignore error parsing cookie
        }
      }
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Abaikan jika dipanggil dalam konteks di mana cookie sudah ditutup
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Pastikan profile terisi saat login lewat OAuth Google
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Ambil profil yang sudah ada untuk memeriksa apakah user sudah pernah mengisi profil
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('full_name, store_name, business_type, sales_channels')
            .eq('id', user.id)
            .maybeSingle()

          const salesChannelsArray = surveyKanal ? surveyKanal.split(',').filter(Boolean) : null

          // Update user_metadata jika ada data personalisasi survey
          if (surveyUsaha || surveyKanal || surveyHabis !== null) {
            await supabase.auth.updateUser({
              data: {
                business_type: surveyUsaha || user.user_metadata?.business_type || null,
                sales_channels: salesChannelsArray || user.user_metadata?.sales_channels || null,
                stockout_frequency: surveyHabis !== null ? surveyHabis : (user.user_metadata?.stockout_frequency ?? null),
              },
            })
          }

          // Jika user login via Google dan profil belum lengkap, isi nama default dari akun Google
          // agar langsung aktif dan user bisa langsung masuk ke aplikasi tanpa terhambat modal tanya personalized
          const metaFullName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            (user.email ? user.email.split('@')[0] : 'Pengguna Dapur')
          const metaStoreName =
            user.user_metadata?.store_name ||
            `Dapur ${metaFullName}`

          const fullName = existingProfile?.full_name || metaFullName
          const storeName = existingProfile?.store_name || metaStoreName

          await supabase.from('profiles').upsert(
            {
              id: user.id,
              full_name: fullName,
              store_name: storeName,
              is_completed: true,
              ...(surveyUsaha ? { business_type: surveyUsaha } : {}),
              ...(salesChannelsArray && salesChannelsArray.length > 0 ? { sales_channels: salesChannelsArray } : {}),
            },
            { onConflict: 'id' }
          )

          // Kirim email ucapan selamat registrasi (jika pendaftaran/login user baru dari Google)
          const isNewUser =
            !existingProfile ||
            (user.created_at &&
              new Date().getTime() - new Date(user.created_at).getTime() < 5 * 60 * 1000)

          if (isNewUser && user.email) {
            sendWelcomeRegistrationEmail({
              email: user.email,
              userName: fullName || user.user_metadata?.full_name || user.email.split('@')[0],
              storeName: storeName || user.user_metadata?.store_name,
              registrationMethod: 'Google Account (OAuth)',
            }).catch((regErr) => {
              console.warn('Gagal kirim email selamat datang Google:', regErr)
            })
          }

          // Kirim email notifikasi login Google via Resend
          if (user.email) {
            sendLoginNotificationEmail({
              email: user.email,
              userName: fullName || user.email.split('@')[0],
              loginMethod: 'Google OAuth',
              loginTime: new Date(),
            }).catch((emailErr) => {
              console.warn('Gagal kirim email notifikasi Google login:', emailErr)
            })
          }
        }
      } catch (profileErr) {
        console.warn('Gagal sync profile Google OAuth:', profileErr)
      }

      // Hapus cookie survey setelah berhasil diproses
      try {
        cookieStore.delete('dapur_survey')
      } catch {
        // ignore
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      // Langsung arahkan ke dashboard aplikasi tanpa query param setup/personalized
      const targetPath = next

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${targetPath}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${targetPath}`)
      } else {
        return NextResponse.redirect(`${origin}${targetPath}`)
      }
    }
  }

  // Jika gagal, kembalikan ke halaman login dengan notifikasi error
  return NextResponse.redirect(`${origin}/login?error=oauth_error`)
}
