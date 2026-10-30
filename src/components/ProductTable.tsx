import { Product, formatRupiah } from '@/lib/mock-data'
import { Plus } from 'lucide-react'

interface ProductTableProps {
  products: Product[]
  onAddStock?: (id: string) => void
}

export default function ProductTable({ products, onAddStock }: ProductTableProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-[#FFFFFF] rounded-xl p-4 border border-[#EAE5DF] shadow-2xs hover:border-[#DCD6CD] transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between">
              <span className="text-2xl">{product.emoji}</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  product.stock === 0
                    ? 'bg-[#FAEDE8] text-[#C85A32] border border-[#F0D4C9]'
                    : product.stock < 5
                    ? 'bg-[#FAF8F5] text-[#C85A32] border border-[#EAE5DF]'
                    : 'bg-[#FFF6EC] text-[#FF8F2B] border border-[#FFE2C2]'
                }`}
              >
                {product.stock === 0 ? 'Habis' : `${product.stock} pcs`}
              </span>
            </div>

            <div className="mt-3">
              <p className="text-[10px] text-[#9C9589] font-mono">{product.sku}</p>
              <h4 className="text-xs font-semibold text-[#1F1D1A] mt-0.5 leading-snug">
                {product.name}
              </h4>
              <p className="text-[10px] text-[#6B665F] mt-0.5">{product.category}</p>
            </div>

            <p className="text-sm font-mono font-semibold text-[#1F1D1A] mt-3">
              {formatRupiah(product.price)}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F4F0EB] flex items-center justify-between">
            <span className="text-[10px] text-[#9C9589] font-mono">
              Terjual: {product.sold} pcs
            </span>
            <button
              type="button"
              onClick={() => onAddStock && onAddStock(product.id)}
              className="text-[11px] font-bold text-[#FF8F2B] hover:text-[#E67215] py-1 px-2.5 hover:bg-[#FFF6EC] rounded-lg transition-colors cursor-pointer"
            >
              + Tambah Stok
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
