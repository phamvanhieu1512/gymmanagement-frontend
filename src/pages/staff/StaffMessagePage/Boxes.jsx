// BoxesMessage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllMembers, getAllMembersAndStaffs, getAllMembersAndStaffsAdmin } from "../../../services/Admin/UserService";
import { getValidToken } from "../../../services/getValidToken";
import ChatSidebar from "./FromStaffMessage";
import { isJsonString } from "../../../utils/utils";
import { jwtDecode } from "jwt-decode";

function BoxesMessageStaff() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [userIdAddress, setuserIdAddress] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [userTypeFilter, setUserTypeFilter] = useState("all"); // new: "all", "member", "staff"

  const fetchCount = async () => {
    try {
      setLoading(true);

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
      setuserIdAddress(userId)

      const token = await getValidToken();
      if (!token) {
        console.error("Token không hợp lệ");
        setLoading(false);
        return;
      }

      const res = await getAllMembersAndStaffsAdmin(token, userId);
      const membersInfo = res["data"].map(member => ({
        id: member._id,
        username: member.fullName,
        role: member.role, 
        avatar: member.avatarUrl,
      }));

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

  
  useEffect(() => {
    let filtered = users;

    if (userTypeFilter !== "all") {
      filtered = filtered.filter(user => user.role === userTypeFilter);
    }


    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, userTypeFilter, users]);

  const handleOpenChat = (user) => {
    navigate(`/staff/messages?to=${user.id}&name=${user.username}`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (type) => {
    setUserTypeFilter(type); // "all", "member", "staff"
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#888", fontSize: 16 }}>
        Đang tải...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#888", fontSize: 16, flexDirection: "column", gap: "10px" }}>
        <div>Chưa có người dùng nào</div>
        <div style={{ fontSize: "14px", color: "#aaa" }}>Hãy mời người dùng tham gia</div>
      </div>
    );
  }

  return (
    <>
      {/* Filter buttons */}
      <div style={{ display: "flex", gap: "10px", padding: "10px 20px", background: "#f0f2f5" }}>
        <button
          onClick={() => handleFilterChange("all")}
          style={{ padding: "6px 12px", background: userTypeFilter === "all" ? "#1677ff" : "#fff", color: userTypeFilter === "all" ? "#fff" : "#000", borderRadius: 4, border: "1px solid #ccc", cursor: "pointer" }}
        >
          Tất cả
        </button>
        <button
          onClick={() => handleFilterChange("member")}
          style={{ padding: "6px 12px", background: userTypeFilter === "member" ? "#1677ff" : "#fff", color: userTypeFilter === "member" ? "#fff" : "#000", borderRadius: 4, border: "1px solid #ccc", cursor: "pointer" }}
        >
          Member
        </button>
        <button
          onClick={() => handleFilterChange("staff")}
          style={{ padding: "6px 12px", background: userTypeFilter === "staff" ? "#1677ff" : "#fff", color: userTypeFilter === "staff" ? "#fff" : "#000", borderRadius: 4, border: "1px solid #ccc", cursor: "pointer" }}
        >
          Nhân viên
        </button>
        <button
          onClick={() => handleFilterChange("admin")}
          style={{ padding: "6px 12px", background: userTypeFilter === "admin" ? "#1677ff" : "#fff", color: userTypeFilter === "admin" ? "#fff" : "#000", borderRadius: 4, border: "1px solid #ccc", cursor: "pointer" }}
        >
          Admin
        </button>
      </div>

      <ChatSidebar
        users={users}
        filteredUsers={filteredUsers}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearchChange={handleSearchChange}
        handleOpenChat={handleOpenChat}
      />
    </>
  );
}

export default BoxesMessageStaff;
