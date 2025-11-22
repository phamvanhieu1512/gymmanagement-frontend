import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import React, { useState } from "react";
import {
  EditOutlined,
  PlusOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import * as TrainerService from "../../../services/Admin/TrainerService";
import { useMutationHook } from "../../../hooks/useMutationHook";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { getValidToken } from "../../../services/getValidToken";
import { Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const TrainersPage = () => {
  const { Title } = Typography;
  const { Search } = Input;
  const [searchValue, setSearchValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const queryClient = useQueryClient();

  const [form] = Form.useForm();

  const url = "http://localhost:5000";

  const mutationCreateUser = useMutationHook(async (data) => {
    const token = await getValidToken();
    return TrainerService.createUser(data, token);
  });

  const getAllTrainers = async () => {
    const token = await getValidToken();
    if (!token) {
      return { status: "ERROR", message: "Token không hợp lệ", data: [] };
    }

    const res = await TrainerService.getAllTrainers(token);
    return res;
  };

  const { isLoading: isLoadingUsers, data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: getAllTrainers,
  });

  const infoMember = (user) => {
    setSelectedUser(user);
    setIsInfoModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditUser(user);
    form.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      dateOfBirth: dayjs(user.dateOfBirth),
      role: user.role,
      avatarUrl: user.avatarUrl,
    });
    setIsEditModalOpen(true);
  };

  const handleEditUser = async (values) => {
    const token = await getValidToken();

    // Nếu có chọn ảnh → upload avatar trước
    if (selectedFile) {
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      await TrainerService.uploadAvatar(editUser._id, formData, token);
    }

    // Sau đó mới update thông tin user
    const res = await TrainerService.updateTrainer(editUser._id, values, token);

    if (res.status === "ERROR") {
      message.error(res.message || "Cập nhật thất bại");
      return;
    }

    message.success("Cập nhật huấn luyện viên thành công!");
    queryClient.invalidateQueries(["users"]);

    setIsEditModalOpen(false);
    form.resetFields();
    setSelectedFile(null);
  };

  const onFinish = (values) => {
    mutationCreateUser.mutate(values, {
      onSuccess: (res) => {
        if (res.data?.status === "ERROR") {
          message.error(res.data.message);
          return;
        }

        if (res.status === "ERROR") {
          message.error(res.message);
          return;
        }

        message.success("Tạo huấn luyện viên thành công!");
        queryClient.invalidateQueries(["users"]);
        setIsModalOpen(false);
        form.resetFields();
      },

      onError: (err) => {
        message.error("Lỗi hệ thống! Vui lòng thử lại.");
        console.log("Error:", err);
      },
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ color: "#ffffff" }}>
        Quản lý huấn luyện viên
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
        <Button
          onClick={() => setIsModalOpen(true)}
          type="primary"
          icon={<PlusOutlined />}
        >
          Thêm huấn luyện viên
        </Button>
      </div>

      <Table
        rowKey="_id"
        loading={isLoadingUsers}
        dataSource={usersData?.data || []}
        columns={[
          {
            title: "STT",
            render: (_, __, index) => index + 1,
            width: 70,
          },
          { title: "Họ tên", dataIndex: "fullName" },
          { title: "Email", dataIndex: "email" },
          { title: "Số điện thoại", dataIndex: "phone" },
          { title: "Vai trò", dataIndex: "role" },
          { title: "Giới tính", dataIndex: "gender" },
          {
            title: "Ngày sinh",
            dataIndex: "dateOfBirth",
            render: (dob) => dayjs(dob).format("DD/MM/YYYY"),
          },
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
                <Button onClick={() => infoMember(record)}>
                  <InfoCircleOutlined />
                </Button>
                <Button onClick={() => openEditModal(record)}>
                  <EditOutlined />
                </Button>
              </Space>
            ),
          },
        ]}
        pagination={{
          pageSize: 10, // mỗi trang 10 người
        }}
      />

      <Modal
        title="Thêm huấn luyện viên mới"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        form={form}
      >
        <Form layout="vertical" onFinish={onFinish} form={form}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Ngày sinh"
                name="dateOfBirth"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Giới tính"
                name="gender"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Select
                  options={[
                    { value: "male", label: "Nam" },
                    { value: "female", label: "Nữ" },
                    { value: "other", label: "Khác" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
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
            </Col>

            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Mật khẩu"
                name="passwordHash"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
              >
                <Input.Password />
              </Form.Item>
            </Col>

            <Form.Item name="role" hidden initialValue="trainer">
              <Input />
            </Form.Item>

            <Form.Item
              name="avatarUrl"
              hidden
              initialValue="https://cdn-icons-png.flaticon.com/512/149/149071.png"
            >
              <Input />
            </Form.Item>
          </Row>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={mutationCreateUser.isLoading}
          >
            Thêm huấn luyện viên
          </Button>
        </Form>
      </Modal>

      <Modal
        title="Thông tin huấn luyện viên"
        open={isInfoModalOpen}
        onCancel={() => setIsInfoModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsInfoModalOpen(false)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedUser && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <img
                src={`${url}${selectedUser.avatarUrl}`}
                alt={selectedUser.fullName}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            </div>
            <p>
              <strong>Họ tên:</strong> {selectedUser.fullName}
            </p>
            <p>
              <strong>Email:</strong> {selectedUser.email}
            </p>
            <p>
              <strong>Số điện thoại:</strong> {selectedUser.phone}
            </p>
            <p>
              <strong>Vai trò:</strong> {selectedUser.role}
            </p>
            <p>
              <strong>Giới tính:</strong> {selectedUser.gender}
            </p>
            <p>
              <strong>Ngày sinh:</strong>{" "}
              {dayjs(selectedUser.dateOfBirth).format("DD/MM/YYYY")}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              {selectedUser.isActive ? "Hoạt động" : "Khóa"}
            </p>
          </div>
        )}
      </Modal>

      <Modal
        title="Chỉnh sửa huấn luyện viên"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleEditUser}>
          <Row gutter={16}>
            <Col span={24} style={{ textAlign: "center", marginBottom: 16 }}>
              {editUser?.avatarUrl && (
                <img
                  src={`${url}${selectedUser.avatarUrl}`}
                  alt={selectedUser.fullName}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              )}
            </Col>
            <Col span={12}>
              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
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
            </Col>

            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Giới tính"
                name="gender"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Select
                  options={[
                    { value: "male", label: "Nam" },
                    { value: "female", label: "Nữ" },
                    { value: "other", label: "Khác" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Ngày sinh"
                name="dateOfBirth"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Ảnh đại diện">
                <Upload
                  listType="picture"
                  maxCount={1}
                  beforeUpload={(file) => {
                    // Lưu file vào state tạm để submit cùng form
                    setSelectedFile(file);
                    return false; // false để không tự upload
                  }}
                >
                  <Button icon={<UploadOutlined />}>Chọn ảnh mới</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Button type="primary" htmlType="submit" block>
            Cập nhật huấn luyện viên
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default TrainersPage;
