import styled from "styled-components";
import { Menu } from "antd";

export const StyledMenu = styled(Menu)`
  .ant-menu-item {
    font-weight: 500;
    border-radius: 8px;
    margin: 4px 8px;
  }

  .ant-menu-item:hover {
    background-color: #e3f2fd !important;
    color: #1976d2 !important;
  }

  .ant-menu-item-selected {
    background-color: #e3f2fd !important;
    color: #1976d2 !important;
    font-weight: 600;
  }

  .ant-menu-item-icon {
    color: #1976d2 !important;
  }
`;
