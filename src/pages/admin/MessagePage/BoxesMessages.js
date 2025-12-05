// BoxesMessage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function BoxesMessage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]); // khởi tạo rỗng

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/customer/message-all`);
        const countFrom = res.data.countFrom;

        // Chỉ giữ những người có count > 0 và map thành array {id, name, count}
        const activeUsers = Object.keys(countFrom)
          .filter((id) => id !== "68ff36d578fc9208ee291a83") // loại bỏ admin
          .map((id) => ({
            id,
            name: id, // nếu API không trả name, bạn có thể đặt tạm id hoặc fetch thêm user info
            count: countFrom[id],
          }));

        setUsers(activeUsers);
      } catch (error) {
        console.error("Lỗi khi lấy số lượng message:", error);
      }
    };

    fetchCount();
  }, []);

  const handleOpenChat = (user) => {
    navigate(`/admin/messages?peerId=${user.id}&name=${user.name}`);
  };

  if (users.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "#888",
          fontSize: 16,
        }}
      >
        Chưa có tin nhắn nào
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 20,
        padding: 40,
        background: "#f0f2f5",
        height: "100vh",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {users.map((user) => (
        <div
          key={user.id}
          onClick={() => handleOpenChat(user)}
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "#1677ff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 24,
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            transition: "0.2s",
            position: "relative",
          }}
        >
          <div>{user.name[0].toUpperCase()}</div>
          <div
            style={{
              fontSize: 14,
              marginTop: 4,
              background: "red",
              borderRadius: "50%",
              width: 22,
              height: 22,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              top: -10,
              right: -10,
            }}
          >
            {user.count}
          </div>
        </div>
      ))}
    </div>
  );
}

export default BoxesMessage;
