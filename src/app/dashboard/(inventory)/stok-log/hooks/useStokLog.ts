'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { stokLogService } from '../services/stokLogService'
import { StokLog, BahanSimple, OpnameEntry, ManualMutasiInput, StokLogSource } from '../types'

export function useStokLog() {
  const [logs, setLogs] = useState<StokLog[]>([])
  const [bahanList, setBahanList] = useState<BahanSimple[]>([])
  const [opnameList, setOpnameList] = useState<OpnameEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Filter
  const [filterSource, setFilterSource] = useState<string>('all')
  const [search, setSearch] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session

      if (!session || !session.user) {
        setError('Sesi belum terdeteksi. Silakan login terlebih dahulu untuk mengakses catatan mutasi stok.')
        setUserEmail(null)
        setLogs([])
        setBahanList([])
        setOpnameList([])
        setLoading(false)
        return
      }

      setUserEmail(session.user.email || null)

      const [logsData, bData] = await Promise.all([
        stokLogService.getLogs(),
        stokLogService.getBahanList(),
      ])

      setLogs(logsData || [])
      setBahanList(bData || [])

      // Inisialisasi opname entry berdasarkan stok sistem bahan
      const initialOpname: OpnameEntry[] = (bData || []).map(b => ({
        bahanId: b.id,
        namaBahan: b.nama,
        satuan: b.satuan,
        stokSystem: b.stok,
        stokAktual: b.stok,
        selisih: 0,
      }))
      setOpnameList(initialOpname)
    } catch (err: unknown) {
      const e = err as Error
      console.error('Fetch stok log error:', e)
      setError(e.message || 'Gagal memuat catatan stok log.')
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()

    const supabase = createClient()
    const { data: authListener } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        fetchAll()
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [fetchAll])

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchSearch =
        log.namaBahan.toLowerCase().includes(search.toLowerCase()) ||
        (log.catatan && log.catatan.toLowerCase().includes(search.toLowerCase()))
      const matchSource = filterSource === 'all' || log.sumber === filterSource
      return matchSearch && matchSource
    })
  }, [logs, search, filterSource])

  // Hitung total masuk & keluar
  const summary = useMemo(() => {
    let masukCount = 0
    let keluarCount = 0
    logs.forEach(l => {
      if (l.perubahan > 0) masukCount += l.perubahan
      else keluarCount += Math.abs(l.perubahan)
    })
    return {
      totalLogs: logs.length,
      masukCount,
      keluarCount,
    }
  }, [logs])

  // Update angka fisik di tabel Opname
  const updateOpnameAktual = (bahanId: string, aktual: number) => {
    setOpnameList(prev =>
      prev.map(o => {
        if (o.bahanId !== bahanId) return o
        const safeAktual = isNaN(aktual) ? 0 : aktual
        const selisih = Number((safeAktual - o.stokSystem).toFixed(3))
        return {
          ...o,
          stokAktual: safeAktual,
          selisih,
        }
      })
    )
  }

  // Simpan & Rekonsiliasi Opname
  const saveOpname = async (): Promise<number> => {
    setError(null)
    try {
      const count = await stokLogService.saveStockOpname(opnameList)
      await fetchAll()
      return count
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message)
      throw e
    }
  }

  // Catat Mutasi Manual
  const recordManualMutasi = async (input: ManualMutasiInput) => {
    setError(null)
    try {
      await stokLogService.recordManualMutasi(input)
      await fetchAll()
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message)
      throw e
    }
  }

  return {
    logs: filteredLogs,
    rawLogsCount: logs.length,
    bahanList,
    opnameList,
    summary,
    loading,
    error,
    userEmail,
    search,
    setSearch,
    filterSource,
    setFilterSource,
    updateOpnameAktual,
    saveOpname,
    recordManualMutasi,
    refresh: fetchAll,
  }
}
