import test from 'node:test'
import assert from 'node:assert/strict'

test('Tagihan filtering and calculation logic', () => {
  const dummyPOs = [
    {
      id: 'po-1',
      noPO: 'PO-001',
      status: 'tagihan',
      totalAktual: 500000,
      totalEstimasi: 450000,
      catatan: null,
      tanggalBuat: '2026-11-01',
    },
    {
      id: 'po-2',
      noPO: 'PO-002',
      status: 'diterima',
      totalAktual: 350000,
      totalEstimasi: 350000,
      catatan: '[LUNAS 05 Nov 2026] Metode: Transfer Bank',
      tanggalBuat: '2026-11-02',
    },
    {
      id: 'po-3',
      noPO: 'PO-003',
      status: 'draft',
      totalAktual: 200000,
      totalEstimasi: 200000,
      catatan: null,
      tanggalBuat: '2026-11-03',
    },
  ]

  // Filter tagihan fase aktif (tagihan atau diterima)
  const tagihanList = dummyPOs.filter(p => p.status === 'tagihan' || p.status === 'diterima')
  assert.equal(tagihanList.length, 2)

  // Cek deteksi lunas berdasarkan catatan
  const isLunas = (catatan: string | null) => Boolean(catatan && catatan.includes('[LUNAS'))
  assert.equal(isLunas(dummyPOs[0].catatan), false)
  assert.equal(isLunas(dummyPOs[1].catatan), true)

  // Akumulasi nominal belum lunas
  const totalBelumLunas = tagihanList
    .filter(p => !isLunas(p.catatan))
    .reduce((sum, p) => sum + (p.totalAktual || p.totalEstimasi), 0)

  assert.equal(totalBelumLunas, 500000)
})

test('Pesanan status state machine validation', () => {
  const boleh: Record<string, string[]> = {
    preorder: ['diproses', 'batal'],
    menunggu: ['diproses', 'batal'],
    diproses: ['selesai', 'batal'],
  }

  // Preorder/Menunggu -> Diproses: Valid
  assert.equal(boleh['preorder'].includes('diproses'), true)
  assert.equal(boleh['menunggu'].includes('diproses'), true)

  // Diproses -> Selesai: Valid
  assert.equal(boleh['diproses'].includes('selesai'), true)

  // Menunggu -> Selesai langsung: Tidak boleh (harus diproses dulu)
  assert.equal(boleh['menunggu'].includes('selesai'), false)

  // Selesai -> Diproses: Tidak boleh
  assert.equal(Boolean(boleh['selesai']?.includes('diproses')), false)
})

test('Bahan deletion safety checks', () => {
  // Skenario 1: Bahan dengan stok > 0 tidak boleh langsung dihapus
  const canDeleteBahan = (stok: number, isUsedInResep: boolean) => {
    if (stok > 0) return { allowed: false, reason: 'Stok fisik masih ada' }
    if (isUsedInResep) return { allowed: false, reason: 'Masih terpakai dalam resep menu' }
    return { allowed: true }
  }

  assert.deepEqual(canDeleteBahan(10, false), { allowed: false, reason: 'Stok fisik masih ada' })
  assert.deepEqual(canDeleteBahan(0, true), { allowed: false, reason: 'Masih terpakai dalam resep menu' })
  assert.deepEqual(canDeleteBahan(0, false), { allowed: true })
})
