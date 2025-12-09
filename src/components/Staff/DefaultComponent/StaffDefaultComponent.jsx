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
  BarChartOutlined,
  BellOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, Modal } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import logoTrang from "../../../assets/images/logo/logo_trang.png";
import { StyledMenu } from "./styleStaffDefaultComponent";
import { useDispatch, useSelector } from "react-redux";
import * as UserService from "../../../services/Admin/UserService";
import { resetUser } from "../../../redux/slides/userSlice";

const { Header, Sider, Content } = Layout;

const StaffDefaultComponent = ({ children }) => {
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
    { key: "/staff", icon: <DashboardOutlined />, label: "Tổng quan" },
    {
      key: "/staff/members",
      icon: <TeamOutlined />,
      label: "Danh sách hội viên",
    },
    {
      key: "/staff/packages",
      icon: <CheckSquareOutlined />,
      label: "Quản lý gói tập",
    },
    {
      key: "/staff/checkins",
      icon: <UserOutlined />,
      label: "Quản lý Check-in",
    },
    {
      key: "/staff/transactions",
      icon: <BarChartOutlined />,
      label: "Theo dõi giao dịch",
    },
    {
      key: "/staff/notifications",
      icon: <BellOutlined />,
      label: "Quản lý thông báo",
    },
    // {
    //   key: "/staff/boxes",
    //   icon: <MessageOutlined />,
    //   label: "Nhắn tin",
    // },
    {
      key: "/staff/message-boxes",
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
          <h2 style={{ margin: 0, color: "#FFFFFF", fontWeight: 500 }}>
            Nhân viên GYM2P
          </h2>
        </div>
        {user?.fullName ? <div>{user.fullName}</div> : <div>Tài khoản</div>}
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
            background: "#374a6fff",
          }}
        >
          <Content
            style={{
              margin: 0,
              // padding: 24,
              minHeight: "calc(100vh - 70px)",
              background: "#374a6fff",
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
