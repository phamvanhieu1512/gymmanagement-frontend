import {
  Button,
  Card,
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
  KeyOutlined,
} from "@ant-design/icons";
import * as UserService from "../../../services/Admin/UserService";
import { useMutationHook } from "../../../hooks/useMutationHook";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { getValidToken } from "../../../services/getValidToken";
import { Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const UserPage = () => {
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
    return UserService.createUser(data, token);
  });

  const getAllMembers = async () => {
    const token = await getValidToken();
    if (!token) {
      return { status: "ERROR", message: "Token không hợp lệ", data: [] };
    }

    const res = await UserService.getAllMembers(token);
    return res;
  };

  const { isLoading: isLoadingUsers, data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: getAllMembers,
  });

  const handleResetPassword = async (email) => {
    try {
      const token = await getValidToken();

      const res = await UserService.resetPasswordUser({ email }, token);

      if (res.status === "OK") {
        message.success(
          `Reset mật khẩu thành công! Mật khẩu mới: ${res.newPassword}`
        );
      } else {
        message.error(res.message || "Reset mật khẩu thất bại");
      }
    } catch (error) {
      message.error("Lỗi hệ thống! Không thể reset mật khẩu");
      console.error(error);
    }
  };

  const filteredUsers = usersData?.data.filter((user) => {
    const search = searchValue.toLowerCase();

    const fullNameMatch = user.fullName?.toLowerCase().includes(search);
    const emailMatch = user.email?.toLowerCase().includes(search);
    const phoneMatch = (user.phone || "").includes(search);

    return fullNameMatch || emailMatch || phoneMatch;
  });

  const infoMember = (user) => {
    setSelectedUser(user);
    setIsInfoModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditUser(user); // lưu thông tin user cần chỉnh sửa
    form.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      dateOfBirth: dayjs(user.dateOfBirth),
      role: user.role,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleEditUser = async (values) => {
    const token = await getValidToken();

    // Nếu có chọn ảnh → upload avatar trước
    if (selectedFile) {
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      await UserService.uploadAvatar(editUser._id, formData, token);
    }

    // Sau đó mới update thông tin user
    const res = await UserService.updateMember(editUser._id, values, token);

    if (res.status === "ERROR") {
      message.error(res.message || "Cập nhật thất bại");
      return;
    }

    message.success("Cập nhật người dùng thành công!");
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

        message.success("Tạo người dùng thành công!");
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
        Quản lý người dùng
      </Title>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col>
            <Input.Search
              placeholder="Tìm kiếm Họ tên, Email, Số điện thoại..."
              allowClear
              style={{ width: 300 }}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </Col>
        </Row>
        <Button
          onClick={() => setIsModalOpen(true)}
          type="primary"
          icon={<PlusOutlined />}
        >
          Thêm người dùng
        </Button>
      </div>

      <Table
        rowKey="_id"
        loading={isLoadingUsers}
        dataSource={filteredUsers}
        columns={[
          {
            title: "STT",
            render: (_, __, index) => index + 1,
            width: 70,
          },
          {
            title: "Họ tên",
            dataIndex: "fullName",
            ellipsis: { showTitle: true },
            render: (text) => (
              <div
                style={{
                  maxWidth: 150,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {text}
              </div>
            ),
          },
          {
            title: "Email",
            dataIndex: "email",
            ellipsis: { showTitle: true },
            render: (text) => (
              <div
                style={{
                  maxWidth: 200,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {text}
              </div>
            ),
          },
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
              <Space style={{ whiteSpace: "nowrap" }}>
                <Button onClick={() => infoMember(record)}>
                  <InfoCircleOutlined />
                </Button>
                <Button onClick={() => openEditModal(record)}>
                  <EditOutlined />
                </Button>
              </Space>
            ),
            width: 120, // cố định chiều rộng cột
          },
        ]}
        pagination={{
          pageSize: 10, // mỗi trang 10 người
        }}
      />

      <Modal
        title="Thêm người dùng mới"
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

            <Form.Item name="role" hidden initialValue="member">
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
            Thêm người dùng
          </Button>
        </Form>
      </Modal>

      <Modal
        title="Thông tin người dùng"
        open={isInfoModalOpen}
        onCancel={() => setIsInfoModalOpen(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setIsInfoModalOpen(false)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedUser && (
          <>
            {/* Avatar và Thông tin cơ bản */}
            <Card
              bordered
              style={{
                marginBottom: 16,
                borderRadius: 10,
                textAlign: "center",
              }}
            >
              <img
                src={
                  selectedUser.avatarUrl
                    ? `${url}${selectedUser.avatarUrl}`
                    : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt={selectedUser.fullName}
                style={{
                  width: 130,
                  height: 130,
                  borderRadius: "50%",
                  objectFit: "cover",
                  boxShadow: "0 0 6px rgba(0,0,0,0.2)",
                  marginBottom: 12,
                }}
              />
              <Typography.Title level={5}>
                {selectedUser.fullName}
              </Typography.Title>
              <Row gutter={[16, 12]}>
                <Col span={12}>
                  <p>
                    <strong>Email:</strong> {selectedUser.email || "-"}
                  </p>
                </Col>
                <Col span={12}>
                  <p>
                    <strong>Số điện thoại:</strong> {selectedUser.phone || "-"}
                  </p>
                </Col>
                <Col span={12}>
                  <p>
                    <strong>Vai trò:</strong> {selectedUser.role}
                  </p>
                </Col>
                <Col span={12}>
                  <p>
                    <strong>Giới tính:</strong> {selectedUser.gender || "-"}
                  </p>
                </Col>
                <Col span={12}>
                  <p>
                    <strong>Ngày sinh:</strong>{" "}
                    {selectedUser.dateOfBirth
                      ? dayjs(selectedUser.dateOfBirth).format("DD/MM/YYYY")
                      : "-"}
                  </p>
                </Col>
                <Col span={12}>
                  <p>
                    <strong>Trạng thái:</strong>{" "}
                    {selectedUser.isActive ? (
                      <Tag color="green">Hoạt động</Tag>
                    ) : (
                      <Tag color="red">Khóa</Tag>
                    )}
                  </p>
                </Col>
              </Row>
            </Card>

            {/* Health Info */}
            {selectedUser.healthInfo && (
              <Card
                title="Thông tin sức khỏe"
                style={{ marginBottom: 16, borderRadius: 10 }}
              >
                <Row gutter={[16, 12]}>
                  <Col span={12}>
                    <p>
                      <strong>Chiều cao:</strong>{" "}
                      {selectedUser.healthInfo.height ?? "-"} cm
                    </p>
                  </Col>
                  <Col span={12}>
                    <p>
                      <strong>Cân nặng:</strong>{" "}
                      {selectedUser.healthInfo.weight ?? "-"} kg
                    </p>
                  </Col>
                  <Col span={12}>
                    <p>
                      <strong>BMI:</strong> {selectedUser.healthInfo.bmi ?? "-"}
                    </p>
                  </Col>
                  <Col span={12}>
                    <p>
                      <strong>Mục tiêu tập luyện:</strong>{" "}
                      {selectedUser.healthInfo.fitnessGoal ?? "-"}
                    </p>
                  </Col>
                  <Col span={24}>
                    <p>
                      <strong>Tiền sử bệnh:</strong>{" "}
                      {selectedUser.healthInfo.medicalHistory?.length
                        ? selectedUser.healthInfo.medicalHistory.join(", ")
                        : "Không có"}
                    </p>
                  </Col>
                </Row>
              </Card>
            )}

            {/* Reset mật khẩu */}
            <Button
              onClick={() => handleResetPassword(selectedUser.email)}
              type="primary"
              danger
              block
              size="large"
            >
              <KeyOutlined /> Reset Mật Khẩu
            </Button>
          </>
        )}
      </Modal>

      <Modal
        title="Chỉnh sửa người dùng"
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

            <Col span={12}>
              <Form.Item
                label="Trạng thái hoạt động"
                name="isActive"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái" },
                ]}
              >
                <Select
                  placeholder="Chọn trạng thái"
                  options={[
                    { label: "Đang hoạt động", value: true },
                    { label: "Ngừng hoạt động", value: false },
                  ]}
                />
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
            Cập nhật người dùng
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default UserPage;
