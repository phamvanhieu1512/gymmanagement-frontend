import React, { useEffect, useRef, useState } from "react";

function MessagePage({
  userId = "68ff36d578fc9208ee291a83",
  peerId = "68e79f4f6b9ee7a03723e90a",
}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadHistory = async () => {
    try {
      const res = await fetch("http://localhost:5000/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const result = await res.json();
      if (result.success) setMessages(result.data);
    } catch (err) {
      console.error("Load history error:", err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [userId]);

  useEffect(() => {
    ws.current = new WebSocket("ws://192.168.39.225:5000");

    ws.current.onopen = () => {
      ws.current.send(
        JSON.stringify({
          type: "login",
          userId,
        })
      );
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Chỉ nhận tin đúng người chat
      if (
        (data.from === peerId && data.to === userId) ||
        (data.from === userId && data.to === peerId)
      ) {
        setMessages((prev) => [...prev, data]);
      }
    };

    ws.current.onerror = (err) => console.error("WS Error:", err);
    ws.current.onclose = () => console.log("WebSocket closed");

    return () => ws.current.close();
  }, [userId, peerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    const cleanText = text.trim();
    if (!cleanText) return;

    const payload = {
      type: "message",
      from: userId,
      to: peerId,
      text: cleanText,
      timestamp: new Date().toISOString(),
    };

    ws.current.send(JSON.stringify(payload));
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{
        height: "100%",
        // background: "#f0f2f5",
        padding: "20px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "750px",
          height: "85vh",
          background: "#ffffff",
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "15px 20px",
            borderBottom: "1px solid #e5e5e5",
            fontSize: 16,
            fontWeight: 600,
            background: "#ddd",
          }}
        >
          Đang nhắn với: {peerId}
        </div>

        {/* CHAT AREA */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            background: "#f6f7f9",
            overflowY: "auto",
          }}
        >
          {messages.map((m, i) => {
            const isMe = m.from === userId;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: isMe ? "flex-end" : "flex-start",
                  marginBottom: 15,
                }}
              >
                <div
                  style={{
                    maxWidth: "65%",
                    padding: "10px 15px",
                    borderRadius: 14,
                    background: isMe ? "#1677ff" : "#e4e6eb",
                    color: isMe ? "white" : "#000",
                    fontSize: 15,
                    lineHeight: "22px",
                  }}
                >
                  {m.text}
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <div
          style={{
            padding: "12px 18px",
            borderTop: "1px solid #e5e5e5",
            background: "#fff",
            display: "flex",
            gap: 10,
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn…"
            style={{
              flex: 1,
              padding: "12px 15px",
              borderRadius: 25,
              border: "1px solid #ccc",
              outline: "none",
              fontSize: 15,
              color: "#000",
              background: "#fff",
            }}
          />

          <button
            onClick={sendMessage}
            style={{
              padding: "12px 22px",
              background: "#1677ff",
              color: "#fff",
              border: "none",
              borderRadius: 25,
              cursor: "pointer",
              fontWeight: 600,
              transition: "0.2s",
            }}
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}

export default MessagePage;
