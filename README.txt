
const MODEL = "gemini-3.8-flash";

exports.handler = async (event) => {
  const json = (statusCode, body) => ({
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    },
    body: JSON.stringify(body)
  });

  if (event.httpMethod === "OPTIONS") {
    return json(200, {});
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Metode tidak diizinkan." });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return json(500, {
      error: "GEMINI_API_KEY belum tersedia di Environment Variables Netlify."
    });
  }

  let input;

  try {
    input = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Data formulir tidak valid." });
  }

  const moduleName = clean(input.module, 100);

  if (!moduleName) {
    return json(400, { error: "Modul belum dipilih." });
  }

  const userSpecs = JSON.stringify(input, null, 2).slice(0, 18000);

  const instruction = `Kamu adalah MASTER PROMPT ARCHITECT profesional, ahli instructional design, desain produk edukasi, visual design, prompt engineering, serta pengembangan materi pendidikan untuk berbagai usia.

TUGAS UTAMA:
Ubah spesifikasi dan data pengguna berikut menjadi satu MASTER PROMPT FINAL yang LENGKAP, TERSTRUKTUR, DETAIL, PROFESIONAL, dan SIAP COPY-PASTE ke platform AI pilihan pengguna.

NAMA PRODUK/MODUL:
${moduleName}

SPESIFIKASI PENGGUNA:
${userSpecs}

ATURAN UNIVERSAL:

1. Keluaranmu harus berupa MASTER PROMPT yang siap digunakan langsung pada platform AI tujuan.
2. Jangan menghasilkan produk jadi. Jangan membuat worksheet, gambar, cerita, komik, PDF, atau materi jadi. Tugasmu adalah menyusun instruksi produksi untuk AI tujuan.
3. Jangan memberikan draft singkat, outline kosong, template placeholder, saran, atau jawaban percakapan biasa.
4. Jangan meminta pengguna menjelaskan ulang data yang sudah tersedia.
5. Jangan menghilangkan spesifikasi pengguna.
6. Jangan mengubah jumlah halaman, ukuran, orientasi, target usia, jenis aktivitas, tema, gaya visual, bahasa, maupun batasan yang diminta.
7. Master Prompt harus bersifat universal dan dapat digunakan pada berbagai platform AI, bukan khusus Gemini, ChatGPT, Claude, atau platform tertentu.
8. Gunakan bahasa sesuai pilihan pengguna. Jika tidak ditentukan, gunakan Bahasa Indonesia.
9. Jangan mengarang informasi, sumber, fakta, referensi, atau isi lampiran yang tidak tersedia.
10. Jika pengguna mengunggah file, sebutkan nama file dan instruksikan AI tujuan untuk membaca serta menggunakan lampiran tersebut. Jangan mengklaim telah membaca isi file.
11. Jika file tidak dapat dibaca oleh AI tujuan, instruksikan agar AI meminta materi terbaca, bukan mengarang.
12. Jika karakter atau maskot ditentukan, pertahankan konsistensi identitas, penampilan, warna, pakaian, dan karakteristiknya pada seluruh bagian.
13. Jika tidak ada maskot yang diminta, jangan menambahkan maskot secara sembarangan.
14. Jika jumlah halaman ditentukan, instruksikan AI tujuan menghasilkan jumlah halaman yang tepat.
15. Pastikan setiap halaman atau bagian memiliki konten yang spesifik, bukan sekadar pengulangan.
16. Jika terdapat informasi yang saling bertentangan atau benar-benar penting tetapi tidak tersedia, instruksikan AI tujuan mengajukan klarifikasi sebelum produksi.
17. Master Prompt harus operasional, jelas, rinci, sistematis, dan tidak ambigu.
18. Jangan menyertakan komentar di luar Master Prompt.

PERSYARATAN KHUSUS MODUL:

WORKSHEET GENERATOR:
Perhatikan jumlah halaman, aktivitas per halaman, jenis aktivitas, tingkat kesulitan, target usia, ruang jawaban, kotak identitas, cover, instruksi anak, dan variasi aktivitas. Pastikan layout sesuai kebutuhan pengguna.

ACTIVITY BOOK CREATOR:
Perhatikan tema utama atau tema per halaman, jumlah halaman, cover, ragam aktivitas, tingkat kesulitan, progres pembelajaran, dan variasi aktivitas. Cover harus mengikuti ketentuan jumlah halaman pengguna.

COLORING BOOK CREATOR:
Perhatikan objek, tema, target usia, kompleksitas gambar, outline hitam yang bersih dan tegas, area mewarnai yang luas, komposisi, border, konsistensi objek, dan format halaman.

KOMIK EDUKASI CREATOR:
Perhatikan karakter, konsistensi karakter, alur cerita, jumlah panel, dialog, narasi, pesan edukasi, urutan panel, konflik, penyelesaian, serta kesinambungan visual. Jika relevan, buat storyboard sebelum ilustrasi final.

BUSY BOOK CREATOR:
Perhatikan keterampilan yang dikembangkan, aktivitas, bahan, ukuran, komponen, pola potong, bagian lepas-pasang, metode perakitan, keamanan, dan cara penggunaan. Untuk produk digital, jelaskan interaksi setiap halaman.

CATATAN BELAJAR CREATOR:
Perhatikan materi sumber, mata pelajaran, subtopik, target pembelajaran, struktur catatan, rangkuman, contoh, ilustrasi, latihan, dan elemen yang dipilih. Gunakan sumber yang dapat dipertanggungjawabkan apabila riset diminta.

LKPD GENERATOR:
Perhatikan mata pelajaran, kelas atau fase, kurikulum, tujuan pembelajaran, kegiatan, alat dan bahan, langkah kerja, tabel pengamatan, pertanyaan analisis, kesimpulan, asesmen, serta kunci jawaban terpisah jika diminta. Aktivitas HOTS harus benar-benar melibatkan analisis, evaluasi, atau kreasi.

CUSTOM PRODUCT STUDIO:
Jangan membatasi produk pada format modul lain. Ikuti deskripsi pengguna mengenai jenis produk, fungsi, format, komponen, struktur, interaksi, target, desain, dan cara penggunaan. Buat spesifikasi produksi yang lengkap sesuai kebutuhan.

STRUKTUR MASTER PROMPT WAJIB:

A. ROLE / PERAN AI
Tetapkan peran, keahlian, dan tanggung jawab AI tujuan.

B. TUJUAN DAN HASIL AKHIR
Jelaskan produk yang harus dibuat, tujuan, fungsi, dan hasil akhir yang diharapkan.

C. KONTEKS DAN TARGET PENGGUNA
Jelaskan target usia, pengguna, konteks pendidikan, kemampuan, dan kebutuhan.

D. SPESIFIKASI PRODUK
Masukkan seluruh spesifikasi pengguna secara lengkap dan akurat.

E. STRUKTUR DAN URUTAN
Susun halaman, bagian, unit, bab, panel, atau komponen sesuai kebutuhan produk. Pastikan jumlah tepat.

F. RINCIAN KONTEN
Jelaskan isi setiap halaman atau bagian, aktivitas, instruksi, materi, pertanyaan, contoh, dan elemen wajib.

G. ARAHAN VISUAL DAN DESAIN
Jelaskan gaya ilustrasi, warna, tipografi, layout, komposisi, konsistensi, ruang, ukuran elemen, dan detail visual sesuai kebutuhan.

H. FORMAT DAN TEKNIS
Jelaskan ukuran, orientasi, format, bahasa, resolusi, keterbacaan, dan aspek teknis yang diminta.

I. ATURAN DAN BATASAN
Jelaskan hal wajib, hal yang dilarang, konsistensi, akurasi, batasan, serta aturan produksi.

J. ALUR KERJA AI
Instruksikan AI tujuan untuk:
1. Memahami seluruh spesifikasi.
2. Memeriksa konsistensi kebutuhan.
3. Menyusun struktur produksi.
4. Mengembangkan konten setiap bagian.
5. Menghasilkan desain atau produk sesuai kemampuan platform.
6. Memeriksa keseluruhan hasil.
7. Memperbaiki kesalahan sebelum menyerahkan hasil.

K. QUALITY CONTROL
Buat checklist pemeriksaan yang mencakup:
- Semua spesifikasi pengguna terpenuhi.
- Jumlah halaman atau bagian tepat.
- Tidak ada bagian yang terlewat.
- Konten sesuai target usia.
- Konten relevan dengan tujuan.
- Bahasa benar dan mudah dipahami.
- Desain konsisten.
- Tidak ada informasi atau elemen yang tidak diminta.
- Tidak ada kesalahan teknis yang diketahui.
- Hasil akhir siap digunakan sesuai kemampuan platform AI.

FORMAT AKHIR:
Susun satu MASTER PROMPT FINAL yang utuh, detail, sistematis, profesional, dan siap disalin.
Jangan menyertakan penjelasan di luar Master Prompt.
Jangan menyebut mesin penyusun prompt ini.
Jangan menyebut "dibuat oleh Gemini".
Akhiri dengan checklist validasi hasil.

`;

  try {
    const apiResponse = await fetch(
      \`https://generativelanguage.googleapis.com/v1beta/models/\${MODEL}:generateContent\`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: instruction }]
            }
          ],
          generationConfig: {
            temperature: 0.45,
            maxOutputTokens: 8192
          }
        })
      }
    );

    const result = await apiResponse.json().catch(() => ({}));

    if (!apiResponse.ok) {
      const message =
        result?.error?.message ||
        \`Gemini API merespons HTTP \${apiResponse.status}.\`;

      return json(apiResponse.status === 429 ? 429 : 502, {
        error: message
      });
    }

    const prompt = result?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!prompt) {
      return json(502, {
        error: "AI mengembalikan jawaban kosong. Silakan coba lagi."
      });
    }

    return json(200, { prompt, model: MODEL });

  } catch (error) {
    return json(502, {
      error: "Tidak dapat menghubungi layanan AI. Periksa koneksi dan coba lagi."
    });
  }
};

function clean(value, max) {
  return String(value == null ? "" : value)
    .replace(/[<>]/g, "")
    .slice(0, max);
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(body)
  };
}
