// StaffsPage.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Card,
  Space,
  Tag,
  Input,
  Modal,
  Form,
  Select,
  message,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Option } = Select;

const StaffsPage = () => {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const [form] = Form.useForm();

  // --- Giả lập gọi API ---
  const fetchStaffs = async () => {
    setLoading(true);
    try {
      // API thật: const res = await axios.get("/api/users?role=staff");
      // Mẫu dữ liệu
      const res = {
        data: [
          {
            _id: "1",
            fullName: "Nguyễn Văn A",
            email: "a@example.com",
            phone: "0912345678",
            gender: "male",
            isActive: true,
            role: "staff",
            createdAt: "2024-10-01",
          },
          {
            _id: "2",
            fullName: "Trần Thị B",
            email: "b@example.com",
            phone: "0987654321",
            gender: "female",
            isActive: false,
            role: "staff",
            createdAt: "2024-09-20",
          },
        ],
      };
      setStaffs(res.data);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách nhân viên.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  // --- Bộ lọc tìm kiếm ---
  const filtered = staffs.filter((staff) =>
    staff.fullName.toLowerCase().includes(search.toLowerCase())
  );

  // --- Xử lý thêm nhân viên ---
  const handleAddStaff = async () => {
    try {
      const values = await form.validateFields();
      // API thật: await axios.post("/api/users", { ...values, role: "staff" });
      message.success("Thêm nhân viên mới thành công!");
      setOpenModal(false);
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("Không thể thêm nhân viên.");
    }
  };

  // --- Cấu hình bảng ---
  const columns = [
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender) =>
        gender === "male" ? "Nam" : gender === "female" ? "Nữ" : "Khác",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (active) =>
        active ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Tạm khóa</Tag>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button size="small" type="link">
            Sửa
          </Button>
          <Button size="small" danger type="link">
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Tiêu đề */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Quản lý nhân viên</h2>
          <p style={{ color: "#888", margin: 0 }}>
            Thêm, chỉnh sửa và quản lý danh sách nhân viên.
          </p>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchStaffs}
            loading={loading}
          >
            Tải lại
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpenModal(true)}
          >
            Thêm nhân viên
          </Button>
        </Space>
      </div>

      {/* Thanh tìm kiếm */}
      <Card style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm theo tên nhân viên..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
      </Card>

      {/* Bảng danh sách */}
      <Card bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey={(r) => r._id}
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* Modal thêm nhân viên */}
      <Modal
        title="Thêm nhân viên mới"
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={handleAddStaff}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Giới tính" name="gender" initialValue="male">
            <Select>
              <Option value="male">Nam</Option>
              <Option value="female">Nữ</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffsPage;
