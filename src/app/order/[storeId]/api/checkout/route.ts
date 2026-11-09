import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendSaleTransactionEmail } from '@/lib/resend'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params
    if (!storeId || !/^[0-9a-f-]{36}$/i.test(storeId)) {
      return NextResponse.json({ error: 'Store ID tidak valid' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const {
      tableNumber,
      customerName,
      customerEmail,
      notes,
      paymentMethod,
      paymentStatus,
      midtransOrderId,
      items,
    } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Keranjang belanja tidak boleh kosong.' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceOrAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !serviceOrAnonKey) {
      return NextResponse.json({ error: 'Supabase env belum diatur.' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceOrAnonKey)

    // Ambil detail profile outlet
    const { data: storeProfile } = await supabase
      .from('profiles')
      .select('store_name, store_address, full_name')
      .eq('id', storeId)
      .maybeSingle()

    // Ambil detail menu pesanan untuk nama & harga satuan
    const menuIds = items.map((it: any) => it.menuId)
    const { data: menusData } = await supabase
      .from('menus')
      .select('id, nama, harga_jual, estimasi_hpp')
      .in('id', menuIds)
      .eq('user_id', storeId)

    const menuMap = new Map((menusData || []).map(m => [m.id, m]))

    let subtotal = 0
    let totalHpp = 0
    const processedItems: Array<{
      menuId: string
      namaMenu: string
      qty: number
      hargaJual: number
      hpp: number
      subtotal: number
    }> = []

    for (const it of items) {
      const menu = menuMap.get(it.menuId)
      if (!menu) {
        return NextResponse.json(
          { error: `Menu dengan ID ${it.menuId} tidak ditemukan di outlet ini.` },
          { status: 400 }
        )
      }
      const qty = Math.max(1, Number(it.qty) || 1)
      const price = Number(menu.harga_jual) || 0
      const hpp = Number(menu.estimasi_hpp) || 0
      const itemSubtotal = price * qty

      subtotal += itemSubtotal
      totalHpp += hpp * qty

      processedItems.push({
        menuId: menu.id,
        namaMenu: menu.nama,
        qty,
        hargaJual: price,
        hpp,
        subtotal: itemSubtotal,
      })
    }

    // Jika customer memberikan email, simpan ke field notes agar tidak melanggar kolom DB yang belum ada
    const combinedNotes = [
      customerEmail ? `[Email: ${customerEmail.trim()}]` : null,
      notes?.trim() || null,
    ]
      .filter(Boolean)
      .join(' - ') || null

    let finalOrderId = ''
    let finalInvoiceNumber = ''
    let finalTotalPrice = subtotal
    let finalPaymentStatus = paymentStatus || 'Belum Dibayar'

    // 1. Coba panggil RPC submit_public_table_order
    const { data: rpcResult, error: rpcError } = await supabase.rpc('submit_public_table_order', {
      p_store_id: storeId,
      p_table_number: tableNumber || 'Meja Umum',
      p_customer_name: customerName || 'Pelanggan Meja',
      p_customer_phone: customerEmail ? customerEmail.trim() : null,
      p_notes: combinedNotes,
      p_payment_method: paymentMethod || 'Bayar di Kasir',
      p_payment_status: paymentStatus || 'Belum Dibayar',
      p_midtrans_order_id: midtransOrderId || null,
      p_items: items,
    })

    if (!rpcError && rpcResult) {
      finalOrderId = rpcResult.orderId
      finalInvoiceNumber = rpcResult.invoiceNumber
      finalTotalPrice = Number(rpcResult.totalPrice) || subtotal
      finalPaymentStatus = rpcResult.paymentStatus || 'Belum Dibayar'
    } else {
      // 2. Fallback jika RPC belum dimigrasi di Postgres
      console.warn('RPC submit_public_table_order fallback due to:', rpcError?.message)

      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const timeSnippet = Date.now().toString(36).slice(-4).toUpperCase()
      const randCode = Math.floor(100 + Math.random() * 900)
      const invoiceNumber = `INV/${todayStr}/${timeSnippet}-${randCode}`
      const profit = subtotal - totalHpp

      const isLunas = String(paymentStatus || '').toLowerCase().includes('lunas')
      const payStatusVal = isLunas ? 'Lunas' : 'Belum Dibayar'

      const { data: newOrder, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id: storeId,
          invoice_number: invoiceNumber,
          customer_name: (customerName || 'Pelanggan Meja').trim(),
          customer_phone: customerEmail?.trim() || null,
          table_number: tableNumber || 'Meja Umum',
          channel: 'Katalog Online',
          status: 'menunggu',
          payment_method: paymentMethod || 'Bayar di Kasir',
          payment_status: payStatusVal,
          subtotal,
          discount: 0,
          shipping_fee: 0,
          total_price: subtotal,
          total_hpp: totalHpp,
          profit,
          cashier_name: 'Self-Order QR',
          notes: combinedNotes,
          midtrans_order_id: midtransOrderId || null,
          is_tax_included: false,
        })
        .select('id, invoice_number, total_price, payment_status')
        .single()

      if (orderErr) {
        console.error('Error fallback insert order:', orderErr)
        return NextResponse.json(
          { error: `Gagal menyimpan pesanan: ${orderErr.message}` },
          { status: 500 }
        )
      }

      finalOrderId = newOrder.id
      finalInvoiceNumber = newOrder.invoice_number
      finalTotalPrice = Number(newOrder.total_price) || subtotal
      finalPaymentStatus = newOrder.payment_status

      // Simpan order items
      const orderItemsRows = processedItems.map(it => ({
        user_id: storeId,
        order_id: newOrder.id,
        menu_id: it.menuId,
        nama_menu: it.namaMenu,
        qty: it.qty,
        harga_jual: it.hargaJual,
        hpp: it.hpp,
        subtotal: it.subtotal,
      }))

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItemsRows)
      if (itemsErr) {
        console.error('Error fallback insert order_items:', itemsErr)
        // Rollback pesanan induk agar tidak ada transaksi invoice kosong tanpa item
        await supabase.from('orders').delete().eq('id', newOrder.id)
        return NextResponse.json(
          { error: `Gagal mencatat rincian pesanan: ${itemsErr.message}` },
          { status: 500 }
        )
      }
    }

    // 3. Kirim Struk Pembayaran ke Email Pelanggan via Resend (desain struk sama persis seperti Kasir)
    if (customerEmail && customerEmail.trim()) {
      try {
        const storeName = storeProfile?.store_name || 'Dapur Resto & Kafe'
        const ownerName = storeProfile?.full_name || 'Owner'
        const clientEmail = customerEmail.trim()

        // Panggil helper email struk DapurTwin
        sendSaleTransactionEmail({
          email: clientEmail,
          isCustomerCopy: true,
          storeName,
          ownerName,
          invoiceNumber: finalInvoiceNumber,
          customerName: customerName ? `${customerName} (${tableNumber || 'Meja'})` : `Pelanggan ${tableNumber || 'Meja'}`,
          customerEmail: clientEmail,
          paymentMethod: paymentMethod || 'Bayar di Kasir',
          paymentStatus: finalPaymentStatus,
          subtotal,
          discount: 0,
          totalPrice: finalTotalPrice,
          cashReceived: null,
          changeAmount: null,
          cashierName: `Self-Order (${tableNumber || 'Meja'})`,
          notes: notes?.trim() || `Pemesanan mandiri dari ${tableNumber || 'Meja'}`,
          items: processedItems.map(it => ({
            namaMenu: it.namaMenu,
            qty: it.qty,
            hargaJual: it.hargaJual,
            subtotal: it.subtotal,
          })),
          createdAt: new Date(),
        }).catch(emailErr => {
          console.warn('[Checkout] Gagal mengirim struk email pelanggan via Resend:', emailErr)
        })
      } catch (err) {
        console.warn('[Checkout] Exception saat memicu email Resend:', err)
      }
    }

    return NextResponse.json({
      success: true,
      orderId: finalOrderId,
      invoiceNumber: finalInvoiceNumber,
      totalPrice: finalTotalPrice,
      paymentStatus: finalPaymentStatus,
    })
  } catch (err: any) {
    console.error('Checkout API error:', err)
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan server' }, { status: 500 })
  }
}
