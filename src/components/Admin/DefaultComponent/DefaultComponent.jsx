import React, { useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  TeamOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import logoTrang from "../../../assets/images/logo/logo_trang.png";
import { StyledMenu } from "./styleDefaultComponent";

const { Header, Sider, Content } = Layout;

const DefaultComponent = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: "/admin", icon: <DashboardOutlined />, label: "Tổng quan" },
    {
      key: "/admin/packages",
      icon: <TeamOutlined />,
      label: "Quản lý gói tập & HLV",
    },
    {
      key: "/admin/transactions",
      icon: <BarChartOutlined />,
      label: "Theo dõi giao dịch & báo cáo",
    },
    {
      key: "/admin/staffs",
      icon: <UserOutlined />,
      label: "Quản lý nhân viên",
    },
    { key: "/admin/logout", icon: <LogoutOutlined />, label: "Đăng xuất" },
  ];

  const handleMenuClick = (e) => navigate(e.key);

  return (
    // Layout cha bao toàn bộ trang
    <Layout style={{ minHeight: "100vh", background: "#1F2A40" }}>
      {/* HEADER TRÊN CÙNG */}
      <Header
        style={{
          height: 70,
          background: "#000000",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          color: "#FFFFFF",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          position: "fixed", // Giữ cố định trên cùng
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "18px",
              color: "#FFFFFF",
            }}
          />
          <div
            style={{
              height: 50,
              width: 150,
              margin: 16,
              backgroundImage: `url(${logoTrang})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              borderRadius: 8,
            }}
          />
          <h2 style={{ margin: 0, color: "#FFFFFF" }}>Quản lý phòng tập GYM</h2>
        </div>
      </Header>

      {/* Layout chính: Sidebar + Content */}
      <Layout style={{ marginTop: 70 }}>
        {" "}
        {/* đẩy xuống dưới header */}
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            background: "#B22222",
            height: "calc(100vh - 70px)", // Trừ chiều cao của header
            position: "fixed",
            left: 0,
            top: 70,
            overflow: "auto",
          }}
        >
          <StyledMenu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Sider>
        {/* Nội dung chính */}
        <Layout
          style={{
            marginLeft: collapsed ? 80 : 200, // đẩy nội dung qua phải theo độ rộng sidebar
            transition: "all 0.3s",
            background: "#1F2A40",
          }}
        >
          <Content
            style={{
              margin: 0,
              padding: 24,
              minHeight: "calc(100vh - 70px)",
              background: "#1F2A40",
              color: "#FFFFFF",
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default DefaultComponent;
