const MODEL = "gemini-3.8-flash";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Metode tidak diizinkan." });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return json(500, { error: "GEMINI_API_KEY belum tersedia pada Environment Variables Netlify untuk Functions." });
  let input;
  try { input = JSON.parse(event.body || "{}"); }
  catch { return json(400, { error: "Data formulir tidak valid." }); }
  const module = clean(input.module, 100);
  if (!module) return json(400, { error: "Modul belum dipilih." });
  const serialized = JSON.stringify(input, null, 2).slice(0, 18000);
  const instruction = `Kamu adalah arsitek prompt profesional untuk produk edukasi, ahli instructional design, visual design, dan prompt engineering lintas platform.

TUGAS UTAMA: UBAH SPESIFIKASI PENGGUNA DI BAWAH MENJADI SATU PROMPT UNIVERSAL YANG LENGKAP DAN SIAP DISALIN KE PLATFORM AI PILIHAN PENGGUNA.

PENTING: KELUARANMU ADALAH PROMPT, BUKAN PRODUK EDUKASI. Jangan membuat worksheet, halaman, cerita, komik, gambar, ilustrasi, PDF, atau materi jadi. Jangan mengeksekusi tugas kreatifnya. Tulis instruksi yang akan meminta AI tujuan mengerjakan tugas itu.

KETENTUAN UNIVERSAL:
1. Prompt harus platform-independent. Jangan menyebut bahwa prompt hanya untuk Gemini, ChatGPT, Claude, atau platform tertentu. Gunakan istilah netral seperti “AI”, “model AI”, atau “platform AI yang digunakan”.
2. Gunakan bahasa sesuai pilihan pengguna; bila tidak disebutkan, Bahasa Indonesia.
3. Pertahankan semua pilihan dan rincian pengguna. Jangan menghapus, mengganti, atau mengarang spesifikasi.
4. Susun prompt yang mandiri dan jelas: peran AI tujuan, tujuan, konteks, spesifikasi produk, target pengguna, struktur/halaman, isi dan aktivitas, arahan visual, format/ukuran, bahasa, batasan, pemeriksaan kualitas, dan format keluaran.
5. Bila jumlah halaman ditentukan, instruksikan jumlah tepat sesuai input. Jelaskan apakah cover dihitung atau tidak berdasarkan pilihan modul. Jangan menambah atau mengurangi halaman.
6. Bila ada unggahan, sebutkan nama file sebagai bahan referensi yang harus dilampirkan bersama prompt pada platform tujuan. Jangan mengklaim sudah membaca isi file. Instruksikan AI tujuan untuk membaca lampiran; jika tidak dapat membacanya, minta pengguna mengirim teks yang terbaca dan jangan mengarang isi.
7. Jika karakter/maskot dipilih, tetapkan konsistensi identitas karakter pada seluruh halaman. Jika tanpa maskot, larang penambahan maskot.
8. Jika gaya visual, ukuran, bahasa, atau elemen wajib ditentukan, jadikan persyaratan eksplisit dan konsisten.
9. Untuk kebutuhan visual/gambar, tulis arahan visual terperinci yang dapat dipakai di generator gambar yang mendukungnya. Jangan mengklaim prompt dapat memaksa semua platform memiliki fitur yang sama.
10. Jangan membuat referensi, fakta, kurikulum, rumus, atau sumber palsu. Bila riset diminta, minta AI tujuan menggunakan sumber tepercaya dan mencantumkannya; bedakan materi sumber pengguna dari tambahan riset.
11. Bila ada informasi penting yang kosong atau saling bertentangan, instruksikan AI tujuan mengajukan pertanyaan klarifikasi sebelum membuat hasil. Jangan menebak.
12. Prompt akhir harus profesional, rinci, praktis, tidak bertele-tele, dan siap copy-paste. Jangan menambahkan komentar di luar prompt.

PERSYARATAN KHUSUS MODUL:
- Worksheet Generator: aktivitas per halaman sesuai jumlah aktivitas maksimal, jenis aktivitas pilihan, variasi atau keseragaman, kotak identitas, cover tambahan, ruang jawaban, dan instruksi sesuai usia.
- Activity Book Creator: tema utama atau tema per halaman, ragam aktivitas, cover di luar hitungan halaman isi, tingkat kesulitan bertahap/seragam, variasi jenis aktivitas.
- Coloring Book Creator: bentuk mewarnai, kerumitan garis, komposisi, border, contoh warna/outline. Tekankan outline hitam bersih, tegas, area mewarnai luas, dan konsistensi objek/legenda bila relevan.
- Komik Edukasi Creator: tokoh, jumlah panel, gaya narasi, pesan edukasi, alur awal-perkembangan-penyelesaian, kesinambungan panel, dan konsistensi tokoh. Jika memungkinkan minta storyboard untuk ditinjau sebelum ilustrasi panel.
- Busy Book Creator: keterampilan motorik yang dipilih. Untuk pola fisik, uraikan bahan, komponen, ukuran, pola potong, jahitan/tempelan, bagian lepas-pasang, dan perakitan. Untuk digital, jelaskan interaksi setiap halaman.
- Catatan Belajar Creator: sumber materi harus jelas. Jika pengguna memilih melampirkan materi, lampiran wajib disertakan di platform tujuan; jangan mengarang jika belum ada. Jika riset diminta, gunakan sumber yang dapat diperiksa. Sertakan pembagian subtopik dan elemen catatan yang dipilih.
- LKPD Generator: selaraskan bentuk LKPD dengan mata pelajaran, kelas/fase, kurikulum dan tujuan. Eksperimen/observasi perlu alat-bahan, langkah, tabel pengamatan, simpulan bila relevan. Kunci jawaban guru harus terpisah dari lembar siswa. HOTS harus menuntut analisis/evaluasi/kreasi.
- Custom Product Studio: jangan membatasi produk pada jenis modul lain. Ikuti format, fungsi, komponen, interaksi, dan cara penggunaan yang dijelaskan pengguna. Minta klarifikasi bila deskripsi tidak cukup.

FORMAT OUTPUT YANG HARUS DIBUAT:
Berikan satu prompt utuh dengan judul dan bagian terstruktur. Akhiri prompt dengan checklist pemeriksaan hasil agar AI tujuan mengecek kesesuaian semua spesifikasi sebelum menyerahkan hasil. Jangan sertakan kalimat “dibuat oleh Gemini” atau menyebut mesin penyusun prompt ini.

DATA FORM PENGGUNA:
${serialized}`;
  try {
    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: instruction }] }],
        generationConfig: { temperature: 0.45, maxOutputTokens: 8192 }
      })
    });
    const result = await apiResponse.json().catch(() => ({}));
    if (!apiResponse.ok) {
      const message = result?.error?.message || `Gemini API merespons HTTP ${apiResponse.status}.`;
      return json(apiResponse.status === 429 ? 429 : 502, { error: message });
    }
    const prompt = result?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
    if (!prompt) return json(502, { error: "AI mengembalikan jawaban kosong. Silakan coba lagi." });
    return json(200, { prompt, model: MODEL });
  } catch (error) {
    return json(502, { error: "Tidak dapat menghubungi layanan AI. Periksa koneksi dan coba lagi." });
  }
};
function clean(value, max) { return String(value == null ? "" : value).replace(/[<>]/g, "").slice(0, max); }
function json(statusCode, body) { return { statusCode, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, body: JSON.stringify(body) }; }
