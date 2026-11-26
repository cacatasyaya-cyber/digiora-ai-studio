
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
      error: "GEMINI_API_KEY belum tersedia di Netlify."
    });
  }

  let input;

  try {
    input = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Data formulir tidak valid." });
  }

  const module = clean(input.module, 100);

  if (!module) {
    return json(400, { error: "Modul belum dipilih." });
  }

  const serialized = JSON.stringify(input, null, 2).slice(0, 18000);

  const instruction = `Kamu adalah arsitek prompt profesional, ahli instructional design, visual design, dan prompt engineering lintas platform.

TUGAS UTAMA:
Ubah seluruh spesifikasi pengguna menjadi satu MASTER PROMPT PRODUKSI yang lengkap, mandiri, terstruktur, profesional, detail, operasional, dan siap disalin ke platform AI pilihan pengguna.

PENTING:
Keluaranmu adalah MASTER PROMPT, BUKAN produk jadi.
Jangan langsung membuat worksheet, buku aktivitas, komik, LKPD, gambar, ilustrasi, cerita, atau produk akhir.
Tulis instruksi lengkap yang nantinya akan dijalankan oleh AI tujuan.

KETENTUAN UNIVERSAL:

1. MASTER PROMPT harus dapat digunakan lintas platform AI. Jangan mengunci prompt hanya untuk Gemini, ChatGPT, Claude, atau platform tertentu.

2. Gunakan bahasa sesuai pilihan pengguna. Jika tidak ditentukan, gunakan Bahasa Indonesia.

3. Pertahankan seluruh spesifikasi, pilihan, detail, batasan, dan kebutuhan pengguna. Jangan menghilangkan detail penting.

4. Master Prompt harus menjelaskan secara eksplisit:
- Peran AI tujuan.
- Tujuan dan hasil akhir.
- Konteks dan target pengguna.
- Spesifikasi produk.
- Struktur dan urutan halaman.
- Konten dan aktivitas.
- Arahan desain dan visual.
- Format dan ukuran.
- Bahasa.
- Batasan.
- Alur kerja.
- Pemeriksaan kualitas.

5. Jika jumlah halaman ditentukan, ikuti jumlah yang tepat. Jangan menambah atau mengurangi jumlah halaman. Jelaskan dengan tegas apakah cover termasuk atau di luar jumlah halaman.

6. Jika pengguna mengunggah atau menyebut file referensi, instruksikan AI tujuan untuk membaca dan menggunakan file tersebut. Jangan mengarang isi file yang belum dibaca.

7. Jika pengguna memilih karakter atau maskot, instruksikan AI tujuan menjaga konsistensi identitas karakter di seluruh halaman, ilustrasi, dan hasil. Jika pengguna memilih tanpa maskot, jangan menambahkan maskot.

8. Jika gaya visual, warna, ukuran, bahasa, format, elemen wajib, atau layout ditentukan, jadikan semuanya sebagai persyaratan wajib.

9. Jika produk membutuhkan visual, tuliskan arahan visual yang rinci dan praktis.

10. Jangan mengarang fakta, sumber, kurikulum, rumus, atau referensi.

11. Jika terdapat informasi penting yang kurang atau bertentangan, instruksikan AI tujuan meminta klarifikasi terlebih dahulu.

12. Master Prompt harus jelas, sistematis, rinci, profesional, tidak ambigu, dan siap copy-paste.

PERSYARATAN KHUSUS MODUL:

WORKSHEET GENERATOR:
Instruksikan pembuatan worksheet sesuai usia, jumlah halaman, aktivitas, tingkat kesulitan, ruang jawaban, instruksi, cover, kotak identitas, dan layout yang dipilih. Setiap halaman harus memiliki aktivitas yang jelas.

ACTIVITY BOOK CREATOR:
Perhatikan tema, jumlah halaman, jenis aktivitas, variasi aktivitas, cover di luar halaman isi jika dipilih, tingkat kesulitan, dan target usia.

COLORING BOOK CREATOR:
Instruksikan gambar outline hitam yang tegas, bersih, mudah diwarnai, tidak blur, area mewarnai sesuai usia, konsistensi objek, dan komposisi yang sesuai.

KOMIK EDUKASI CREATOR:
Perhatikan karakter, konsistensi tokoh, jumlah panel, alur cerita, dialog, pesan edukasi, urutan adegan, storyboard, dan kesinambungan visual.

BUSY BOOK CREATOR:
Perhatikan keterampilan, aktivitas motorik, komponen, bahan, ukuran, pola potong, mekanisme, bagian interaktif, petunjuk pembuatan, dan perakitan jika produk fisik. Jika digital, jelaskan interaksi setiap halaman.

CATATAN BELAJAR CREATOR:
Perhatikan materi sumber, subtopik, target pembelajaran, struktur catatan, ringkasan, contoh, visual, latihan, dan sumber referensi. Jangan mengarang isi materi sumber yang tidak tersedia.

LKPD GENERATOR:
Selaraskan LKPD dengan mata pelajaran, kelas, fase, kurikulum, tujuan pembelajaran, aktivitas, petunjuk, evaluasi, dan kebutuhan siswa. Eksperimen harus memiliki alat, bahan, prosedur, tabel pengamatan, dan simpulan jika relevan. Kunci jawaban guru harus terpisah dari lembar siswa.

CUSTOM PRODUCT STUDIO:
Jangan membatasi produk pada modul-modul sebelumnya. Ikuti seluruh deskripsi pengguna mengenai format, fungsi, struktur, komponen, interaksi, tujuan, dan cara penggunaan. Jika informasi kurang, minta klarifikasi.

FORMAT MASTER PROMPT:

Susun Master Prompt menggunakan struktur berikut jika relevan:

A. ROLE / PERAN AI
B. TUJUAN DAN HASIL AKHIR
C. KONTEKS DAN TARGET PENGGUNA
D. SPESIFIKASI DAN INPUT PENGGUNA
E. STRUKTUR DAN URUTAN HALAMAN
F. RINCIAN KONTEN DAN AKTIVITAS
G. ARAHAN VISUAL, DESAIN, DAN TATA LETAK
H. FORMAT, UKURAN, DAN TEKNIS
I. ATURAN, BATASAN, DAN LARANGAN
J. ALUR KERJA AI TUJUAN
K. QUALITY CONTROL DAN CHECKLIST

Sesuaikan struktur dengan produk yang diminta. Jangan menghilangkan spesifikasi penting.

Master Prompt harus berisi instruksi yang benar-benar dapat dijalankan, bukan sekadar deskripsi singkat.

Akhiri dengan checklist validasi yang dapat digunakan AI tujuan untuk memeriksa hasil sebelum menyerahkannya.

Jangan sertakan komentar di luar MASTER PROMPT.
Jangan menyebut mesin penyusun prompt ini.
Jangan menyebut bahwa prompt dibuat oleh Gemini.

DATA FORM PENGGUNA:

${serialized}`;

  try {
    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
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
        `Gemini API merespons HTTP ${apiResponse.status}.`;

      return json(apiResponse.status === 429 ? 429 : 502, {
        error: message
      });
    }

    const prompt = result?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("")
      .trim();

    if (!prompt) {
      return json(502, {
        error: "AI mengembalikan jawaban kosong. Silakan coba lagi."
      });
    }

    return json(200, {
      prompt,
      model: MODEL
    });

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
