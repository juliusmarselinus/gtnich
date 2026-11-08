import test from 'node:test'
import assert from 'node:assert/strict'

// Logika kalkulasi kasir penjualan (checkout)
interface CartItem {
  hargaJual: number
  qty: number
  hpp: number
}

function calculateCheckout({
  cart,
  discount = 0,
  isTaxIncluded = false,
  taxRate = 11,
  cashReceived = 0,
}: {
  cart: CartItem[]
  discount?: number
  isTaxIncluded?: boolean
  taxRate?: number
  cashReceived?: number
}) {
  const subtotal = cart.reduce((sum, item) => sum + item.hargaJual * item.qty, 0)
  const totalHPP = cart.reduce((sum, item) => sum + item.hpp * item.qty, 0)
  const effectiveDiscount = Math.min(subtotal, Math.max(0, discount))
  const taxableAmount = Math.max(0, subtotal - effectiveDiscount)

  let taxAmount = 0
  let totalPrice = taxableAmount

  if (taxRate > 0) {
    if (isTaxIncluded) {
      // Pajak sudah termasuk di harga
      taxAmount = Math.round(taxableAmount - taxableAmount / (1 + taxRate / 100))
      totalPrice = taxableAmount
    } else {
      // Pajak ditambahkan di luar harga
      taxAmount = Math.round(taxableAmount * (taxRate / 100))
      totalPrice = taxableAmount + taxAmount
    }
  }

  const profit = taxableAmount - totalHPP
  const changeAmount = cashReceived > 0 ? Math.max(0, cashReceived - totalPrice) : 0

  return {
    subtotal,
    discount: effectiveDiscount,
    taxableAmount,
    taxAmount,
    totalPrice,
    totalHPP,
    profit,
    changeAmount,
  }
}

test('Kalkulasi checkout kasir standar tanpa pajak', () => {
  const cart: CartItem[] = [
    { hargaJual: 20000, qty: 2, hpp: 10000 },
    { hargaJual: 5000, qty: 1, hpp: 2000 },
  ]

  const result = calculateCheckout({ cart, discount: 5000, taxRate: 0 })
  assert.equal(result.subtotal, 45000)
  assert.equal(result.discount, 5000)
  assert.equal(result.totalPrice, 40000)
  assert.equal(result.totalHPP, 22000)
  assert.equal(result.profit, 18000)
})

test('Kalkulasi checkout dengan pajak di luar (exclusive tax)', () => {
  const cart: CartItem[] = [
    { hargaJual: 100000, qty: 1, hpp: 50000 },
  ]

  const result = calculateCheckout({ cart, discount: 0, isTaxIncluded: false, taxRate: 11 })
  assert.equal(result.subtotal, 100000)
  assert.equal(result.taxAmount, 11000)
  assert.equal(result.totalPrice, 111000)
  assert.equal(result.profit, 50000)
})

test('Kalkulasi checkout dengan pajak sudah termasuk (inclusive tax)', () => {
  const cart: CartItem[] = [
    { hargaJual: 111000, qty: 1, hpp: 50000 },
  ]

  const result = calculateCheckout({ cart, discount: 0, isTaxIncluded: true, taxRate: 11 })
  assert.equal(result.subtotal, 111000)
  assert.equal(result.totalPrice, 111000)
  assert.equal(result.taxAmount, 11000) // 111000 - 111000 / 1.11 = 11000
  assert.equal(result.profit, 61000)
})

test('Kalkulasi uang kembalian tunai (cash change)', () => {
  const cart: CartItem[] = [
    { hargaJual: 22000, qty: 2, hpp: 11000 },
  ]

  const result = calculateCheckout({ cart, cashReceived: 50000, taxRate: 0 })
  assert.equal(result.totalPrice, 44000)
  assert.equal(result.changeAmount, 6000)
})
