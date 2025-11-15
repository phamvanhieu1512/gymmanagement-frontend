import React, { useState } from "react";
import { Table, Button, Tag } from "antd";

const MembershipPage = () => {
  // Dữ liệu tạm thời (mock)
  const [memberships, setMemberships] = useState([
    {
      _id: "1",
      userName: "Nguyễn Văn A",
      packageName: "PT 3 tháng",
      trainerName: "Trần Minh",
      startDate: "01/10/2025",
      endDate: "31/12/2025",
      status: "active",
      remainingSessions: 36,
    },
    {
      _id: "2",
      userName: "Lê Thị B",
      packageName: "Standard 1 tháng",
      trainerName: "-",
      startDate: "05/11/2025",
      endDate: "04/12/2025",
      status: "pending",
      remainingSessions: 0,
    },
    {
      _id: "3",
      userName: "Phạm Văn C",
      packageName: "PT Trial 1 tuần",
      trainerName: "Hoàng Lan",
      startDate: "07/11/2025",
      endDate: "13/11/2025",
      status: "expired",
      remainingSessions: 0,
    },
  ]);

  // Columns của Table
  const columns = [
    { title: "Hội viên", dataIndex: "userName" },
    { title: "Gói tập", dataIndex: "packageName" },
    { title: "Trainer", dataIndex: "trainerName" },
    { title: "Ngày bắt đầu", dataIndex: "startDate" },
    { title: "Ngày kết thúc", dataIndex: "endDate" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => {
        let color = "gray";
        if (status === "active") color = "green";
        else if (status === "pending") color = "orange";
        else if (status === "expired") color = "red";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Buổi còn lại",
      dataIndex: "remainingSessions",
    },
    {
      title: "Hành động",
      render: (record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            size="small"
            onClick={() => alert(`Xem chi tiết ${record.userName}`)}
          >
            Chi tiết
          </Button>
          <Button
            size="small"
            onClick={() => alert(`Gia hạn ${record.userName}`)}
          >
            Gia hạn
          </Button>
          <Button
            size="small"
            danger
            onClick={() => alert(`Hủy ${record.userName}`)}
          >
            Hủy
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: "#fff" }}>Quản lý hội viên</h2>
      <Table
        dataSource={memberships}
        columns={columns}
        rowKey="_id"
        bordered
        style={{ background: "#fff" }}
      />
    </div>
  );
};

export default MembershipPage;
