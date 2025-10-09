import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Typography,
  DatePicker,
  Input,
  message,
} from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const CheckInLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [dateRange, setDateRange] = useState([]);

  // ✅ Giả lập dữ liệu tạm thời trước khi kết nối backend
  const fetchLogs = async () => {
    setLoading(true);
    try {
      // const res = await axios.get("/api/staff/checkin-logs");
      const res = {
        data: [
          {
            _id: "1",
            member: { fullName: "Nguyễn Văn A" },
            time: "2025-10-09T08:30:00Z",
            verifiedBy: { fullName: "Trần Thị B" },
            status: "verified",
            device: "QR Scanner - Cửa chính",
            location: "Cơ sở Quận 1",
          },
          {
            _id: "2",
            member: { fullName: "Lê Minh C" },
            time: "2025-10-09T10:15:00Z",
            verifiedBy: { fullName: "Nguyễn Văn D" },
            status: "pending",
            device: "Mobile App",
            location: "Cơ sở Quận 7",
          },
        ],
      };
      setLogs(res.data);
    } catch (err) {
      message.error("Không thể tải dữ liệu check-in");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSearch = () => {
    message.info(`Tìm kiếm: ${searchValue}`);
  };

  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  const columns = [
    {
      title: "Hội viên",
      dataIndex: ["member", "fullName"],
      key: "member",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Thời gian check-in",
      dataIndex: "time",
      key: "time",
      render: (value) => dayjs(value).format("HH:mm DD/MM/YYYY"),
    },
    {
      title: "Xác nhận bởi",
      dataIndex: ["verifiedBy", "fullName"],
      key: "verifiedBy",
      render: (text) => text || "—",
    },
    {
      title: "Thiết bị",
      dataIndex: "device",
      key: "device",
    },
    {
      title: "Vị trí",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        const color =
          status === "verified"
            ? "green"
            : status === "pending"
            ? "orange"
            : "red";
        const text =
          status === "verified"
            ? "Đã xác nhận"
            : status === "pending"
            ? "Chờ xác nhận"
            : "Lỗi";
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0, color: "#fff" }}>
            Nhật ký Check-in
          </Title>
          <p style={{ color: "#bbb" }}>
            Theo dõi và quản lý lịch sử check-in của hội viên.
          </p>
        </div>
        <Space>
          <RangePicker onChange={handleDateChange} />
          <Input
            placeholder="Tìm theo tên hội viên"
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ width: 220 }}
          />
          <Button type="primary" onClick={handleSearch}>
            Tìm kiếm
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchLogs}>
            Làm mới
          </Button>
        </Space>
      </div>

      {/* Bảng dữ liệu */}
      <Table
        columns={columns}
        dataSource={logs}
        rowKey="_id"
        bordered
        loading={loading}
        pagination={{ pageSize: 6 }}
      />
    </div>
  );
};

export default CheckInLogsPage;
