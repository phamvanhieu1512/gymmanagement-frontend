import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Typography, message } from "antd";
import { StyledButton, LoginCard, LoginContainer } from "./styleLogin_SignUp";

const { Title, Text } = Typography;

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  //   const onFinish = async (values) => {
  //     setLoading(true);
  //     try {
  //       await axios.post(`http://localhost:3001/api/auth/reset-password/${token}`, {
  //         password: values.password,
  //       });
  //       message.success("Đặt lại mật khẩu thành công!");
  //       navigate("/login");
  //     } catch (error) {
  //       message.error("Token không hợp lệ hoặc đã hết hạn!");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  return (
    <LoginContainer>
      <LoginCard>
        <Title level={3} style={{ color: "#B22222" }}>
          Đặt lại mật khẩu
        </Title>
        <Text type="secondary">Nhập mật khẩu mới của bạn</Text>

        <Form layout="vertical" style={{ marginTop: 24 }}>
          {/* onFinish={onFinish} */}
          <Form.Item
            label="Mật khẩu mới"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới!" }]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <Form.Item>
            <StyledButton htmlType="submit">
              {/* loading={loading} */}
              Xác nhận
            </StyledButton>
          </Form.Item>
        </Form>
      </LoginCard>
    </LoginContainer>
  );
};

export default ResetPasswordPage;
