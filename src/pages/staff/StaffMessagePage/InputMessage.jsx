import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { isJsonString } from "../../../utils/utils";
import { jwtDecode } from "jwt-decode";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";

function MessagePageStaff() {
  const navigate = useNavigate()
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const toId = searchParams.get("to");
  const name = searchParams.get("name");


  const handleDecoded = () => {
    let storageData = localStorage.getItem("accessToken");
    let decoded = {};
    if (storageData && isJsonString(storageData)) {
      storageData = JSON.parse(storageData);
      decoded = jwtDecode(storageData);
    }
    return { decoded, storageData };
  };
  const { storageData, decoded } = handleDecoded();
  const userId = decoded?.id;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadHistory = async () => {
    try {

        const res = await fetch(
        `${process.env.REACT_APP_API_URL_BACKEND}/customer/messagebyid/${toId}?userId=${userId}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
        );



      const result = await res.json();

      if (result.success) setMessages(result.data);
    } catch (err) {
      console.error("Load history error:", err);
    }
  };

  useEffect(() => {
    console.log("Tải lịch sử tin nhắn");
    loadHistory();
  }, [userId]);
   


  useEffect(() => {
    const urlLinkWs = `ws://${process.env.REACT_APP_API_URL_ADMIN}`
    ws.current = new WebSocket(urlLinkWs);

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

      if (
        (data.from === userId && data.to === toId) ||
        (data.from === toId && data.to === userId)
      ) {
        setMessages((prev) => [...prev, data]);
      }
    };

    ws.current.onerror = (err) => console.error("WS Error:", err);
    ws.current.onclose = () => console.log("WebSocket closed");

    return () => ws.current.close();
  }, [userId, toId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    const cleanText = text.trim();
    if (!cleanText) return;

    const payload = {
      type: "message",
      from: userId,
      to: toId,
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

  // Hàm format thời gian tin nhắn
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
    const isYesterday =
      date.getDate() === now.getDate() - 1 &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) return "Hôm nay";
    if (isYesterday) return "Hôm qua";
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <div
      style={{
        height: "calc(100vh - 70px)",
        padding: "20px",
        display: "flex",
        justifyContent: "center",
        background: "#f0f2f5",
        // Cố định giao diện tổng thể, không cho scroll
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "125vh",
          height: "90vh",
          background: "#ffffff",
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          // Cố định container chính
          overflow: "hidden",
        }}
      >
        {/* HEADER - Không scroll */}
        <div
            style={{
              padding: "15px 20px",
              borderBottom: "1px solid #e5e5e5",
              fontSize: 16,
              fontWeight: 600,
              background: "#1677ff",
              color: "white",
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              position: "relative",
            }}
          >
            <span
              style={{
                cursor: "pointer",
                position: "absolute",
                left: 20,
                color: "white", // màu icon
                fontSize: 18,   // kích thước icon
              }}
              onClick={() => navigate("/staff/message-boxes")}
            >
              <ArrowLeftOutlined />
            </span>
 
            
            <span style={{ margin: "0 auto" }}>Chat với {name}</span>
          </div>


        {/* CHAT AREA - Chỉ phần này có thể scroll */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            background: "#f6f7f9",
            overflowY: "auto", // Chỉ phần này có thể cuộn
            display: "flex",
            flexDirection: "column",
          }}
        >
          {messages.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#999",
                marginTop: "50%",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Chưa có tin nhắn
            </div>
          ) : (
            messages.map((m, i) => {
              const isMe = m.from === userId;
              const showDate =
                i === 0 ||
                new Date(m.timestamp).toDateString() !==
                  new Date(messages[i - 1].timestamp).toDateString();

              // Dựa vào senderRole để đổi màu: admin = đỏ, member = xanh/đen
              const bgColor =
                m.senderRole === isMe
                  ? "#1677ff"
                  : "#e4e6eb";
              const textColor =
                m.senderRole === isMe ? "#fff" : "#000";

              return (
                <div key={i}>
                  {showDate && (
                    <div
                      style={{
                        textAlign: "center",
                        margin: "10px 0",
                        color: "#888",
                        fontSize: 12,
                      }}
                    >
                      {formatDate(m.timestamp)}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: isMe ? "flex-end" : "flex-start",
                      marginBottom: 8,
                      flexDirection: "column",
                      alignItems: isMe ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "65%",
                        padding: "10px 14px",
                        borderRadius: 16,
                        background: bgColor,
                        color: textColor,
                        fontSize: 15,
                        lineHeight: "20px",
                        wordBreak: "break-word",
                      }}
                    >
                      {m.text}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#888",
                        marginTop: 4,
                      }}
                    >
                      {formatTime(m.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA - Không scroll */}
        <div
          style={{
            padding: "12px 18px",
            borderTop: "1px solid #e5e5e5",
            display: "flex",
            gap: 10,
            background: "#fff",
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            flexShrink: 0, // Không co lại
            color: "black"
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
              border: "1px solid black",
              outline: "none",
              fontSize: 15,
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
            }}
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}

export default MessagePageStaff;