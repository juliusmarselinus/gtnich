import { NextResponse } from 'next/server'
import { sendSaleTransactionEmail } from '@/lib/resend'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      ownerEmail,
      customerEmail,
      storeName,
      ownerName,
      invoiceNumber,
      customerName,
      customerPhone,
      paymentMethod,
      paymentStatus,
      subtotal,
      discount,
      totalPrice,
      cashReceived,
      changeAmount,
      cashierName,
      notes,
      items,
      createdAt,
    } = body

    if (!invoiceNumber || (!ownerEmail && !customerEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invoice number dan minimal satu email (owner atau pelanggan) diperlukan.' },
        { status: 400 }
      )
    }

    const emailTasks: Promise<unknown>[] = []

    // 1. Kirim struk ke email pelanggan jika diinput
    if (customerEmail && customerEmail.trim()) {
      emailTasks.push(
        sendSaleTransactionEmail({
          email: customerEmail.trim(),
          isCustomerCopy: true,
          storeName: storeName || 'DapurTwin',
          ownerName,
          invoiceNumber,
          customerName: customerName || 'Pelanggan',
          customerPhone,
          customerEmail: customerEmail.trim(),
          paymentMethod: paymentMethod || 'Tunai / Cash',
          paymentStatus: paymentStatus || 'Lunas',
          subtotal: Number(subtotal) || Number(totalPrice) || 0,
          discount: Number(discount) || 0,
          totalPrice: Number(totalPrice) || 0,
          cashReceived: cashReceived != null ? Number(cashReceived) : null,
          changeAmount: changeAmount != null ? Number(changeAmount) : null,
          cashierName: cashierName || 'Kasir Dapur',
          notes,
          items: items || [],
          createdAt: createdAt || new Date(),
        })
      )
    }

    // 2. Kirim notifikasi transaksi ke email owner dapur
    if (ownerEmail && ownerEmail.trim()) {
      emailTasks.push(
        sendSaleTransactionEmail({
          email: ownerEmail.trim(),
          isCustomerCopy: false,
          storeName: storeName || 'DapurTwin',
          ownerName,
          invoiceNumber,
          customerName: customerName || 'Pelanggan Umum',
          customerPhone,
          customerEmail: customerEmail?.trim() || null,
          paymentMethod: paymentMethod || 'Tunai / Cash',
          paymentStatus: paymentStatus || 'Lunas',
          subtotal: Number(subtotal) || Number(totalPrice) || 0,
          discount: Number(discount) || 0,
          totalPrice: Number(totalPrice) || 0,
          cashReceived: cashReceived != null ? Number(cashReceived) : null,
          changeAmount: changeAmount != null ? Number(changeAmount) : null,
          cashierName: cashierName || 'Kasir Dapur',
          notes,
          items: items || [],
          createdAt: createdAt || new Date(),
        })
      )
    }

    const results = await Promise.allSettled(emailTasks)

    return NextResponse.json({ success: true, count: emailTasks.length, results })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Error endpoint notify-sale:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
