import { useEffect, useState } from "react";

const STORAGE_KEY = "muscle-log";

export default function App() {
  const [ideal, setIdeal] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [note, setNote] = useState("");
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) {
      setIdeal(saved.ideal);
      setLogs(saved.logs);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ideal, logs })
    );
  }, [ideal, logs]);

  const handleImage = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(reader.result);
    reader.readAsDataURL(file);
  };

  const saveLog = () => {
    if (!photo) return;
    setLogs([{ photo, note, date: new Date().toLocaleDateString() }, ...logs]);
    setPhoto(null);
    setNote("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>筋トレログ</h2>

      <h3>理想の姿</h3>
      {ideal && <img src={ideal} width="200" />}
      <input type="file" onChange={(e) => handleImage(e, setIdeal)} />

      <h3>今日の記録</h3>
      {photo && <img src={photo} width="200" />}
      <input type="file" onChange={(e) => handleImage(e, setPhoto)} />
      <br />
      <textarea
        placeholder="一言"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <br />
      <button onClick={saveLog}>保存</button>

      <h3>履歴</h3>
      {logs.map((log, i) => (
        <div key={i}>
          <img src={log.photo} width="100" />
          <div>{log.date}</div>
          <div>{log.note}</div>
        </div>
      ))}
    </div>
  );
}
