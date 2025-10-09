import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Select,
  message,
  Typography,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;
const { Option } = Select;

const MembersPage = () => {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // ✅ Giả lập dữ liệu tạm thời (trước khi có API backend)
  const fetchMembers = async () => {
    setLoading(true);
    try {
      // Thay bằng API thật: const res = await axios.get("/api/staff/members");
      const res = {
        data: [
          {
            _id: "1",
            name: "Nguyễn Văn A",
            phone: "0901234567",
            membership: "Gói tháng",
            status: "active",
            joinDate: "2024-05-01",
          },
          {
            _id: "2",
            name: "Trần Thị B",
            phone: "0987654321",
            membership: "Gói năm",
            status: "inactive",
            joinDate: "2023-12-10",
          },
        ],
      };
      setMembers(res.data);
      setFiltered(res.data);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải danh sách hội viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // ✅ Lọc theo tên hoặc số điện thoại
  const handleSearch = (value) => {
    setSearch(value);
    const lower = value.toLowerCase();
    const filteredData = members.filter(
      (m) =>
        m.name.toLowerCase().includes(lower) ||
        m.phone.toLowerCase().includes(lower)
    );
    setFiltered(filteredData);
  };

  // ✅ Mở modal chỉnh sửa
  const openEditModal = (record) => {
    setSelectedMember(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // ✅ Lưu thay đổi
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      // await axios.put(`/api/staff/members/${selectedMember._id}`, values);
      message.success("Cập nhật thông tin hội viên thành công!");
      setIsModalVisible(false);
    } catch (err) {
      message.error("Có lỗi khi cập nhật!");
    }
  };

  // ✅ Cấu hình bảng
  const columns = [
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Gói tập",
      dataIndex: "membership",
      key: "membership",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "active" ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Ngừng</Tag>
        ),
      filters: [
        { text: "Hoạt động", value: "active" },
        { text: "Ngừng", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Ngày tham gia",
      dataIndex: "joinDate",
      key: "joinDate",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => openEditModal(record)}
          >
            Xem / Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
          alignItems: "center",
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Quản lý hội viên
          </Title>
          <p style={{ color: "#888" }}>
            Xem, tìm kiếm và chỉnh sửa thông tin hội viên.
          </p>
        </div>
        <Space>
          <Input
            placeholder="Tìm kiếm hội viên..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 250 }}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchMembers} />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="_id"
        loading={loading}
        bordered
      />

      {/* Modal chỉnh sửa */}
      <Modal
        title="Cập nhật thông tin hội viên"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSave}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Họ và tên"
            name="name"
            rules={[{ required: true, message: "Nhập họ tên hội viên" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Số điện thoại" name="phone">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Gói tập" name="membership">
            <Input />
          </Form.Item>
          <Form.Item label="Trạng thái" name="status">
            <Select>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Ngừng</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MembersPage;
