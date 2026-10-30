<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UI & UX Design Rules (Anti-Slop)

- **Dilarang keras menggunakan label/badge dekoratif hampa informasi**:
  - Jangan menambahkan teks klise seperti *"Kondisi Dapur Hari Ini"* atau sejenisnya yang dipadukan dengan icon bintang (`Sparkles`, `Star`, atau icon dekoratif sejenis dari `lucide-react`).
  - Elemen dekoratif semacam ini tidak menambah informasi operasional yang berguna bagi pengguna dan merupakan indikasi klise AI Slop.
  - Setiap label, badge, atau indikator di antarmuka harus memuat informasi fungsional nyata (misal: status stok kritis, angka perubahan nominal, atau status koneksi dapur).
