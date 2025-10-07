import styled from "styled-components";
import { Menu } from "antd";

export const StyledMenu = styled(Menu)`
  background: #b22222 !important;
  color: #ffffff !important;
  border-right: none;
  font-weight: 500;

  /* Màu chữ mặc định */
  .ant-menu-item,
  .ant-menu-submenu-title {
    color: #ffffff !important;
  }

  /* Khi hover */
  .ant-menu-item:hover {
    background-color: #d32f2f !important;
    color: #ffd700 !important;
  }

  /* Khi được chọn */
  .ant-menu-item-selected {
    background-color: #8b0000 !important;
    color: #ffd700 !important;
    font-weight: 600;
  }

  /* Icon khi được chọn */
  .ant-menu-item-selected .ant-menu-item-icon {
    color: #ffd700 !important;
  }

  /* Icon mặc định */
  .ant-menu-item .ant-menu-item-icon {
    color: #ffffff !important;
  }

  /* Hover icon */
  .ant-menu-item:hover .ant-menu-item-icon {
    color: #ffd700 !important;
  }

  /* Bỏ viền bên trái khi inline mode */
  .ant-menu-item::after {
    border-right: none !important;
  }
`;
