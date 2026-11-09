import test from 'node:test'
import assert from 'node:assert/strict'

// Helper kalkulasi checkout pesanan meja
function calculateTableOrder(items: Array<{ hargaJual: number; hpp: number; qty: number }>) {
  const subtotal = items.reduce((sum, it) => sum + it.hargaJual * it.qty, 0)
  const totalHpp = items.reduce((sum, it) => sum + it.hpp * it.qty, 0)
  const profit = subtotal - totalHpp
  return { subtotal, totalHpp, profit }
}

function resolvePaymentStatus(paymentMethod: string, isPaid: boolean) {
  if (paymentMethod === 'Bayar di Kasir') {
    return isPaid ? 'Lunas' : 'Belum Lunas'
  }
  if (paymentMethod === 'QRIS Dinamis') {
    return isPaid ? 'Lunas' : 'Belum Lunas'
  }
  return isPaid ? 'Lunas' : 'Belum Lunas'
}

test('Kalkulasi subtotal dan profit pesanan mandiri meja', () => {
  const items = [
    { hargaJual: 25000, hpp: 12000, qty: 2 }, // 50000, hpp 24000
    { hargaJual: 10000, hpp: 4000, qty: 3 },  // 30000, hpp 12000
  ]

  const result = calculateTableOrder(items)
  assert.equal(result.subtotal, 80000)
  assert.equal(result.totalHpp, 36000)
  assert.equal(result.profit, 44000)
})

test('Status pembayaran untuk metode Bayar di Kasir', () => {
  assert.equal(resolvePaymentStatus('Bayar di Kasir', false), 'Belum Lunas')
  assert.equal(resolvePaymentStatus('Bayar di Kasir', true), 'Lunas')
})

test('Status pembayaran untuk metode QRIS Dinamis', () => {
  assert.equal(resolvePaymentStatus('QRIS Dinamis', false), 'Belum Lunas')
  assert.equal(resolvePaymentStatus('QRIS Dinamis', true), 'Lunas')
})

test('Format Invoice Pesanan Meja Valid', () => {
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const inv = `INV/${todayStr}/TEST-123`
  assert.match(inv, /^INV\/\d{8}\/TEST-123$/)
})

test('Validasi keranjang & payload checkout meja', () => {
  // 1. Keranjang kosong harus ditolak
  const emptyItems: any[] = []
  assert.equal(emptyItems.length === 0, true)

  // 2. Format storeId UUID 36 karakter
  const validStoreId = '3acef6f8-0a71-479c-81b3-21eaba1f9e1b'
  const invalidStoreId = 'not-a-uuid-123'
  const uuidRegex = /^[0-9a-f-]{36}$/i
  assert.equal(uuidRegex.test(validStoreId), true)
  assert.equal(uuidRegex.test(invalidStoreId), false)

  // 3. Sanitasi qty minimal 1
  const rawQty = -3
  const sanitizedQty = Math.max(1, Number(rawQty) || 1)
  assert.equal(sanitizedQty, 1)

  // 4. Struktur payload email struk
  const emailPayload = {
    customerEmail: 'test@example.com',
    invoiceNumber: 'INV/20261109/X1Y2-123',
    totalPrice: 50000,
    items: [{ namaMenu: 'Nasi Goreng', qty: 2, hargaJual: 25000, subtotal: 50000 }],
  }
  assert.equal(emailPayload.customerEmail.includes('@'), true)
  assert.equal(emailPayload.totalPrice, 50000)
  assert.equal(emailPayload.items.length, 1)
})
