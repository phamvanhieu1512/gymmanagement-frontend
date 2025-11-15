import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Typography,
  Modal,
  message,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
const { Title } = Typography;
const { Search } = Input;

const TrainersPage = () => {
  const [trainers, setTrainers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    // fetchTrainers();
  }, []);

  // // Lấy danh sách huấn luyện viên
  // const fetchTrainers = async () => {
  //   try {
  //     setIsLoading(true);
  //     const res = await TrainerService.getAllTrainers(); // API giả định
  //     if (res?.data) {
  //       setTrainers(res.data);
  //     }
  //   } catch (error) {
  //     message.error("Không thể tải danh sách huấn luyện viên!");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // // Xử lý xóa huấn luyện viên
  // const handleDelete = (id) => {
  //   Modal.confirm({
  //     title: "Xác nhận xóa",
  //     content: "Bạn có chắc muốn xóa huấn luyện viên này không?",
  //     okText: "Xóa",
  //     cancelText: "Hủy",
  //     okButtonProps: { danger: true },
  //     onOk: async () => {
  //       try {
  //         await TrainerService.deleteTrainer(id);
  //         message.success("Xóa huấn luyện viên thành công!");
  //         fetchTrainers();
  //       } catch {
  //         message.error("Lỗi khi xóa huấn luyện viên!");
  //       }
  //     },
  //   });
  // };

  // Bộ lọc tìm kiếm theo tên
  const filteredData = trainers.filter((t) =>
    t.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Cấu hình cột của bảng
  const columns = [
    {
      title: "Ảnh",
      dataIndex: "avatar",
      key: "avatar",
      render: (avatar) => (
        <img
          src={avatar || "https://via.placeholder.com/50"}
          alt="Trainer"
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ),
    },
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Chuyên môn",
      dataIndex: "specialty",
      key: "specialty",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Ca làm việc",
      dataIndex: "shift",
      key: "shift",
      render: (shift) => <Tag color="blue">{shift}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Đang làm" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => message.info(`Chỉnh sửa ${record.name}`)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            // onClick={() => handleDelete(record._id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ color: "#ffffff" }}>
        Quản lý Huấn luyện viên
      </Title>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Search
          placeholder="Tìm kiếm huấn luyện viên..."
          onChange={(e) => setSearchValue(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm huấn luyện viên
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="_id"
        loading={isLoading}
        pagination={{ pageSize: 6 }}
      />
    </div>
  );
};

export default TrainersPage;
