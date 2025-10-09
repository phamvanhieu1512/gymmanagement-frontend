// MembershipPackage.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Popconfirm,
  message,
  Row,
  Col,
} from "antd";
import axios from "axios";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;

const defaultFormValues = {
  name: "",
  durationInDays: 30,
  price: 0,
  description: "",
  type: "standard",
  sessionsWithTrainer: 0,
};

const MembershipPackage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null); // null = create
  const [form] = Form.useForm();

  // --- Fetch packages ---
  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/packages"); // -> backend endpoint should return list
      setPackages(res.data || []);
    } catch (err) {
      console.error(err);
      message.error("Không tải được danh sách gói. Kiểm tra backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // --- Open modal for create/edit ---
  const openCreateModal = () => {
    setEditingPkg(null);
    form.resetFields();
    form.setFieldsValue(defaultFormValues);
    setModalVisible(true);
  };

  const openEditModal = (pkg) => {
    setEditingPkg(pkg);
    form.setFieldsValue({
      name: pkg.name,
      durationInDays: pkg.durationInDays,
      price: pkg.price,
      description: pkg.description,
      type: pkg.type,
      sessionsWithTrainer: pkg.sessionsWithTrainer,
    });
    setModalVisible(true);
  };

  // --- Create or update ---
  const handleSave = async (values) => {
    try {
      setLoading(true);
      if (editingPkg) {
        // Update
        // const res = await axios.put(`/api/packages/${editingPkg._id}`, values);
        message.success("Cập nhật gói thành công");
      } else {
        // Create
        // const res = await axios.post("/api/packages", values);
        message.success("Tạo gói thành công");
      }
      setModalVisible(false);
      await fetchPackages();
    } catch (err) {
      console.error(err);
      message.error("Lưu gói thất bại");
    } finally {
      setLoading(false);
    }
  };

  // --- Delete ---
  const handleDelete = async (pkgId) => {
    try {
      setLoading(true);
      await axios.delete(`/api/packages/${pkgId}`);
      message.success("Xóa gói thành công");
      await fetchPackages();
    } catch (err) {
      console.error(err);
      message.error("Xóa không thành công");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Tên gói",
      dataIndex: "name",
      key: "name",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (t) => (t === "personal_trainer" ? "Gói PT" : "Standard"),
    },
    {
      title: "Giá (₫)",
      dataIndex: "price",
      key: "price",
      render: (p) => p?.toLocaleString?.() ?? p,
    },
    {
      title: "Thời lượng (ngày)",
      dataIndex: "durationInDays",
      key: "durationInDays",
    },
    {
      title: "Buổi PT",
      dataIndex: "sessionsWithTrainer",
      key: "sessionsWithTrainer",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      width: 250,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            size="small"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa gói này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2 style={{ margin: 0 }}>Quản lý gói tập</h2>
          <div style={{ color: "#666", marginTop: 6 }}>
            Tạo, sửa, xóa gói tập — quản lý buổi PT, giá, thời lượng.
          </div>
        </Col>

        <Col>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              Thêm gói mới
            </Button>
            <Button onClick={fetchPackages}>Tải lại</Button>
          </Space>
        </Col>
      </Row>

      <Card bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={packages}
          columns={columns}
          rowKey={(r) => r._id || r.id}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal Form */}
      <Modal
        title={editingPkg ? "Chỉnh sửa gói tập" : "Tạo gói tập mới"}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={defaultFormValues}
          onFinish={handleSave}
        >
          <Form.Item
            label="Tên gói"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên gói" }]}
          >
            <Input placeholder="Ví dụ: Gói cơ bản 3 tháng" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Thời lượng (ngày)"
                name="durationInDays"
                rules={[{ required: true, message: "Nhập thời lượng" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Giá (VND)"
                name="price"
                rules={[{ required: true, message: "Nhập giá" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Loại" name="type">
                <Select>
                  <Option value="standard">Standard</Option>
                  <Option value="personal_trainer">Personal Trainer</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Số buổi PT" name="sessionsWithTrainer">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingPkg ? "Lưu thay đổi" : "Tạo gói"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MembershipPackage;
