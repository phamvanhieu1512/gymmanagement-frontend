import { Button, Card } from "antd";
import styled from "styled-components";

export const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #b22222 0%, #000000 100%);
`;

export const LoginCard = styled(Card)`
  min-width: 400px;
  margin: 12px 0;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  text-align: center;
  background: #ffffff;
`;

export const Logo = styled.img`
  width: 100px;
  margin-bottom: 16px;
`;

export const StyledButton = styled(Button)`
  width: 100%;
  background: #b22222 !important;
  border: none;
  color: #ffffff !important;
  font-weight: 600;
  height: 40px;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: #d32f2f !important;
    color: #ffd700 !important;
  }
`;

export const FooterText = styled.div`
  margin-top: 16px;
  font-size: 14px;
  color: #555555;
  text-align: center;
`;
