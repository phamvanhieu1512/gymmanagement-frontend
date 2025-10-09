// TransactionsPage.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Tag,
  Button,
  Space,
  message,
  DatePicker,
  Input,
  Row,
  Col,
  Select,
} from "antd";
import axios from "axios";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState([]);

  // --- Lấy dữ liệu ---
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/transactions");
      setTransactions(res.data || []);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách giao dịch.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // --- Xử lý filter & search ---
  const filteredData = transactions.filter((tx) => {
    const matchSearch =
      tx.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      tx.packageName?.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      filterStatus === "all" ? true : tx.status === filterStatus;

    const matchDate =
      dateRange.length === 2
        ? dayjs(tx.date).isAfter(dateRange[0], "day") &&
          dayjs(tx.date).isBefore(dateRange[1], "day")
        : true;

    return matchSearch && matchStatus && matchDate;
  });

  const columns = [
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      render: (name) => <b>{name}</b>,
    },
    {
      title: "Gói tập",
      dataIndex: "packageName",
      key: "packageName",
    },
    {
      title: "Số tiền (₫)",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => amount?.toLocaleString(),
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method) => {
        switch (method) {
          case "cash":
            return <Tag color="gold">Tiền mặt</Tag>;
          case "bank":
            return <Tag color="blue">Chuyển khoản</Tag>;
          case "momo":
            return <Tag color="purple">MoMo</Tag>;
          default:
            return <Tag>Khác</Tag>;
        }
      },
    },
    {
      title: "Ngày giao dịch",
      dataIndex: "date",
      key: "date",
      render: (d) => dayjs(d).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        switch (status) {
          case "completed":
            return <Tag color="green">Hoàn tất</Tag>;
          case "pending":
            return <Tag color="orange">Đang xử lý</Tag>;
          case "failed":
            return <Tag color="red">Thất bại</Tag>;
          default:
            return <Tag>Không rõ</Tag>;
        }
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2 style={{ margin: 0 }}>Quản lý giao dịch</h2>
          <div style={{ color: "#666", marginTop: 6 }}>
            Xem lịch sử thanh toán, kiểm tra trạng thái và lọc theo ngày.
          </div>
        </Col>
        <Col>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchTransactions}
            loading={loading}
          >
            Tải lại
          </Button>
        </Col>
      </Row>

      {/* Bộ lọc */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm kiếm khách hàng hoặc gói tập..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: "100%" }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="completed">Hoàn tất</Option>
              <Option value="pending">Đang xử lý</Option>
              <Option value="failed">Thất bại</Option>
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <RangePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              value={dateRange}
              onChange={(dates) => setDateRange(dates || [])}
            />
          </Col>
        </Row>
      </Card>

      {/* Bảng giao dịch */}
      <Card bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey={(r) => r._id || r.id}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default TransactionsPage;
