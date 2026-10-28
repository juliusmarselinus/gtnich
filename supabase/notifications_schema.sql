-- ==============================================================================
-- DapurTwin / OrderHub - Skema Tabel Notifikasi & Logika Triggers
-- Jalankan query SQL ini di Supabase SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

-- 1. Buat Tabel Notifikasi
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  detail TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'system', -- 'penjualan', 'po', 'stok', 'tagihan', 'system'
  link VARCHAR(255),                          -- tautan aksi (/dashboard/penjualan, /dashboard/purchase-order, dll)
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index performa query notifikasi
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
  ON public.notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON public.notifications(user_id, is_read) 
  WHERE is_read = false;

-- Aktifkan RLS (Row Level Security)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy RLS Notifikasi
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications" 
  ON public.notifications FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" 
  ON public.notifications FOR DELETE 
  USING (auth.uid() = user_id);


-- ==============================================================================
-- 2. Trigger Otomatis: Notifikasi Saat Penjualan Baru Selesai (orders)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.fn_notify_on_new_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, detail, type, link, metadata)
  VALUES (
    NEW.user_id,
    'Penjualan Kasir Baru (' || NEW.invoice_number || ')',
    'Transaksi selesai sebesar Rp ' || TO_CHAR(NEW.total_price, 'FM999,999,999') || 
    ' melalui ' || COALESCE(NEW.channel, 'Kasir Langsung') || 
    ' (' || COALESCE(NEW.payment_method, 'Tunai') || ').',
    'penjualan',
    '/dashboard/riwayat',
    jsonb_build_object(
      'order_id', NEW.id,
      'invoice_number', NEW.invoice_number,
      'total_price', NEW.total_price
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_new_order ON public.orders;
CREATE TRIGGER trg_notify_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_on_new_order();


-- ==============================================================================
-- 3. Trigger Otomatis: Notifikasi Saat Stok Bahan Baku Menipis (bahan)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.fn_notify_on_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Cek jika stok berada di bawah atau sama dengan stok_minimum dan stok sebelumnya masih di atas batas
  IF (NEW.stok <= NEW.stok_minimum AND (OLD.stok IS NULL OR OLD.stok > NEW.stok_minimum)) THEN
    INSERT INTO public.notifications (user_id, title, detail, type, link, metadata)
    VALUES (
      NEW.user_id,
      'Peringatan Stok Menipis: ' || NEW.nama,
      'Stok ' || NEW.nama || ' tersisa ' || NEW.stok || ' ' || NEW.satuan || 
      ' (Batas minimum: ' || NEW.stok_minimum || ' ' || NEW.satuan || '). Segera lakukan restock PO.',
      'stok',
      '/dashboard/purchase-order',
      jsonb_build_object(
        'bahan_id', NEW.id,
        'nama', NEW.nama,
        'stok', NEW.stok,
        'stok_minimum', NEW.stok_minimum
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_low_stock ON public.bahan;
CREATE TRIGGER trg_notify_low_stock
  AFTER UPDATE OF stok ON public.bahan
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_on_low_stock();


-- ==============================================================================
-- 4. Trigger Otomatis: Notifikasi Perubahan Status Purchase Order (purchase_orders)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.fn_notify_on_po_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Notifikasi saat barang PO diterima
  IF (NEW.status = 'diterima' AND (OLD.status IS DISTINCT FROM 'diterima')) THEN
    INSERT INTO public.notifications (user_id, title, detail, type, link, metadata)
    VALUES (
      NEW.user_id,
      'Barang PO Diterima (' || NEW.no_po || ')',
      'Pasokan bahan dari ' || COALESCE(NEW.nama_supplier, 'Supplier') || 
      ' telah berhasil diverifikasi dan stok gudang otomatis bertambah.',
      'po',
      '/dashboard/purchase-order',
      jsonb_build_object('po_id', NEW.id, 'no_po', NEW.no_po)
    );
  -- Notifikasi saat tagihan PO diterbitkan
  ELSIF (NEW.status = 'tagihan' AND (OLD.status IS DISTINCT FROM 'tagihan')) THEN
    INSERT INTO public.notifications (user_id, title, detail, type, link, metadata)
    VALUES (
      NEW.user_id,
      'Tagihan PO Baru (' || NEW.no_po || ')',
      'Tagihan distributor dari ' || COALESCE(NEW.nama_supplier, 'Supplier') || 
      ' sebesar Rp ' || TO_CHAR(COALESCE(NEW.total_aktual, NEW.total_estimasi, 0), 'FM999,999,999') || 
      ' siap untuk dibayarkan.',
      'tagihan',
      '/dashboard/tagihan',
      jsonb_build_object('po_id', NEW.id, 'no_po', NEW.no_po)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_po_status ON public.purchase_orders;
CREATE TRIGGER trg_notify_po_status
  AFTER UPDATE OF status OR INSERT ON public.purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_notify_on_po_status();
