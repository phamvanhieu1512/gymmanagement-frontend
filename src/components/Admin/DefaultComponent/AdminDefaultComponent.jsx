import React, { useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  TeamOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  CodeSandboxOutlined,
  MessageOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, Modal } from "antd";

import { useNavigate, useLocation } from "react-router-dom";
import logoTrang from "../../../assets/images/logo/logo_trang.png";
import { StyledMenu } from "./styleDefaultComponent";
import { useDispatch, useSelector } from "react-redux";
import * as UserService from "../../../services/Admin/UserService";
import { resetUser } from "../../../redux/slides/userSlice";

const { Header, Sider, Content } = Layout;

const DefaultComponent = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const handleLogout = async () => {
    await UserService.logoutUser();
    dispatch(resetUser());
    navigate("/");
    // localStorage.removeItem("accessToken");
    // navigate("/login");
  };

  const menuItems = [
    { key: "/admin", icon: <DashboardOutlined />, label: "Tổng quan" },
    {
      key: "/admin/packages",
      icon: <CodeSandboxOutlined />,
      label: "Quản lý gói tập",
    },
    {
      key: "/admin/memberships",
      icon: <UserOutlined />,
      label: "Quản lý hội viên",
    },
    {
      key: "/admin/trainers",
      icon: <TeamOutlined />,
      label: "Quản lý huấn luyện viên",
    },
    {
      key: "/admin/users",
      icon: <TeamOutlined />,
      label: "Quản lý người dùng",
    },
    {
      key: "/admin/attendance",
      icon: <BarChartOutlined />,
      label: "Quản lý điểm danh",
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
    {
      key: "/admin/notifications",
      icon: <BellOutlined />,
      label: "Quản lý thông báo",
    },
    {
      key: "/admin/boxes",
      icon: <MessageOutlined />,
      label: "Nhắn tin",
    },
    { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất" },
  ];

  const handleMenuClick = (e) => {
    if (e.key === "logout") {
      Modal.confirm({
        title: "Xác nhận đăng xuất",
        content: "Bạn có chắc chắn muốn đăng xuất không?",
        okText: "Có",
        cancelText: "Không",
        centered: true,
        okType: "danger",
        onOk: async () => {
          await handleLogout();
        },
      });
    } else {
      navigate(e.key);
    }
  };

  return (
    // Layout cha bao toàn bộ trang
    <Layout style={{ minHeight: "100vh", background: "#1F2A40" }}>
      {/* HEADER TRÊN CÙNG */}
      <Header
        style={{
          height: 70,
          background: "#42A5F5",
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

        {user?.fullName ? <div>{user.fullName}</div> : <div>Tài khoản</div>}
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
            background: "#FFFFFF",
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
            background: "#374a6fff",
          }}
        >
          <Content
            style={{
              margin: 0,
              padding: 24,
              minHeight: "calc(100vh - 70px)",
              background: "#374a6fff",
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
