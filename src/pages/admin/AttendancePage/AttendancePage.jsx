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
  Input,
  Select,
  DatePicker,
  Row,
  Col,
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
  const { RangePicker } = DatePicker;
  const [search, setSearch] = useState("");
  const [packageFilter, setPackageFilter] = useState(null);
  const [trainerFilter, setTrainerFilter] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);

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

  const packageOptions = [
    ...new Set(
      memberships.map((m) => ({
        id: m.package.id,
        name: m.package.name,
      }))
    ),
  ];

  const trainerOptions = [
    ...new Set(
      memberships
        .filter((m) => m.trainer)
        .map((m) => ({
          id: m.trainer.id,
          name: m.trainer.fullName,
        }))
    ),
  ];

  const filteredData = memberships.filter((m) => {
    const keyword = search.toLowerCase();

    // 1. Tìm kiếm theo tên, email, sđt
    const matchSearch =
      m.fullName.toLowerCase().includes(keyword) ||
      m.email.toLowerCase().includes(keyword) ||
      m.phone.includes(keyword);

    if (!matchSearch) return false;

    // 2. Lọc theo gói tập
    if (packageFilter && m.package.id !== packageFilter) return false;

    // 3. Lọc theo trainer
    if (trainerFilter && (!m.trainer || m.trainer.id !== trainerFilter))
      return false;

    // 4. Lọc theo thời gian bắt đầu
    if (dateRange.length === 2) {
      const start = dayjs(m.startDate);
      if (
        !start.isAfter(dateRange[0].startOf("day")) ||
        !start.isBefore(dateRange[1].endOf("day"))
      ) {
        return false;
      }
    }

    // 5. Lọc theo trạng thái hạn
    const isExpired = dayjs(m.endDate).isBefore(dayjs());
    if (statusFilter === "expired" && !isExpired) return false;
    if (statusFilter === "active" && isExpired) return false;

    return true;
  });

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

      <Input.Search
        placeholder="Tìm thành viên..."
        allowClear
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: 250, marginBottom: 16 }}
      />

      <Select
        allowClear
        placeholder="Chọn gói tập"
        style={{ width: 200, marginLeft: 12 }}
        onChange={setPackageFilter}
      >
        {packageOptions.map((p) => (
          <Select.Option key={p.id} value={p.id}>
            {p.name}
          </Select.Option>
        ))}
      </Select>

      <Select
        allowClear
        placeholder="Chọn HLV"
        style={{ width: 200, marginLeft: 12 }}
        onChange={setTrainerFilter}
      >
        {trainerOptions.map((t) => (
          <Select.Option key={t.id} value={t.id}>
            {t.name}
          </Select.Option>
        ))}
      </Select>

      <RangePicker
        style={{ marginLeft: 12 }}
        onChange={(values) => setDateRange(values || [])}
      />

      <Select
        allowClear
        placeholder="Trạng thái"
        style={{ width: 160, marginLeft: 12 }}
        onChange={setStatusFilter}
      >
        <Select.Option value="active">Còn hạn</Select.Option>
        <Select.Option value="expired">Hết hạn</Select.Option>
      </Select>

      <Table
        loading={isLoading}
        dataSource={filteredData}
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
