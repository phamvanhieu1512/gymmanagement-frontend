import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Typography,
  Space,
  Button,
} from "antd";
import {
  UserOutlined,
  DollarCircleOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;

const StaffDashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState({
    activeMembers: 0,
    checkInsToday: 0,
    totalRevenue: 0,
    schedules: [],
  });

  // ✅ Giả lập dữ liệu tạm (trước khi có API)
  const fetchDashboard = async () => {
    setLoading(true);
    try {
      // Thay bằng API thật: const res = await axios.get("/api/staff/dashboard");
      const res = {
        data: {
          activeMembers: 124,
          checkInsToday: 32,
          totalRevenue: 18500000,
          schedules: [
            {
              _id: "1",
              title: "Buổi Yoga sáng",
              trainer: "Trần Thị B",
              time: "08:00 - 09:00",
              location: "Phòng 2",
            },
            {
              _id: "2",
              title: "Buổi Tập Tạ nhóm",
              trainer: "Nguyễn Văn A",
              time: "17:00 - 18:00",
              location: "Phòng 1",
            },
          ],
        },
      };
      setDashboard(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ✅ Cấu hình bảng lịch tập
  const scheduleColumns = [
    {
      title: "Buổi tập",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Huấn luyện viên",
      dataIndex: "trainer",
      key: "trainer",
    },
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Phòng",
      dataIndex: "location",
      key: "location",
      render: (loc) => <Tag color="blue">{loc}</Tag>,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Tiêu đề trang */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Bảng điều khiển nhân viên
          </Title>
          <p style={{ color: "#888", margin: 0 }}>
            Xem nhanh tình hình hoạt động trong ngày.
          </p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchDashboard}
          loading={loading}
        >
          Làm mới
        </Button>
      </div>

      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{ background: "#1F2A40", color: "white" }}
          >
            <Statistic
              title={
                <span style={{ color: "#ddd" }}>Hội viên đang hoạt động</span>
              }
              value={dashboard.activeMembers}
              prefix={<UserOutlined style={{ color: "#4CAF50" }} />}
              valueStyle={{ color: "#fff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{ background: "#1F2A40", color: "white" }}
          >
            <Statistic
              title={<span style={{ color: "#ddd" }}>Check-in hôm nay</span>}
              value={dashboard.checkInsToday}
              prefix={<CheckCircleOutlined style={{ color: "#FF9800" }} />}
              valueStyle={{ color: "#fff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{ background: "#1F2A40", color: "white" }}
          >
            <Statistic
              title={<span style={{ color: "#ddd" }}>Tổng doanh thu</span>}
              value={dashboard.totalRevenue.toLocaleString("vi-VN")}
              suffix="₫"
              prefix={<DollarCircleOutlined style={{ color: "#E91E63" }} />}
              valueStyle={{ color: "#fff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{ background: "#1F2A40", color: "white" }}
          >
            <Statistic
              title={<span style={{ color: "#ddd" }}>Buổi tập hôm nay</span>}
              value={dashboard.schedules.length}
              prefix={<CalendarOutlined style={{ color: "#2196F3" }} />}
              valueStyle={{ color: "#fff" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Bảng lịch tập */}
      <Card
        title="Lịch buổi tập hôm nay"
        style={{ marginTop: 24 }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={scheduleColumns}
          dataSource={dashboard.schedules}
          rowKey="_id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default StaffDashboardPage;
