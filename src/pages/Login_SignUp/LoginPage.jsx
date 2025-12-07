import React, { useEffect } from "react";
import { Form, Input, Typography, message } from "antd";
import logoTrang from "../../assets/images/logo/logo_den.png";
import {
  LoginContainer,
  LoginCard,
  Logo,
  StyledButton,
} from "./styleLogin_SignUp";
import { useNavigate } from "react-router-dom";
import * as UserService from "../../services/Admin/UserService";
import { useMutationHook } from "../../hooks/useMutationHook";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { updateUser } from "../../redux/slides/userSlice";

const { Title, Text } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const dispatch = useDispatch();

  const mutation = useMutationHook((data) => UserService.loginUser(data));
  const { data, isError, isSuccess, error, isLoading } = mutation;

  useEffect(() => {
    if (isSuccess) {
      if (data?.status === "OK") {
        messageApi.success(data?.message || "Đăng nhập thành công!");

        localStorage.setItem("accessToken", JSON.stringify(data?.access_Token));

        if (data?.access_Token) {
          const decoded = jwtDecode(data?.access_Token);
          console.log("Decoded JWT:", decoded);
          if (decoded?.id) {
            handleGetDetailsUser(decoded?.id, data?.access_Token);
          }

          if (decoded?.role === "admin") {
            navigate("/admin");
          } else if (decoded?.role === "staff") {
            navigate("/staff");
          } else {
            navigate("/");
          }
        }
      } else if (data?.status === "ERROR") {
        messageApi.error(data?.message || "Đăng nhập thất bại!");
      }
    }

    if (isError) {
      messageApi.error(error?.response?.data?.message || "Lỗi hệ thống!");
    }
  }, [isSuccess, isError, data, error, messageApi, navigate]);

  const handleGetDetailsUser = async (id, token) => {
    const resGetDetails = await UserService.getDetailsUser(id, token);
    dispatch(updateUser({ ...resGetDetails?.data, access_Token: token }));
  };

  const onFinish = (values) => {
    mutation.mutate({
      email: values.email,
      passwordHash: values.password,
    });
  };

  const handleForgotPassword = () => {
    navigate("/ForgotPassword");
  };

  return (
    <LoginContainer>
      {contextHolder}
      <LoginCard>
        <Logo src={logoTrang} alt="Gym Logo" />
        <Title level={3} style={{ color: "#374a6fff" }}>
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
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
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

          <Form.Item>
            <StyledButton htmlType="submit" disabled={isLoading}>
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </StyledButton>
          </Form.Item>
        </Form>

        <Text type="secondary" style={{ fontSize: 13 }}>
          © 2025 GYM Management Admin
        </Text>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;
