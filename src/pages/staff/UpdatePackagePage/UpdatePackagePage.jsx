import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Space,
  Typography,
} from "antd";
import { EditOutlined, ReloadOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;
const { Option } = Select;

const UpdatePackagePage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // ✅ Giả lập dữ liệu trước khi có backend
  const fetchPackages = async () => {
    setLoading(true);
    try {
      // const res = await axios.get("/api/staff/packages");
      const res = {
        data: [
          {
            _id: "1",
            name: "Gói cơ bản",
            durationInDays: 30,
            price: 300000,
            type: "standard",
            sessionsWithTrainer: 0,
            description: "Gói tập gym không HLV trong 1 tháng",
          },
          {
            _id: "2",
            name: "Gói huấn luyện cá nhân",
            durationInDays: 60,
            price: 1200000,
            type: "personal_trainer",
            sessionsWithTrainer: 8,
            description: "Tập cùng huấn luyện viên 8 buổi/2 tháng",
          },
        ],
      };
      setPackages(res.data);
    } catch (error) {
      message.error("Không thể tải danh sách gói tập");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const openEditModal = (record) => {
    setEditingPackage(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      // await axios.put(`/api/staff/packages/${editingPackage._id}`, values);
      message.success("Cập nhật gói tập thành công!");
      setIsModalVisible(false);
      fetchPackages();
    } catch (err) {
      message.error("Có lỗi xảy ra khi lưu gói tập");
    }
  };

  const columns = [
    {
      title: "Tên gói",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Thời hạn (ngày)",
      dataIndex: "durationInDays",
      key: "durationInDays",
      align: "center",
    },
    {
      title: "Giá (VNĐ)",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (value) => value.toLocaleString(),
    },
    {
      title: "Loại gói",
      dataIndex: "type",
      key: "type",
      align: "center",
      render: (type) =>
        type === "personal_trainer" ? "Huấn luyện viên cá nhân" : "Cơ bản",
    },
    {
      title: "Số buổi PT",
      dataIndex: "sessionsWithTrainer",
      key: "sessionsWithTrainer",
      align: "center",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => openEditModal(record)}
        >
          Chỉnh sửa
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Cập nhật gói tập
          </Title>
          <p style={{ color: "#888" }}>
            Quản lý và chỉnh sửa thông tin các gói tập.
          </p>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchPackages}>
          Làm mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={packages}
        rowKey="_id"
        bordered
        loading={loading}
      />

      {/* Modal chỉnh sửa gói tập */}
      <Modal
        title="Cập nhật gói tập"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSave}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên gói"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên gói" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Thời hạn (ngày)"
            name="durationInDays"
            rules={[{ required: true, message: "Vui lòng nhập thời hạn" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Giá (VNĐ)"
            name="price"
            rules={[{ required: true, message: "Vui lòng nhập giá" }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </Form.Item>

          <Form.Item label="Loại gói" name="type">
            <Select>
              <Option value="standard">Cơ bản</Option>
              <Option value="personal_trainer">Huấn luyện viên cá nhân</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Số buổi với HLV" name="sessionsWithTrainer">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UpdatePackagePage;
