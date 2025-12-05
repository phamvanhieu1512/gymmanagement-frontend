import React, { useEffect, useRef, useState } from "react";
 
function MessagePage({

  peerId = "68ff36d578fc9208ee291a83",
  userId = "68e79f4f6b9ee7a03723e90a",

}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  // Tự động kéo xuống cuối
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Lấy lịch sử tin nhắn từ backend
  const loadHistory = async () => {
    try {
      const res = await fetch("http://localhost:5000/message", {
        method: "POST", // backend đang lấy req.body ❗
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const result = await res.json();
      if (result.success) {
        setMessages(result.data);
      }
    } catch (err) {
      console.error("Load history error:", err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [userId]);

  // Kết nối WebSocket
  useEffect(() => {
    ws.current = new WebSocket("ws://192.168.39.225:5000");


    ws.current.onopen = () => {
      console.log("WS Connected");

      ws.current.send(
        JSON.stringify({
          type: "login",
          userId,
        })
      );
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Chỉ nhận tin đúng đối tượng
      if (
        (data.from === peerId && data.to === userId) ||
        (data.from === userId && data.to === peerId)
      ) {
        setMessages((prev) => [...prev, data]);
      }
    };

    ws.current.onerror = (err) => console.error("WS Error:", err);
    ws.current.onclose = () => console.log("WS Closed");

    return () => ws.current.close();
  }, [userId, peerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gửi tin
  const sendMessage = () => {
    if (!text.trim()) return;

    const payload = {
      type: "message",
      from: userId,
      to: peerId,
      text,
      timestamp: new Date().toISOString(),
    };

    ws.current.send(JSON.stringify(payload));

    // Hiển thị ngay trên UI
    setMessages((prev) => [...prev, payload]);

    setText("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Chat với {peerId}</h2>

      <div
        style={{
          height: 400,
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: 10,
          marginBottom: 10,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              textAlign: m.from === userId ? "right" : "left",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                padding: 10,
                background: m.from === userId ? "#007bff" : "#eaeaea",
                color: m.from === userId ? "#fff" : "#000",
                borderRadius: 6,
                display: "inline-block",
                maxWidth: "70%",
              }}
            >
              {m.text}
            </span>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập tin nhắn..."
          style={{ flex: 1, padding: 10 }}
        />
        <button onClick={sendMessage}>Gửi</button>
      </div>
    </div>
  );
}

export default MessagePage;
