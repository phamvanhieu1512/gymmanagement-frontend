import React from "react";
import { Form, Input, Typography } from "antd";
import logoTrang from "../../assets/images/logo/logo_den.png";
import {
  LoginContainer,
  LoginCard,
  Logo,
  StyledButton,
  FooterText,
} from "./styleLogin_SignUp";
import { Link } from "react-router";
const { Title, Text } = Typography;

const LoginPage = () => {
  const onFinish = (values) => {
    console.log("Login info:", values);
  };

  const handleForgotPassword = () => {
    alert("Chức năng quên mật khẩu sẽ được thêm sau.");
  };

  const handleRegister = () => {
    alert("Chức năng đăng ký sẽ được thêm sau.");
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo src={logoTrang} alt="Gym Logo" />
        <Title level={3} style={{ color: "#B22222" }}>
          Đăng nhập
        </Title>
        <Text type="secondary">Quản lý phòng tập GYM</Text>

        <Form
          name="loginForm"
          layout="vertical"
          style={{ marginTop: 24 }}
          onFinish={onFinish}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <div style={{ textAlign: "right", marginBottom: 16 }}>
            <Link
              onClick={handleForgotPassword}
              style={{ color: "#B22222", fontWeight: 500 }}
            >
              Quên mật khẩu?
            </Link>
          </div>

          <Form.Item>
            <StyledButton htmlType="submit">Đăng nhập</StyledButton>
          </Form.Item>
        </Form>

        <FooterText>
          Bạn chưa có tài khoản?{" "}
          <Link onClick={handleRegister} style={{ color: "#B22222" }}>
            Đăng ký ngay
          </Link>
        </FooterText>

        <Text type="secondary" style={{ fontSize: 13 }}>
          © 2025 GYM Management Admin
        </Text>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;
