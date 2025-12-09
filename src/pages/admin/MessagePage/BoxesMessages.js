// BoxesMessage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllMembers } from "../../../services/Admin/UserService";
import { getValidToken } from "../../../services/getValidToken";

function BoxesMessage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCount = async () => {
    try {
      setLoading(true);
      const token = await getValidToken();
      if (!token) {
        console.error("Token không hợp lệ");
        setLoading(false);
        return;
      }

      const res = await getAllMembers(token);
      const membersInfo = res["data"].map(member => ({
        id: member._id,
        username: member.fullName,
        role: member.role,
        avatar: member.avatarUrl,
        lastMessage: "Nhấn để bắt đầu trò chuyện",  }));

      setUsers(membersInfo);
      setFilteredUsers(membersInfo);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
  }, []);

  // Lọc người dùng khi searchTerm thay đổi
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleOpenChat = (user) => {

    console.log("Data", user.id, user.username, user.role);

    navigate(`/admin/messages?peerId=${user.id}&name=${user.username}`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
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
        Đang tải...
      </div>
    );
  }

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
          flexDirection: "column",
          gap: "10px"
        }}
      >
        <div>Chưa có người dùng nào</div>
        <div style={{ fontSize: "14px", color: "#aaa" }}>Hãy mời người dùng tham gia</div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "calc(100vh - 70px)",
        backgroundColor: "#f0f2f5",
        display: "flex",
        flexDirection: "column",
        padding: "0"
      }}
    >
      {/* Header */} 
      <div
        style={{
          backgroundColor: "#fff",
          padding: "15px 20px",
          borderBottom: "1px solid #e0e0e0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}
      >
        <h2 style={{ 
          margin: "0 0 15px 0", 
          color: "#333",
          fontSize: "20px"
        }}>
          Tin nhắn
        </h2>
        
        {/* Ô tìm kiếm */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              width: "100%",
              padding: "10px 15px 10px 40px",
              borderRadius: "20px",
              border: "1px solid #ddd",
              color: "black",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
              backgroundColor: "#f5f5f5"
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "15px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#999"
            }}
          >
            
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#999",
                cursor: "pointer",
                fontSize: "18px"
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Danh sách người dùng */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0"
        }}
      >
        {filteredUsers.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "300px",
              color: "#888",
              fontSize: "16px"
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "10px" }}>🔍</div>
            <div>Không tìm thấy người dùng</div>
            <div style={{ fontSize: "14px", color: "#aaa", marginTop: "5px" }}>
              Thử tìm kiếm với từ khóa khác
            </div>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => handleOpenChat(user)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 20px",
                backgroundColor: "#fff",
                borderBottom: "1px solid #f0f0f0",
                cursor: "pointer",
                transition: "background-color 0.2s",
                ":hover": {
                  backgroundColor: "#f5f5f5"
                }
              }}
            >
              {/* Avatar */}
              <div style={{ position: "relative", marginRight: "15px" }}>
                <img
                  src={user.avatar 
                        ? `http://localhost:5000${user.avatar}` 
                        : "http://localhost:5000/images/logo/Default_pfp.jpg"}
                  alt={user.username}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />

                {user.unreadCount > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      backgroundColor: "#ff4d4f",
                      color: "#fff",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold"
                    }}
                  >
                    {user.unreadCount}
                  </div>
                )}
                {/* Online indicator - có thể thêm logic kiểm tra trạng thái online */}
                
              </div>

              {/* Thông tin người dùng */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "5px"
                  }}
                >
                  <div
                    style={{
                      fontWeight: "600",
                      fontSize: "16px",
                      color: "#333",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {user.username}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#999"
                    }}
                  >
                    {user.timestamp}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                      marginRight: "10px"
                    }}
                  >
                    {user.lastMessage}
                  </div>
                  {user.unreadCount > 0 && (
                    <div
                      style={{
                        backgroundColor: "#1677ff",
                        color: "#fff",
                        borderRadius: "10px",
                        padding: "2px 8px",
                        fontSize: "12px",
                        fontWeight: "bold"
                      }}
                    >
                      {user.unreadCount} mới
                    </div>
                  )}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#52c41a",
                    marginTop: "3px"
                  }}
                >
                  {user.lastSeen}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#999",
                    marginTop: "3px"
                  }}
                >
                  Vai trò: {user.role}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer (tùy chọn) */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "10px 20px",
          borderTop: "1px solid #e0e0e0",
          textAlign: "center",
          fontSize: "12px",
          color: "#999"
        }}
      >
        Hiển thị {filteredUsers.length} trong tổng số {users.length} người dùng
      </div>
    </div>
  );
}

export default BoxesMessage;