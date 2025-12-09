import React, { useEffect, useState } from "react";
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
import * as TransactionService from "../../../services/Admin/TransactionService";
import * as UserService from "../../../services/Admin/UserService";
import * as TrainerService from "../../../services/Admin/TrainerService";
import * as PackageService from "../../../services/Admin/PackageService";
import dayjs from "dayjs";
import { getValidToken } from "../../../services/getValidToken";

const { Title } = Typography;

const DashboardPage = () => {
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [revenueMonth, setRevenueMonth] = useState(0);
  const [revenueChart, setRevenueChart] = useState([]);
  const [memberGrowth, setMemberGrowth] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = await getValidToken();

      const membersRes = await UserService.getAllMembers(token);
      const trainersRes = await TrainerService.getAllTrainers(token);
      const packagesRes = await PackageService.getAllPackages(token);
      const transactionsRes = await TransactionService.getAllTransactions(
        token
      );

      const m = membersRes.data || [];
      const t = trainersRes.data || [];
      const p = packagesRes.data || [];
      const tr = transactionsRes.data || [];

      setMembers(m);
      setTrainers(t);
      setPackages(p);
      setTransactions(tr);

      computeRevenueThisMonth(tr);
      computeRevenueChart(tr);
      computeMemberGrowth(m);
    };

    fetchData();
  }, []);

  // ================================
  // 🔥 1. Tính doanh thu tháng hiện tại
  // ================================
  const computeRevenueThisMonth = (transactions) => {
    const currentMonth = dayjs().month();
    const total = transactions
      .filter(
        (txn) =>
          txn.status === "completed" &&
          dayjs(txn.transactionDate).month() === currentMonth
      )
      .reduce((sum, t) => sum + t.amount, 0);

    setRevenueMonth(total);
  };

  // ================================
  // 🔥 2. Tạo dữ liệu biểu đồ doanh thu theo tháng
  // ================================
  const computeRevenueChart = (transactions) => {
    const months = Array(12).fill(0);

    transactions.forEach((txn) => {
      if (txn.status === "completed") {
        const month = dayjs(txn.transactionDate).month();
        months[month] += txn.amount;
      }
    });

    const chart = months.map((total, index) => ({
      month: `T${index + 1}`,
      revenue: total,
    }));

    setRevenueChart(chart);
  };

  // ================================
  // 🔥 3. Tạo dữ liệu tăng trưởng hội viên theo tháng
  // ================================
  const computeMemberGrowth = (members) => {
    const months = Array(12).fill(0);

    members.forEach((mb) => {
      const month = dayjs(mb.createdAt).month();
      months[month]++;
    });

    const chart = months.map((total, index) => ({
      month: `T${index + 1}`,
      members: total,
    }));

    setMemberGrowth(chart);
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={3} style={{ marginBottom: 24, color: "#fff" }}>
        Tổng quan hệ thống
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 12, background: "#B22222" }}
          >
            <Statistic
              title={<span style={{ color: "#fff" }}>Tổng hội viên</span>}
              value={members.length}
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
              value={trainers.length}
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
              value={packages.filter((p) => p.isActive).length}
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
              value={revenueMonth}
              prefix={<DollarOutlined style={{ color: "#fff" }} />}
              valueStyle={{ color: "#fff" }}
              suffix="₫"
            />
          </Card>
        </Col>
      </Row>

      {/* --- BIỂU ĐỒ --- */}
      <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
        <Col xs={24} md={12}>
          <Card
            title="📈 Doanh thu theo tháng"
            style={{ borderRadius: 12 }}
            bodyStyle={{ height: 300 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChart}>
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
