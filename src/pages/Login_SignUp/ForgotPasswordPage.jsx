import React, { useState } from "react";
import { Form, Input, Typography, message } from "antd";
import { StyledButton, LoginCard, LoginContainer } from "./styleLogin_SignUp";

const { Title, Text } = Typography;

const ForgotPasswordPage = () => {
  //   const [loading, setLoading] = useState(false);

  //   const onFinish = async (values) => {
  //     setLoading(true);
  //     try {
  //       await axios.post("http://localhost:3001/api/auth/forgot-password", {
  //         email: values.email,
  //       });
  //       message.success("Vui lòng kiểm tra email để đặt lại mật khẩu!");
  //     } catch (error) {
  //       message.error("Email không tồn tại trong hệ thống!");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  return (
    <LoginContainer>
      <LoginCard>
        <Title level={3} style={{ color: "#B22222" }}>
          Quên mật khẩu
        </Title>
        <Text type="secondary">Nhập email để lấy lại mật khẩu</Text>

        <Form layout="vertical" style={{ marginTop: 24 }}>
          {/* onFinish={onFinish} */}
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

          <Form.Item>
            <StyledButton htmlType="submit">
              {/* loading={loading} */}
              Gửi liên kết khôi phục
            </StyledButton>
          </Form.Item>
        </Form>
      </LoginCard>
    </LoginContainer>
  );
};

export default ForgotPasswordPage;
