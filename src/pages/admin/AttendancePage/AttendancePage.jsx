import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Table,
  Typography,
  Checkbox,
  message,
} from "antd";
import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import * as checkInQRService from "../../../services/Admin/checkInQRService";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { getValidToken } from "../../../services/getValidToken";

const AttendancePage = () => {
  const { Title } = Typography;
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isMemberModalVisible, setIsMemberModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [qrValue, setQrValue] = useState(""); // Lưu QR hash từ backend

  // Lấy danh sách members từ backend
  const getAllMembers = async () => {
    const token = await getValidToken();
    if (!token)
      return { status: "ERROR", message: "Token không hợp lệ", data: [] };

    const res = await checkInQRService.getAllMembers(token);
    return res.data || [];
  };

  const { data: membersData = [], isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: getAllMembers,
  });

  // Tạo danh sách gói tập duy nhất (không trùng)
  const packageList = Array.from(
    new Map(membersData.map((m) => [m.packageName, m])).values()
  );

  // Khi click vào row của gói → show modal members
  const handlePackageRowClick = (record) => {
    setSelectedPackage(record);
    setIsMemberModalVisible(true);
  };

  // Khi tick member → gọi API tạo QR và show QR
  const handleTickMember = async (member) => {
    try {
      const token = await getValidToken();
      const res = await checkInQRService.createQR(token, {
        membershipId: member.membershipId,
        memberId: member.memberId,
      });

      if (res.status === "OK") {
        setSelectedMember(member);
        setQrValue(res.data.hash); // backend trả về hash
      } else {
        message.error(res.message || "Tạo QR thất bại");
      }
    } catch (err) {
      console.error(err);
      message.error("Lỗi tạo QR. Vui lòng thử lại");
    }
  };

  // Columns table gói
  const packageColumns = [
    { title: "Tên gói tập", dataIndex: "packageName", key: "packageName" },
    {
      title: "Buổi còn lại",
      dataIndex: "remainingSessions",
      key: "remainingSessions",
    },
    {
      title: "Bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (d) => dayjs(d).format("DD/MM/YYYY"),
    },
    {
      title: "Kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (d) => dayjs(d).format("DD/MM/YYYY"),
    },
  ];

  // Columns table member trong modal
  const memberColumns = [
    {
      title: "Tick",
      key: "tick",
      render: (_, member) => (
        <Checkbox
          disabled={member.remainingSessions === 0}
          onChange={() => handleTickMember(member)}
        />
      ),
    },
    { title: "Tên Member", dataIndex: "fullName", key: "fullName" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
    {
      title: "Buổi còn lại",
      dataIndex: "remainingSessions",
      key: "remainingSessions",
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>
        <span style={{ color: "#fff" }}>Quản lý điểm danh</span>
      </Title>

      <Table
        loading={isLoading}
        rowKey="membershipId"
        dataSource={packageList}
        columns={packageColumns}
        onRow={(record) => ({
          onClick: () => handlePackageRowClick(record),
          style: { cursor: "pointer" },
        })}
        pagination={{ pageSize: 10 }}
      />

      {/* Modal danh sách member */}
      <Modal
        title={
          selectedPackage
            ? `Member của gói: ${selectedPackage.packageName}`
            : ""
        }
        open={isMemberModalVisible}
        onCancel={() => setIsMemberModalVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={memberColumns}
          dataSource={
            selectedPackage
              ? membersData.filter(
                  (m) => m.packageName === selectedPackage.packageName
                )
              : []
          }
          rowKey="membershipId"
          pagination={false}
        />
      </Modal>

      {/* Modal QR member */}
      <Modal
        title={selectedMember ? `QR của ${selectedMember.fullName}` : ""}
        open={!!selectedMember}
        onCancel={() => setSelectedMember(null)}
        footer={<Button onClick={() => setSelectedMember(null)}>Đóng</Button>}
      >
        {selectedMember && qrValue && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <QRCodeCanvas value={qrValue} size={200} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AttendancePage;
