import React, { useState } from "react";
import {
  Button,
  Modal,
  Table,
  Typography,
  Checkbox,
  message,
  Spin,
} from "antd";
import { QRCodeCanvas } from "qrcode.react";
import * as checkInQRService from "../../../services/Admin/checkInQRService";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { getValidToken } from "../../../services/getValidToken";

const AttendancePage = () => {
  const { Title } = Typography;

  const [selectedMembership, setSelectedMembership] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [qrValue, setQrValue] = useState("");
  const [creatingQR, setCreatingQR] = useState(false);

  // ================================
  // Lấy danh sách membership hợp lệ
  // ================================
  const getAllMembers = async () => {
    const token = await getValidToken();
    if (!token) return [];

    const res = await checkInQRService.getAllMembers(token);
    return res.data || [];
  };

  const { data: memberships = [], isLoading } = useQuery({
    queryKey: ["memberships"],
    queryFn: getAllMembers,
  });

  // ================================
  // Tạo QR khi tick
  // ================================
  const handleCreateQR = async (record) => {
    try {
      if (creatingQR) return;
      setCreatingQR(true);

      const token = await getValidToken();
      if (!token) throw new Error("Token không hợp lệ");

      const res = await checkInQRService.createQR(token, {
        membershipId: record.membershipId,
        memberId: record.memberId,
      });

      if (res?.status === "OK") {
        setSelectedMember(record);
        setQrValue(res.data?.hash || "");
        message.success("Tạo QR thành công");
      } else {
        message.error(res?.message || "Tạo QR thất bại");
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error.message;
      message.error(msg);
    } finally {
      setCreatingQR(false);
    }
  };

  // ================================
  // Columns danh sách membership
  // ================================
  const columns = [
    {
      title: "Tạo",
      key: "create",
      render: (_, record) => (
        <Checkbox
          checked={selectedMember?.memberId === record.memberId}
          disabled={creatingQR}
          onChange={() => handleCreateQR(record)}
        />
      ),
    },
    { title: "Tên Member", dataIndex: "fullName", key: "fullName" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
    {
      title: "Gói tập",
      dataIndex: "packageName",
      key: "packageName",
    },
    {
      title: "Buổi còn lại",
      dataIndex: "remainingSessions",
      key: "remainingSessions",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      render: (d) => dayjs(d).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      render: (d) => dayjs(d).format("DD/MM/YYYY"),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>
        <span style={{ color: "#fff" }}>Quản lý điểm danh</span>
      </Title>

      <Table
        loading={isLoading}
        dataSource={memberships}
        columns={columns}
        rowKey="membershipId"
        pagination={{ pageSize: 10 }}
      />

      {/* QR MODAL */}
      <Modal
        title={selectedMember ? `QR của ${selectedMember.fullName}` : ""}
        open={!!selectedMember}
        onCancel={() => {
          setSelectedMember(null);
          setQrValue("");
        }}
        footer={
          <Button
            onClick={() => {
              setSelectedMember(null);
              setQrValue("");
            }}
          >
            Đóng
          </Button>
        }
      >
        {qrValue ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <QRCodeCanvas value={qrValue} size={220} />
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 24 }}>
            <Spin />
            <div style={{ marginTop: 12 }}>Đang tạo QR...</div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AttendancePage;
