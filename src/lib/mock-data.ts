export type OrderStatus = 'menunggu' | 'diproses' | 'dikirim' | 'selesai'
export type Channel = 'WhatsApp' | 'Toko Langsung' | 'Katalog Online'
export type PaymentMethod = 'QRIS' | 'Transfer BCA' | 'Tunai / Cash' | 'GoPay/OVO'

export interface OrderItem {
  name: string
  qty: number
  price: number
  subtotal: number
}

export interface Order {
  id: string
  invoiceNumber: string
  customerName: string
  customerPhone: string
  items: OrderItem[]
  qtyTotal: number
  subtotal: number
  discount: number
  shippingFee: number
  totalPrice: number
  paymentMethod: PaymentMethod
  paymentStatus: 'Lunas' | 'Belum Dibayar'
  status: OrderStatus
  channel: Channel
  createdAt: string
  cashierName: string
  notes?: string
}

export interface Product {
  id: string
  name: string
  category: string
  stock: number
  price: number
  sold: number
  emoji: string
  sku: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  totalOrders: number
  totalSpent: number
  lastOrder: string
}

export interface RevenueData {
  date: string
  revenue: number
  orders: number
}

export const orders: Order[] = [
  {
    id: 'ORD-001',
    invoiceNumber: 'INV/20260908/ORD-001',
    customerName: 'Siti Rahayu',
    customerPhone: '0812-3456-7890',
    items: [
      { name: 'Keripik Pisang Original', qty: 3, price: 25000, subtotal: 75000 },
    ],
    qtyTotal: 3,
    subtotal: 75000,
    discount: 0,
    shippingFee: 10000,
    totalPrice: 85000,
    paymentMethod: 'QRIS',
    paymentStatus: 'Belum Dibayar',
    status: 'menunggu',
    channel: 'WhatsApp',
    createdAt: '08 Sep 2026, 08:12 WIB',
    cashierName: 'Budi (Admin)',
    notes: 'Kirim via Sameday kalau sudah lunas'
  },
  {
    id: 'ORD-002',
    invoiceNumber: 'INV/20260908/ORD-002',
    customerName: 'Budi Santoso',
    customerPhone: '0856-7890-1234',
    items: [
      { name: 'Sambal Rendang Kemasan', qty: 2, price: 45000, subtotal: 90000 },
      { name: 'Abon Sapi Premium', qty: 1, price: 75000, subtotal: 75000 }
    ],
    qtyTotal: 3,
    subtotal: 165000,
    discount: 15000,
    shippingFee: 0,
    totalPrice: 150000,
    paymentMethod: 'Transfer BCA',
    paymentStatus: 'Lunas',
    status: 'diproses',
    channel: 'Katalog Online',
    createdAt: '08 Sep 2026, 09:45 WIB',
    cashierName: 'System Otomatis',
    notes: 'Free ongkir promo September'
  },
  {
    id: 'ORD-003',
    invoiceNumber: 'INV/20260907/ORD-003',
    customerName: 'Dewi Lestari',
    customerPhone: '0878-2345-6789',
    items: [
      { name: 'Keripik Singkong Balado', qty: 5, price: 20000, subtotal: 100000 },
      { name: 'Keripik Tempe Krispi', qty: 2, price: 15000, subtotal: 30000 }
    ],
    qtyTotal: 7,
    subtotal: 130000,
    discount: 0,
    shippingFee: 15000,
    totalPrice: 145000,
    paymentMethod: 'Transfer BCA',
    paymentStatus: 'Lunas',
    status: 'dikirim',
    channel: 'WhatsApp',
    createdAt: '07 Sep 2026, 14:30 WIB',
    cashierName: 'Rian (Staff)',
    notes: 'No. Resi JNE: JNE882910399'
  },
  {
    id: 'ORD-004',
    invoiceNumber: 'INV/20260907/ORD-004',
    customerName: 'Andi Wijaya',
    customerPhone: '0821-4567-8901',
    items: [
      { name: 'Dodol Garut Cokelat', qty: 1, price: 55000, subtotal: 55000 }
    ],
    qtyTotal: 1,
    subtotal: 55000,
    discount: 0,
    shippingFee: 0,
    totalPrice: 55000,
    paymentMethod: 'Tunai / Cash',
    paymentStatus: 'Lunas',
    status: 'selesai',
    channel: 'Toko Langsung',
    createdAt: '07 Sep 2026, 10:00 WIB',
    cashierName: 'Budi (Kasir)',
    notes: 'Pelanggan bawa pulang langsung'
  },
  {
    id: 'ORD-005',
    invoiceNumber: 'INV/20260906/ORD-005',
    customerName: 'Rina Marlina',
    customerPhone: '0895-6789-0123',
    items: [
      { name: 'Keripik Pisang Original', qty: 4, price: 25000, subtotal: 100000 },
      { name: 'Brownies Kukus Cokelat', qty: 1, price: 60000, subtotal: 60000 }
    ],
    qtyTotal: 5,
    subtotal: 160000,
    discount: 10000,
    shippingFee: 12000,
    totalPrice: 162000,
    paymentMethod: 'GoPay/OVO',
    paymentStatus: 'Lunas',
    status: 'selesai',
    channel: 'Katalog Online',
    createdAt: '06 Sep 2026, 16:15 WIB',
    cashierName: 'System Otomatis'
  },
  {
    id: 'ORD-006',
    invoiceNumber: 'INV/20260906/ORD-006',
    customerName: 'Hendra Gunawan',
    customerPhone: '0812-8901-2345',
    items: [
      { name: 'Sambal Rendang Kemasan', qty: 3, price: 45000, subtotal: 135000 }
    ],
    qtyTotal: 3,
    subtotal: 135000,
    discount: 0,
    shippingFee: 18000,
    totalPrice: 153000,
    paymentMethod: 'Transfer BCA',
    paymentStatus: 'Lunas',
    status: 'dikirim',
    channel: 'WhatsApp',
    createdAt: '06 Sep 2026, 11:00 WIB',
    cashierName: 'Rian (Staff)',
    notes: 'No. Resi SiCepat: 002938102381'
  },
  {
    id: 'ORD-007',
    invoiceNumber: 'INV/20260908/ORD-007',
    customerName: 'Maya Sari',
    customerPhone: '0813-9922-1100',
    items: [
      { name: 'Brownies Kukus Cokelat', qty: 2, price: 60000, subtotal: 120000 }
    ],
    qtyTotal: 2,
    subtotal: 120000,
    discount: 5000,
    shippingFee: 0,
    totalPrice: 115000,
    paymentMethod: 'QRIS',
    paymentStatus: 'Belum Dibayar',
    status: 'menunggu',
    channel: 'Katalog Online',
    createdAt: '08 Sep 2026, 07:30 WIB',
    cashierName: 'System Otomatis',
    notes: 'Menunggu konfirmasi scan barcode QRIS'
  },
  {
    id: 'ORD-008',
    invoiceNumber: 'INV/20260908/ORD-008',
    customerName: 'Fajar Nugroho',
    customerPhone: '0857-1122-3344',
    items: [
      { name: 'Keripik Tempe Krispi', qty: 6, price: 15000, subtotal: 90000 }
    ],
    qtyTotal: 6,
    subtotal: 90000,
    discount: 0,
    shippingFee: 0,
    totalPrice: 90000,
    paymentMethod: 'Tunai / Cash',
    paymentStatus: 'Lunas',
    status: 'diproses',
    channel: 'Toko Langsung',
    createdAt: '08 Sep 2026, 10:20 WIB',
    cashierName: 'Budi (Kasir)'
  },
  {
    id: 'ORD-009',
    invoiceNumber: 'INV/20260905/ORD-009',
    customerName: 'Laila Nur',
    customerPhone: '0896-5544-3322',
    items: [
      { name: 'Dodol Garut Cokelat', qty: 2, price: 55000, subtotal: 110000 }
    ],
    qtyTotal: 2,
    subtotal: 110000,
    discount: 0,
    shippingFee: 15000,
    totalPrice: 125000,
    paymentMethod: 'Transfer BCA',
    paymentStatus: 'Lunas',
    status: 'selesai',
    channel: 'WhatsApp',
    createdAt: '05 Sep 2026, 13:45 WIB',
    cashierName: 'Rian (Staff)'
  },
  {
    id: 'ORD-010',
    invoiceNumber: 'INV/20260908/ORD-010',
    customerName: 'Rizky Pratama',
    customerPhone: '0812-7788-9900',
    items: [
      { name: 'Brownies Kukus Cokelat', qty: 1, price: 60000, subtotal: 60000 }
    ],
    qtyTotal: 1,
    subtotal: 60000,
    discount: 0,
    shippingFee: 10000,
    totalPrice: 70000,
    paymentMethod: 'QRIS',
    paymentStatus: 'Belum Dibayar',
    status: 'menunggu',
    channel: 'Katalog Online',
    createdAt: '08 Sep 2026, 11:05 WIB',
    cashierName: 'System Otomatis'
  },
]

export const products: Product[] = [
  { id: 'PRD-001', sku: 'SNK-PSNG-01', name: 'Keripik Pisang Original', category: 'Camilan', stock: 48, price: 25000, sold: 124, emoji: '🍌' },
  { id: 'PRD-002', sku: 'BMB-RDNG-02', name: 'Sambal Rendang Kemasan', category: 'Saus & Bumbu', stock: 3, price: 45000, sold: 87, emoji: '🌶️' },
  { id: 'PRD-003', sku: 'SNK-SNGK-03', name: 'Keripik Singkong Balado', category: 'Camilan', stock: 32, price: 20000, sold: 98, emoji: '🥔' },
  { id: 'PRD-004', sku: 'KUE-DDOL-04', name: 'Dodol Garut Cokelat', category: 'Kue & Manisan', stock: 0, price: 55000, sold: 56, emoji: '🍫' },
  { id: 'PRD-005', sku: 'KUE-BRWN-05', name: 'Brownies Kukus Cokelat', category: 'Kue & Manisan', stock: 12, price: 60000, sold: 73, emoji: '🎂' },
  { id: 'PRD-006', sku: 'SNK-TMPE-06', name: 'Keripik Tempe Krispi', category: 'Camilan', stock: 4, price: 15000, sold: 145, emoji: '🫘' },
  { id: 'PRD-007', sku: 'LUK-ABON-07', name: 'Abon Sapi Premium', category: 'Lauk Kering', stock: 19, price: 75000, sold: 42, emoji: '🥩' },
  { id: 'PRD-008', sku: 'LUK-SRND-08', name: 'Serundeng Kelapa Gurih', category: 'Lauk Kering', stock: 27, price: 35000, sold: 61, emoji: '🥥' },
]

export const customers: Customer[] = [
  { id: 'CST-001', name: 'Siti Rahayu', phone: '0812-3456-7890', totalOrders: 8, totalSpent: 620000, lastOrder: '08 Sep 2026' },
  { id: 'CST-002', name: 'Budi Santoso', phone: '0856-7890-1234', totalOrders: 5, totalSpent: 375000, lastOrder: '08 Sep 2026' },
  { id: 'CST-003', name: 'Dewi Lestari', phone: '0878-2345-6789', totalOrders: 12, totalSpent: 980000, lastOrder: '07 Sep 2026' },
  { id: 'CST-004', name: 'Andi Wijaya', phone: '0821-4567-8901', totalOrders: 3, totalSpent: 215000, lastOrder: '07 Sep 2026' },
  { id: 'CST-005', name: 'Rina Marlina', phone: '0895-6789-0123', totalOrders: 7, totalSpent: 560000, lastOrder: '06 Sep 2026' },
  { id: 'CST-006', name: 'Hendra Gunawan', phone: '0812-8901-2345', totalOrders: 4, totalSpent: 430000, lastOrder: '06 Sep 2026' },
]

export const revenueData: RevenueData[] = [
  { date: '2 Sep', revenue: 520000, orders: 8 },
  { date: '3 Sep', revenue: 380000, orders: 5 },
  { date: '4 Sep', revenue: 710000, orders: 11 },
  { date: '5 Sep', revenue: 430000, orders: 7 },
  { date: '6 Sep', revenue: 890000, orders: 14 },
  { date: '7 Sep', revenue: 650000, orders: 10 },
  { date: '8 Sep', revenue: 585000, orders: 9 },
]

export const stats = {
  totalRevenue: 585000,
  totalOrders: 10,
  totalProducts: 8,
  lowStockCount: 3,
}

export const formatRupiah = (num: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
