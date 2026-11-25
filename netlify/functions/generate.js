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

  const moduleName = String(input.module || "").trim();

  if (!moduleName) {
    return json(400, { error: "Modul belum dipilih." });
  }

  const userSpecs = JSON.stringify(input, null, 2).slice(0, 18000);

  const instruction = `
Kamu adalah MASTER PROMPT ARCHITECT profesional, ahli instructional design,
desain produk edukasi, visual design, prompt engineering, serta pengembangan
materi pendidikan untuk berbagai usia.

TUGAS UTAMA:
Ubah spesifikasi dan data pengguna berikut menjadi SATU MASTER PROMPT FINAL,
LENGKAP, TERSTRUKTUR, DETAIL, PROFESIONAL, dan SIAP COPY-PASTE ke platform
AI pilihan pengguna.

NAMA PRODUK/MODUL:
${moduleName}

SPESIFIKASI PENGGUNA:
${userSpecs}

ATURAN OUTPUT WAJIB:

1. Keluaranmu harus berupa MASTER PROMPT yang siap digunakan langsung.
2. Jangan menghasilkan penjelasan tentang cara membuat prompt.
3. Jangan memberikan draft singkat, outline kosong, template placeholder,
   saran, atau jawaban percakapan biasa.
4. Jangan meminta pengguna menjelaskan ulang data yang sudah tersedia.
5. Jangan menghilangkan spesifikasi pengguna.
6. Jangan mengubah jumlah halaman, ukuran, orientasi, target usia,
   jenis aktivitas, tema, gaya visual, bahasa, maupun batasan yang diminta.
7. Jika tujuan pembelajaran tidak tersedia, tentukan tujuan yang relevan
   berdasarkan tema, target usia, dan jenis produk, secara wajar.
8. MASTER PROMPT harus memuat:
   - Peran AI yang spesifik dan profesional.
   - Tujuan pembuatan produk.
   - Konteks dan target pengguna.
   - Spesifikasi produk secara lengkap.
   - Struktur dan jumlah halaman yang tepat.
   - Detail isi setiap halaman.
   - Instruksi aktivitas atau konten yang konkret.
   - Arahan layout dan komposisi.
   - Arahan visual, ilustrasi, warna, tipografi, dan keterbacaan.
   - Ukuran, orientasi, dan format output.
   - Bahasa yang sesuai target pengguna.
   - Batasan dan hal yang harus dihindari.
   - Checklist quality control sebelum hasil diserahkan.
9. Jika produk berupa worksheet, activity book, coloring book, busy book,
   LKPD, komik, catatan belajar, atau produk edukasi lainnya, sesuaikan
   struktur master prompt dengan karakteristik produk tersebut.
10. Instruksi harus cukup detail agar platform AI tujuan tidak perlu
    menebak-nebak spesifikasi.
11. Untuk produk visual, jelaskan komposisi dan elemen visual secara konkret.
12. Hindari referensi, fakta, atau kurikulum fiktif.
13. Jika pengguna meminta hasil berupa prompt untuk menghasilkan gambar,
    jelaskan instruksi visual secara lengkap dan tegas.
14. Jika pengguna meminta blueprint, jangan mengubahnya menjadi produk jadi.
    Jika pengguna meminta produk visual langsung, arahkan AI tujuan untuk
    menghasilkan produk sesuai permintaan.
15. Gunakan Bahasa Indonesia yang jelas, profesional, dan mudah dipahami.
16. Susun prompt dengan heading dan daftar instruksi yang rapi.
17. Jangan membungkus keseluruhan master prompt dengan tanda kutip.
18. Jangan menyertakan kalimat pembuka seperti "Berikut prompt Anda".
19. Jangan menampilkan analisis, penjelasan, atau komentar di luar prompt.
20. Hasil akhir harus menjadi satu MASTER PROMPT UTUH yang bisa langsung
    disalin pengguna tanpa perlu mengedit atau menyusun ulang.

KELUARKAN MASTER PROMPT FINAL SAJA.
`;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" +
        MODEL +
        ":generateContent?key=" +
        encodeURIComponent(apiKey),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: instruction }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return json(response.status, {
        error:
          data?.error?.message ||
          "Gagal menghubungi Gemini API."
      });
    }

    const result =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("\n")
        .trim();

    if (!result) {
      return json(502, {
        error: "Gemini tidak menghasilkan master prompt."
      });
    }

    return json(200, {
      prompt: result,
      model: MODEL
    });
  } catch (error) {
    return json(500, {
      error: "Terjadi kesalahan saat menghubungi Gemini API."
    });
  }
};
