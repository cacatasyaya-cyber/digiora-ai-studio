const MODEL = "gemini-3.8-flash";

exports.handler = async (event) => {
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
    return json(400, { error: "Data permintaan tidak valid." });
  }

  const title = clean(input.title, 180);
  const module = clean(input.module, 100);
  const pageCount = Math.max(
    1,
    Math.min(30, Number(input.pageCount) || 1)
  );

  if (!title || !module) {
    return json(400, { error: "Judul dan modul wajib diisi." });
  }

  const prompt = `Kamu adalah perancang materi pendidikan dan produk belajar. Buat konten dalam bahasa ${clean(input.language, 50) || "Bahasa Indonesia"}.

RINCIAN:
Modul: ${module}
Topik/judul: ${title}
Jumlah halaman: tepat ${pageCount}
Target usia/kelas: ${clean(input.age, 80)}
Kurikulum: ${clean(input.curriculum, 80)}
Gaya visual: ${clean(input.visualStyle, 100)}
Tingkat kesulitan: ${clean(input.difficulty, 50)}
Tujuan pembelajaran: ${clean(input.objective, 1000) || "Rumuskan tujuan yang sesuai dengan topik dan usia."}
Instruksi tambahan: ${clean(input.extra, 1500) || "Tidak ada."}

TUGAS:
Buat isi setiap halaman yang bervariasi, runtut, sesuai usia dan tujuan belajar. Untuk worksheet/LKPD sertakan instruksi dan soal yang jelas. Untuk komik susun adegan dan dialog. Untuk coloring book jelaskan objek gambar yang perlu diilustrasikan. Untuk activity/busy book buat aktivitas yang dapat dilakukan. Untuk catatan belajar buat penjelasan ringkas yang akurat dan contoh. Hindari pengulangan isi yang sama.

KELUARAN WAJIB:
Kembalikan JSON valid saja tanpa markdown:
{"pages":[{"title":"Judul halaman","body":"Materi halaman","task":"Instruksi aktivitas"}]}
Jumlah elemen pages harus tepat ${pageCount}.`;

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
            { role: "user", parts: [{ text: prompt }] }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 8192
          }
        })
      }
    );

    const result = await apiResponse.json();

    if (!apiResponse.ok) {
      const message = result?.error?.message ||
        `Gemini API merespons HTTP ${apiResponse.status}.`;
      return json(apiResponse.status === 429 ? 429 : 502, {
        error: message
      });
    }

    const text = result?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "").join("").trim();

    if (!text) {
      return json(502, {
        error: "Gemini mengembalikan jawaban kosong."
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return json(502, {
        error: "Format jawaban Gemini belum valid."
      });
    }

    if (!Array.isArray(parsed.pages) || !parsed.pages.length) {
      return json(502, {
        error: "Jawaban Gemini tidak berisi daftar halaman."
      });
    }

    return json(200, {
      pages: parsed.pages.slice(0, pageCount)
    });

  } catch (error) {
    return json(502, {
      error: "Tidak dapat menghubungi Gemini API."
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
