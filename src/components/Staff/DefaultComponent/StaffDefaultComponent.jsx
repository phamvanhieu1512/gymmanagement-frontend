import React, { useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Button, Layout } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import logoTrang from "../../../assets/images/logo/logo_trang.png";
import { StyledMenu } from "./styleStaffDefaultComponent";

const { Header, Sider, Content } = Layout;

const StaffDefaultComponent = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: "/staff", icon: <DashboardOutlined />, label: "Tổng quan" },
    {
      key: "/staff/members",
      icon: <TeamOutlined />,
      label: "Danh sách hội viên",
    },
    {
      key: "/staff/packages",
      icon: <CheckSquareOutlined />,
      label: "Cập nhật gói tập",
    },
    {
      key: "/staff/checkins",
      icon: <UserOutlined />,
      label: "Quản lý Check-in",
    },
    { key: "/staff/schedules", icon: <CalendarOutlined />, label: "Lịch tập" },
    { key: "/staff/logout", icon: <LogoutOutlined />, label: "Đăng xuất" },
  ];

  const handleMenuClick = (e) => navigate(e.key);

  return (
    <Layout style={{ minHeight: "100vh", background: "#F5F7FA" }}>
      {/* HEADER */}
      <Header
        style={{
          height: 70,
          background: "#42A5F5",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          color: "#FFFFFF",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          position: "fixed",
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
              height: 45,
              width: 130,
              backgroundImage: `url(${logoTrang})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          />
          <h2 style={{ margin: 0, color: "#FFFFFF", fontWeight: 500 }}>
            Quản lý nhân viên GYM
          </h2>
        </div>
      </Header>

      {/* LAYOUT CHÍNH */}
      <Layout style={{ marginTop: 70 }}>
        {/* SIDEBAR */}
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            background: "#FFFFFF",
            height: "calc(100vh - 70px)",
            position: "fixed",
            left: 0,
            top: 70,
            overflow: "auto",
            borderRight: "1px solid #E0E0E0",
          }}
        >
          <StyledMenu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              background: "#FFFFFF",
              color: "#333333",
            }}
            theme="light"
          />
        </Sider>

        {/* CONTENT */}
        <Layout
          style={{
            marginLeft: collapsed ? 80 : 200,
            transition: "all 0.3s",
            background: "#F5F7FA",
          }}
        >
          <Content
            style={{
              margin: 0,
              padding: 24,
              minHeight: "calc(100vh - 70px)",
              background: "#FFFFFF",
              color: "#333333",
              borderRadius: 8,
              boxShadow: "0 0 10px rgba(0,0,0,0.05)",
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default StaffDefaultComponent;
