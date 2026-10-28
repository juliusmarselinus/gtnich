export interface CartItem {
  menuId: string
  namaMenu: string
  kategori: string
  emoji: string
  hargaJual: number
  hpp: number
  cartQty: number
  resep?: Array<{
    bahanId: string
    namaBahan: string
    qty: number // takaran per porsi (dalam satuan master bahan)
    satuan: string
  }>
}

export interface CheckoutFormInput {
  customerName?: string
  customerPhone?: string
  channel: string // WhatsApp, Toko Offline, GrabFood, GoFood, dsb.
  paymentMethod: string // Tunai / Cash, QRIS, Transfer BCA, Mandiri, dsb.
  cashierName?: string
  notes?: string
  discount?: number
}

export interface OrderItemRecord {
  id?: string
  orderId?: string
  menuId: string | null
  namaMenu: string
  qty: number
  hargaJual: number
  hpp: number
  subtotal: number
}

export interface OrderRecord {
  id: string
  userId: string
  customerId?: string | null
  invoiceNumber: string
  customerName: string
  customerPhone?: string | null
  channel: string
  status: string
  paymentMethod: string
  paymentStatus: string
  subtotal: number
  discount: number
  shippingFee: number
  totalPrice: number
  totalHPP: number
  profit: number
  cashierName: string
  notes?: string | null
  createdAt: string
  updatedAt: string
  items?: OrderItemRecord[]
}
