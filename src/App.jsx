import { useEffect, useState } from "react";

const STORAGE_KEY = "muscle-log";

export default function App() {
  const [ideal, setIdeal] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [note, setNote] = useState("");
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved) {
        setIdeal(saved.ideal || null);
        setLogs(Array.isArray(saved.logs) ? saved.logs : []);
      }
    } catch (e) {
      console.error("保存データの読み込みに失敗しました", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ideal, logs })
    );
  }, [ideal, logs]);

  const handleImage = (e, setter) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setter(reader.result);
    reader.readAsDataURL(file);
  };

  const saveLog = () => {
    if (!photo) {
      alert("写真を入れてください");
      return;
    }

    const newLog = {
      id: Date.now(),
      photo,
      note,
      date: new Date().toLocaleDateString(),
    };

    setLogs((prevLogs) => [newLog, ...prevLogs]);
    setPhoto(null);
    setNote("");
  };

  const deleteLog = (id) => {
    setLogs((prevLogs) => prevLogs.filter((log) => log.id !== id));
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
          style={{
            marginTop: 12,
            padding: "10px 16px",
            cursor: "pointer",
          }}
        >
          保存
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
                  alt={log.date}
                  style={{
                    width: 160,
                    maxWidth: "100%",
                    display: "block",
                    marginBottom: 8,
                    borderRadius: 8,
                  }}
                />
                <div><strong>{log.date}</strong></div>
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
