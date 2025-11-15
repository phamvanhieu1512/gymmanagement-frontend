import { Button, Space, Table, Tag } from "antd";
import React from "react";

const UserPage = () => {
  return (
    <>
      <Table
        // dataSource={users}
        rowKey="_id"
        columns={[
          { title: "Họ tên", dataIndex: "fullName" },
          { title: "Email", dataIndex: "email" },
          { title: "Số điện thoại", dataIndex: "phone" },
          { title: "Vai trò", dataIndex: "role" },
          { title: "Giới tính", dataIndex: "gender" },
          { title: "Ngày sinh", dataIndex: "dateOfBirth" },
          {
            title: "Trạng thái",
            dataIndex: "isActive",
            render: (active) => (
              <Tag color={active ? "green" : "red"}>
                {active ? "Hoạt động" : "Khóa"}
              </Tag>
            ),
          },
          {
            title: "Hành động",
            render: (_, record) => (
              <Space>
                <Button>Chi tiết</Button>
                <Button>Sửa</Button>
                <Button danger>Xóa</Button>
              </Space>
            ),
          },
        ]}
      />
    </>
  );
};

export default UserPage;
