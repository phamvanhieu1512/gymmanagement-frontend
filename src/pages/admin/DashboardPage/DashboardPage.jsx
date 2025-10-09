import React from "react";
import { Card, Row, Col, Statistic, Typography } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const { Title } = Typography;

const DashboardPage = () => {
  // Dữ liệu giả lập cho demo — sau này bạn thay bằng API thật
  const revenueData = [
    { month: "T1", revenue: 12000000 },
    { month: "T2", revenue: 15000000 },
    { month: "T3", revenue: 18000000 },
    { month: "T4", revenue: 21000000 },
    { month: "T5", revenue: 24000000 },
    { month: "T6", revenue: 20000000 },
  ];

  const memberGrowth = [
    { month: "T1", members: 50 },
    { month: "T2", members: 80 },
    { month: "T3", members: 120 },
    { month: "T4", members: 160 },
    { month: "T5", members: 220 },
    { month: "T6", members: 260 },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Title level={3} style={{ marginBottom: 24, color: "#fff" }}>
        Tổng quan hệ thống
      </Title>

      {/* --- Thống kê nhanh --- */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, background: "#B22222" }}
          >
            <Statistic
              title={<span style={{ color: "#fff" }}>Tổng hội viên</span>}
              value={256}
              prefix={<UserOutlined style={{ color: "#fff" }} />}
              valueStyle={{ color: "#fff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, background: "#FF9800" }}
          >
            <Statistic
              title={<span style={{ color: "#fff" }}>Huấn luyện viên</span>}
              value={18}
              prefix={<TeamOutlined style={{ color: "#fff" }} />}
              valueStyle={{ color: "#fff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, background: "#4CAF50" }}
          >
            <Statistic
              title={
                <span style={{ color: "#fff" }}>Gói tập đang hoạt động</span>
              }
              value={74}
              prefix={<CalendarOutlined style={{ color: "#fff" }} />}
              valueStyle={{ color: "#fff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, background: "#03A9F4" }}
          >
            <Statistic
              title={<span style={{ color: "#fff" }}>Doanh thu tháng</span>}
              value={24000000}
              prefix={<DollarOutlined style={{ color: "#fff" }} />}
              valueStyle={{ color: "#fff" }}
              suffix="₫"
            />
          </Card>
        </Col>
      </Row>

      {/* --- Biểu đồ --- */}
      <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
        <Col xs={24} md={12}>
          <Card
            title="📈 Doanh thu theo tháng"
            style={{ borderRadius: 12 }}
            bodyStyle={{ height: 300 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => v.toLocaleString() + " ₫"} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#FF9800"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title="📊 Tăng trưởng hội viên"
            style={{ borderRadius: 12 }}
            bodyStyle={{ height: 300 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="members" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
