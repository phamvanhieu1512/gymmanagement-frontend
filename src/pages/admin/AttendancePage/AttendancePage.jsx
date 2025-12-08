import React, { useState } from "react";
import {
  Button,
  Modal,
  Table,
  Typography,
  Tag,
  message,
  Spin,
  Space,
} from "antd";
import { QRCodeCanvas } from "qrcode.react";
import * as checkInQRService from "../../../services/Admin/checkInQRService";

import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { getValidToken } from "../../../services/getValidToken";

const AttendancePage = () => {
  const { Title } = Typography;

  const [selectedMember, setSelectedMember] = useState(null);
  const [qrValue, setQrValue] = useState("");
  const [creatingQR, setCreatingQR] = useState(false);

  // ================================
  // Lấy danh sách membership hợp lệ
  // ================================
  const fetchMembers = async () => {
    const token = await getValidToken();
    const res = await checkInQRService.getAllMembers(token);
    return res.data || [];
  };

  const { data: memberships = [], isLoading } = useQuery({
    queryKey: ["memberships"],
    queryFn: fetchMembers,
  });

  // ================================
  // Handle create QR
  // ================================
  const handleCreateQR = async (record) => {
    try {
      setCreatingQR(true);
      const token = await getValidToken();

      const res = await checkInQRService.createQR(token, {
        membershipId: record.membershipId,
        memberId: record.memberId,
      });

      if (res.status === "OK") {
        setSelectedMember(record);
        setQrValue(res.data?.hash);
        message.success("Tạo QR thành công!");
      } else {
        message.error(res.message || "Không thể tạo QR");
      }
    } catch (err) {
      message.error(err.message);
    } finally {
      setCreatingQR(false);
    }
  };

  // ================================
  // TABLE COLUMNS
  // ================================
  const columns = [
    {
      title: "Thành viên",
      key: "memberInfo",
      width: 250,
      render: (_, record) => (
        <div>
          <b>{record.fullName}</b>
          <div style={{ fontSize: 12, color: "#aaa" }}>{record.email}</div>
          <div style={{ fontSize: 12 }}>{record.phone}</div>
        </div>
      ),
    },
    {
      title: "Gói tập",
      key: "package",
      render: (_, record) => (
        <div>
          <b>{record.package?.name}</b>
          {record.package?.type === "personal_trainer" && (
            <Tag color="purple" style={{ marginLeft: 8 }}>
              PT
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Buổi còn lại",
      dataIndex: "remainingSessions",
      key: "remainingSessions",
      render: (num) => <Tag color="blue">{num}</Tag>,
    },
    {
      title: "Trainer",
      key: "trainer",
      render: (_, record) =>
        record.trainer ? (
          <span>{record.trainer.fullName}</span>
        ) : (
          <span style={{ color: "#888" }}>Không có</span>
        ),
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      render: (d) => dayjs(d).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      render: (d) => {
        const isExpired = dayjs(d).isBefore(dayjs());
        return (
          <Space>
            {dayjs(d).format("DD/MM/YYYY")}
            {isExpired ? (
              <Tag color="red">Hết hạn</Tag>
            ) : (
              <Tag color="green">Còn hạn</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Tạo QR",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          loading={creatingQR && selectedMember?.memberId === record.memberId}
          onClick={() => handleCreateQR(record)}
        >
          Tạo mã
        </Button>
      ),
    },
  ];

  // ================================
  // RENDER
  // ================================
  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ color: "#fff" }}>
        Quản lý điểm danh
      </Title>

      <Table
        loading={isLoading}
        dataSource={memberships}
        columns={columns}
        rowKey="membershipId"
        pagination={{ pageSize: 8 }}
      />

      {/* QR MODAL */}
      <Modal
        open={!!selectedMember}
        title={
          selectedMember
            ? `QR của ${selectedMember.fullName}`
            : "Đang tạo mã..."
        }
        onCancel={() => {
          setSelectedMember(null);
          setQrValue("");
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setSelectedMember(null);
              setQrValue("");
            }}
          >
            Đóng
          </Button>,
        ]}
      >
        {!qrValue ? (
          <div style={{ padding: 20, textAlign: "center" }}>
            <Spin />
            <div>Đang tạo QR...</div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <QRCodeCanvas value={qrValue} size={230} />
          </div>
        )}

        {selectedMember && (
          <div style={{ marginTop: 20 }}>
            <b>Gói tập:</b> {selectedMember.package?.name} <br />
            <b>Buổi còn lại:</b> {selectedMember.remainingSessions} <br />
            <b>Hết hạn:</b> {dayjs(selectedMember.endDate).format("DD/MM/YYYY")}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AttendancePage;
