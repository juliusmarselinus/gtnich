import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params
    if (!storeId || !/^[0-9a-f-]{36}$/i.test(storeId)) {
      return NextResponse.json({ error: 'Store ID tidak valid' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceOrAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !serviceOrAnonKey) {
      return NextResponse.json({ error: 'Supabase env belum diatur' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceOrAnonKey)

    // Ambil Profil Toko
    const { data: profile } = await supabase
      .from('profiles')
      .select('store_name, store_address, business_type')
      .eq('id', storeId)
      .maybeSingle()

    // 1. Coba ambil via RPC jika migrasi SQL get_public_menu_catalog_with_stock telah dijalankan
    const { data: rpcMenus, error: rpcErr } = await supabase.rpc('get_public_menu_catalog_with_stock', {
      p_store_id: storeId,
    })

    if (!rpcErr && Array.isArray(rpcMenus) && rpcMenus.length > 0) {
      return NextResponse.json({
        store: {
          id: storeId,
          name: profile?.store_name || 'Dapur Resto & Kafe',
          address: profile?.store_address || '',
          businessType: profile?.business_type || 'Kuliner',
        },
        menus: rpcMenus,
      })
    }

    // 2. Fallback: Ambil Daftar Menu Toko beserta resep dan stok bahan langsung
    // Semua menu milik toko tetap dimuat. Jika is_active = false, menu tetap tampil ke customer dengan status Stok Habis
    const { data: rawMenus, error: menuErr } = await supabase
      .from('menus')
      .select('id, nama, kategori, emoji, harga_jual, estimasi_hpp, is_active, resep_items(id, bahan_id, qty, bahan(id, nama, stok))')
      .eq('user_id', storeId)
      .order('nama', { ascending: true })

    if (menuErr) {
      console.error('Error fetching public menus:', menuErr)
      return NextResponse.json({ error: `Gagal memuat menu toko: ${menuErr.message}` }, { status: 500 })
    }

    const menusList = rawMenus || []

    return NextResponse.json({
      store: {
        id: storeId,
        name: profile?.store_name || 'Dapur Resto & Kafe',
        address: profile?.store_address || '',
        businessType: profile?.business_type || 'Kuliner',
      },
      menus: menusList.map((m: any) => {
        let sisa = Infinity
        let hasValidRecipeStockCheck = false

        const resepList = (m.resep_items || []).map((r: any) => {
          const qtyNeed = Number(r.qty) || 0
          // Jika data relasi bahan terbaca dari database (RLS diizinkan atau service role)
          const stokBahan = r.bahan ? Number(r.bahan.stok) : null

          if (stokBahan !== null && Number.isFinite(stokBahan)) {
            hasValidRecipeStockCheck = true
            if (qtyNeed > 0) {
              const porsi = Math.max(0, Math.floor(stokBahan / qtyNeed + 1e-9))
              if (porsi < sisa) sisa = porsi
            }
          }

          return {
            bahanId: r.bahan_id,
            namaBahan: r.bahan?.nama || 'Bahan',
            qty: qtyNeed,
            stok: stokBahan ?? 0,
          }
        })

        // Jika menu dinonaktifkan oleh pemilik toko (is_active: false), menu ditampilkan seolah "Habis"
        const isManuallyDeactivated = m.is_active === false

        // Jika data stok bahan terbaca dari database, gunakan perhitungan porsi riil.
        // Jika data bahan belum terbaca karena RLS publik belum dijalankan, default Tersedia kecuali dinonaktifkan manual.
        const isHabis = isManuallyDeactivated || (hasValidRecipeStockCheck ? sisa <= 0 : false)
        const maxPorsi = isHabis ? 0 : (hasValidRecipeStockCheck && Number.isFinite(sisa) ? sisa : 9999)

        return {
          id: m.id,
          nama: m.nama,
          kategori: m.kategori || 'Umum',
          emoji: m.emoji || '🍽️',
          hargaJual: Number(m.harga_jual) || 0,
          estimasiHpp: Number(m.estimasi_hpp) || 0,
          sisaPorsi: maxPorsi,
          isHabis,
          isActive: m.is_active !== false,
          resep: resepList,
        }
      }),
    })
  } catch (err: any) {
    console.error('Public store info error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
