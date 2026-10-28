'use client'

import { useState, useEffect, useCallback } from 'react'
import { ParsedItem, OCRScanResult, SupplierOption, BahanOption } from '../types'
import { ocrService } from '../services/ocrService'

export function useOCRNota() {
  const [apiKey, setApiKey] = useState('')
  const [routerUrl, setRouterUrl] = useState('')
  const [routerKey, setRouterKey] = useState('')
  const [routerModel, setRouterModel] = useState('')
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([])
  const [bahanList, setBahanList] = useState<BahanOption[]>([])
  const [isLoadingContext, setIsLoadingContext] = useState(true)

  // State OCR flow
  const [state, setState] = useState<'idle' | 'uploading' | 'done'>('idle')
  const [fileName, setFileName] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<OCRScanResult | null>(null)
  const [items, setItems] = useState<ParsedItem[]>([])
  const [supplierName, setSupplierName] = useState('')
  const [supplierId, setSupplierId] = useState<string>('')
  const [updateStokDirectly, setUpdateStokDirectly] = useState(true)

  const [isSaving, setIsSaving] = useState(false)
  const [savedPO, setSavedPO] = useState<{ poId: string; noPO: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load API Key dan 9Router config dari localStorage
  useEffect(() => {
    try {
      const stored =
        localStorage.getItem('gemini_api_key') || localStorage.getItem('dapurtwin_gemini_key')
      if (stored) setApiKey(stored)

      const storedRouterUrl = localStorage.getItem('ocr_router_url')
      if (storedRouterUrl) setRouterUrl(storedRouterUrl)

      const storedRouterKey = localStorage.getItem('ocr_router_key')
      if (storedRouterKey) setRouterKey(storedRouterKey)

      const storedRouterModel = localStorage.getItem('ocr_router_model')
      if (storedRouterModel) setRouterModel(storedRouterModel)
    } catch {
      // ignore
    }
  }, [])

  const saveRouterConfig = (config: { routerUrl: string; routerKey: string; routerModel: string }) => {
    setRouterUrl(config.routerUrl)
    setRouterKey(config.routerKey)
    setRouterModel(config.routerModel)
    try {
      localStorage.setItem('ocr_router_url', config.routerUrl)
      localStorage.setItem('ocr_router_key', config.routerKey)
      localStorage.setItem('ocr_router_model', config.routerModel)
    } catch {
      // ignore
    }
  }

  const saveApiKey = (key: string) => {
    setApiKey(key)
    try {
      localStorage.setItem('gemini_api_key', key)
      localStorage.setItem('dapurtwin_gemini_key', key)
    } catch {
      // ignore
    }
  }

  // Fetch data master supplier & bahan
  const loadContext = useCallback(async () => {
    try {
      setIsLoadingContext(true)
      const data = await ocrService.getContextData()
      setSuppliers(data.suppliers)
      setBahanList(data.bahanList)
    } catch (err: any) {
      console.warn('Could not load context data for OCR:', err)
    } finally {
      setIsLoadingContext(false)
    }
  }, [])

  useEffect(() => {
    loadContext()
  }, [loadContext])

  // Process File Upload & OCR
  const handleScanFile = async (file: File) => {
    try {
      setError(null)
      setFileName(file.name)
      setState('uploading')
      setSavedPO(null)

      // Buat preview thumbnail jika file adalah gambar
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        setImagePreview(url)
      } else {
        setImagePreview(null)
      }

      const existingNames = bahanList.map(b => b.nama)
      const res = await ocrService.parseReceiptImage(file, apiKey, existingNames, {
        routerUrl,
        routerKey,
        routerModel,
      })

      setScanResult(res)
      setSupplierName(res.supplierName || (suppliers[0]?.nama ?? 'Supplier Umum'))
      // Match supplierId jika nama mirip
      const matchedSup = suppliers.find(
        s => s.nama.toLowerCase() === (res.supplierName || '').toLowerCase()
      )
      setSupplierId(matchedSup?.id || suppliers[0]?.id || '')

      // Coba match tiap item ke bahan baku yang ada
      const mappedItems = res.items.map(item => {
        const found = bahanList.find(b => b.nama.toLowerCase() === item.nama.toLowerCase())
        return {
          ...item,
          matchedBahanId: found?.id,
        }
      })
      setItems(mappedItems)
      setState('done')
    } catch (err: any) {
      console.error('Scan error:', err)
      setError(err?.message || 'Gagal memindai gambar nota')
      setState('idle')
    }
  }

  // Update item baris
  const handleUpdateItem = (index: number, field: keyof ParsedItem, value: any) => {
    setItems(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  // Hapus item baris
  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  // Tambah item baris manual
  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      { nama: 'Bahan Baru', qty: 1, satuan: 'kg', harga: 10000 },
    ])
  }

  // Reset scan
  const handleReset = () => {
    setState('idle')
    setFileName('')
    setImagePreview(null)
    setScanResult(null)
    setItems([])
    setSavedPO(null)
    setError(null)
  }

  // Simpan ke Database
  const handleSaveToPO = async () => {
    if (items.length === 0) return
    try {
      setIsSaving(true)
      setError(null)
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const randPart = Math.floor(100 + Math.random() * 900)
      const noPO = `PO/${datePart}/${randPart}`

      const res = await ocrService.saveToPurchaseOrder({
        supplierId: supplierId || undefined,
        supplierName: supplierName || 'Supplier Nota',
        nomorPO: noPO,
        tanggalBuat: scanResult?.tanggalNota || new Date().toISOString(),
        items,
        catatan: `Diimpor dari foto nota: ${fileName}. ${scanResult?.catatan || ''}`,
        updateStokDirectly,
      })

      setSavedPO(res)
      // Muat ulang bahan untuk memperbarui info stok
      loadContext()
    } catch (err: any) {
      console.error('Error saving PO from OCR:', err)
      setError(err?.message || 'Gagal menyimpan transaksi PO ke database')
    } finally {
      setIsSaving(false)
    }
  }

  return {
    apiKey,
    saveApiKey,
    routerUrl,
    routerKey,
    routerModel,
    saveRouterConfig,
    suppliers,
    bahanList,
    isLoadingContext,
    state,
    fileName,
    imagePreview,
    scanResult,
    items,
    supplierName,
    setSupplierName,
    supplierId,
    setSupplierId,
    updateStokDirectly,
    setUpdateStokDirectly,
    isSaving,
    savedPO,
    error,
    handleScanFile,
    handleUpdateItem,
    handleRemoveItem,
    handleAddItem,
    handleReset,
    handleSaveToPO,
  }
}
