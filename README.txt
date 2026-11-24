DIGIORA AI STUDIO — UNIVERSAL PROMPT GENERATOR

Isi paket:
- index.html: aplikasi web mandiri dengan 8 formulir khusus dan panel Hasil Prompt.
- netlify/functions/generate.js: backend aman untuk menyusun prompt melalui Gemini API.
- netlify.toml: konfigurasi direktori Netlify Functions.

PENTING:
1. Pertahankan GEMINI_API_KEY sebagai Environment Variable di Netlify. Jangan masukkan API key ke file HTML atau GitHub.
2. Model backend: gemini-3.8-flash.
3. Hasil aplikasi adalah prompt universal untuk digunakan di platform AI pilihan pengguna, bukan gambar atau produk jadi.
4. Riwayat prompt disimpan lokal di browser/perangkat pengguna.
5. File yang dipilih pada kolom unggahan hanya meneruskan nama file ke prompt. Pengguna tetap perlu melampirkan file tersebut ketika menjalankan prompt di platform AI tujuan.
6. Setelah file diunggah ke repository GitHub yang terhubung, tunggu Netlify melakukan deploy otomatis.
