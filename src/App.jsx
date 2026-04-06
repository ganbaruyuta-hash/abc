import { useEffect, useState } from "react";

const STORAGE_KEY = "muscle-log-v2";
const MAX_IMAGE_SIZE = 1200;
const JPEG_QUALITY = 0.82;

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function compressImage(file) {
  const dataUrl = await readFileAsDataURL(file);
  const img = await loadImage(dataUrl);

  const ratio = Math.min(MAX_IMAGE_SIZE / img.width, MAX_IMAGE_SIZE / img.height, 1);
  const width = Math.round(img.width * ratio);
  const height = Math.round(img.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

export default function App() {
  const [ideal, setIdeal] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [note, setNote] = useState("");
  const [logs, setLogs] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSavingImage, setIsSavingImage] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved) {
        setIdeal(saved.ideal || null);
        setLogs(Array.isArray(saved.logs) ? saved.logs : []);
      }
    } catch (e) {
      console.error(e);
      setErrorMessage("保存データの読み込みに失敗しました。");
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ideal, logs }));
      setErrorMessage("");
    } catch (e) {
      console.error(e);
      setErrorMessage("画像が大きすぎて保存できませんでした。枚数を減らすか、画像を入れ直してください。");
    }
  }, [ideal, logs]);

  const handleImage = async (e, setter) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSavingImage(true);
      setErrorMessage("");
      const compressed = await compressImage(file);
      setter(compressed);
    } catch (e) {
      console.error(e);
      setErrorMessage("画像の読み込みに失敗しました。");
    } finally {
      setIsSavingImage(false);
      e.target.value = "";
    }
  };

  const saveLog = () => {
    if (!photo) {
      alert("写真を入れてください");
      return;
    }

    const now = new Date();
    const newLog = {
      id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
      photo,
      note,
      createdAt: now.toISOString(),
    };

    setLogs((prevLogs) => [newLog, ...prevLogs]);
    setPhoto(null);
    setNote("");
  };

  const deleteLog = (id) => {
    setLogs((prevLogs) => prevLogs.filter((log) => log.id !== id));
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 720,
        margin: "0 auto",
        fontFamily: "sans-serif",
        lineHeight: 1.5,
      }}
    >
      <h1>筋トレログ</h1>

      {errorMessage && (
        <div
          style={{
            background: "#fff4f4",
            color: "#b00020",
            border: "1px solid #f0caca",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          {errorMessage}
        </div>
      )}

      <section style={{ marginBottom: 32 }}>
        <h2>理想の姿</h2>
        {ideal ? (
          <img
            src={ideal}
            alt="理想の姿"
            style={{
              width: 220,
              maxWidth: "100%",
              display: "block",
              marginBottom: 12,
              borderRadius: 8,
            }}
          />
        ) : (
          <p>まだ理想の写真はありません</p>
        )}
        <input type="file" accept="image/*" onChange={(e) => handleImage(e, setIdeal)} />
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>今日の記録</h2>
        {photo && (
          <img
            src={photo}
            alt="今日の写真"
            style={{
              width: 220,
              maxWidth: "100%",
              display: "block",
              marginBottom: 12,
              borderRadius: 8,
            }}
          />
        )}
        <input type="file" accept="image/*" onChange={(e) => handleImage(e, setPhoto)} />
        <div style={{ marginTop: 12 }}>
          <textarea
            placeholder="一言"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{
              width: "100%",
              minHeight: 80,
              padding: 8,
              boxSizing: "border-box",
            }}
          />
        </div>
        <button
          onClick={saveLog}
          disabled={isSavingImage}
          style={{
            marginTop: 12,
            padding: "10px 16px",
            cursor: isSavingImage ? "not-allowed" : "pointer",
          }}
        >
          {isSavingImage ? "画像処理中..." : "保存"}
        </button>
      </section>

      <section>
        <h2>履歴</h2>
        {logs.length === 0 ? (
          <p>まだ履歴がありません</p>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <img
                  src={log.photo}
                  alt={log.createdAt}
                  style={{
                    width: 160,
                    maxWidth: "100%",
                    display: "block",
                    marginBottom: 8,
                    borderRadius: 8,
                  }}
                />
                <div><strong>{formatDate(log.createdAt)}</strong></div>
                <div style={{ margin: "8px 0" }}>{log.note || "メモなし"}</div>
                <button
                  onClick={() => deleteLog(log.id)}
                  style={{
                    padding: "6px 12px",
                    cursor: "pointer",
                  }}
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
