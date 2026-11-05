import test from 'node:test'
import assert from 'node:assert/strict'

// Rumus simulasi & kalkulasi HPP yang digunakan di DapurTwin
function calculateHPP(resep: Array<{ qty: number; hargaBeliPerSatuan: number }>): number {
  return resep.reduce((sum, item) => sum + item.qty * item.hargaBeliPerSatuan, 0)
}

function calculateProfit(hargaJual: number, hpp: number, diskon: number = 0): { netRevenue: number; profit: number; margin: number } {
  const netRevenue = Math.max(0, hargaJual - diskon)
  const profit = netRevenue - hpp
  const margin = netRevenue > 0 ? Number(((profit / netRevenue) * 100).toFixed(1)) : 0
  return { netRevenue, profit, margin }
}

test('Perhitungan HPP resep menu', () => {
  const resepAyamGeprek = [
    { qty: 0.2, hargaBeliPerSatuan: 38000 }, // 200 gram ayam @ Rp 38.000/kg = Rp 7.600
    { qty: 0.05, hargaBeliPerSatuan: 40000 }, // 50 gram cabai @ Rp 40.000/kg = Rp 2.000
    { qty: 0.1, hargaBeliPerSatuan: 12000 }, // 100 gram beras @ Rp 12.000/kg = Rp 1.200
  ]

  const totalHPP = calculateHPP(resepAyamGeprek)
  assert.equal(totalHPP, 10800)
})

test('Perhitungan laba kotor & margin keuntungan', () => {
  const hargaJual = 20000
  const hpp = 10800
  const diskon = 2000

  const res = calculateProfit(hargaJual, hpp, diskon)
  assert.equal(res.netRevenue, 18000)
  assert.equal(res.profit, 7200)
  assert.equal(res.margin, 40) // 7200 / 18000 = 40%
})

test('Perhitungan saat diskon melebihi harga jual tidak menghasilkan omzet minus', () => {
  const res = calculateProfit(15000, 10000, 20000)
  assert.equal(res.netRevenue, 0)
  assert.equal(res.profit, -10000)
  assert.equal(res.margin, 0)
})
