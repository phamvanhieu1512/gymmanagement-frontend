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
  Upload,
} from "antd";
import React, { useState } from "react";
import {
  EditOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  UploadOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import * as StaffService from "../../../services/Admin/StaffService";
import * as UserService from "../../../services/Admin/UserService";

import { useMutationHook } from "../../../hooks/useMutationHook";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { getValidToken } from "../../../services/getValidToken";

const StaffsPage = () => {
  const { Title } = Typography;
  const [searchValue, setSearchValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const url = "http://localhost:5000";

  const mutationCreateStaff = useMutationHook(async (data) => {
    const token = await getValidToken();
    return StaffService.createUser(data, token);
  });

  const getAllStaffs = async () => {
    const token = await getValidToken();
    if (!token)
      return { status: "ERROR", message: "Token không hợp lệ", data: [] };
    return StaffService.getAllStaffs(token);
  };

  const { isLoading, data: staffData } = useQuery({
    queryKey: ["staffs"],
    queryFn: getAllStaffs,
  });

  const filteredStaffs = staffData?.data.filter((staff) => {
    const search = searchValue.toLowerCase();
    const fullNameMatch = staff.fullName?.toLowerCase().includes(search);
    const emailMatch = staff.email?.toLowerCase().includes(search);
    const phoneMatch = (staff.phone || "").includes(search);
    return fullNameMatch || emailMatch || phoneMatch;
  });

  const viewStaffInfo = (staff) => {
    setSelectedStaff(staff);
    setIsInfoModalOpen(true);
  };

  const openEditModal = (staff) => {
    setEditStaff(staff);
    form.setFieldsValue({
      fullName: staff.fullName,
      email: staff.email,
      phone: staff.phone,
      gender: staff.gender,
      dateOfBirth: dayjs(staff.dateOfBirth),
      role: staff.role,
      avatarUrl: staff.avatarUrl,
      isActive: staff.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleResetPassword = async (email) => {
    try {
      const token = await getValidToken();
      const res = await UserService.resetPasswordUser(email, token);

      if (res.status === "OK") {
        message.success(
          "Reset mật khẩu thành công! Mật khẩu đã được gửi đến email người dùng."
        );
      } else {
        message.error(res.message || "Reset mật khẩu thất bại");
      }
    } catch (error) {
      message.error("Lỗi hệ thống! Không thể reset mật khẩu");
      console.error(error);
    }
  };

  const handleEditStaff = async (values) => {
    const token = await getValidToken();

    if (selectedFile) {
      const formData = new FormData();
      formData.append("avatar", selectedFile);
      await StaffService.uploadAvatar(editStaff._id, formData, token);
    }

    const res = await StaffService.updateTrainer(editStaff._id, values, token);

    if (res.status === "ERROR") {
      message.error(res.message || "Cập nhật thất bại");
      return;
    }

    message.success("Cập nhật nhân viên thành công!");
    queryClient.invalidateQueries(["staffs"]);

    setIsEditModalOpen(false);
    form.resetFields();
    setSelectedFile(null);
  };

  const handleCreateStaff = (values) => {
    mutationCreateStaff.mutate(values, {
      onSuccess: (res) => {
        if (res.data?.status === "ERROR" || res.status === "ERROR") {
          message.error(res.data?.message || res.message);
          return;
        }
        message.success("Tạo nhân viên thành công!");
        queryClient.invalidateQueries(["staffs"]);
        setIsModalOpen(false);
        form.resetFields();
      },
      onError: () => message.error("Lỗi hệ thống! Vui lòng thử lại."),
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    form.resetFields();
    setSelectedFile(null);
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ color: "#ffffff" }}>
        Quản lý nhân viên
      </Title>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Input.Search
          placeholder="Tìm kiếm Họ tên, Email, Số điện thoại..."
          allowClear
          style={{ width: 300 }}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Thêm nhân viên
        </Button>
      </div>

      <Table
        rowKey="_id"
        loading={isLoading}
        dataSource={filteredStaffs}
        columns={[
          { title: "STT", render: (_, __, index) => index + 1, width: 70 },
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
                <Button onClick={() => viewStaffInfo(record)}>
                  <InfoCircleOutlined />
                </Button>
                <Button onClick={() => openEditModal(record)}>
                  <EditOutlined />
                </Button>
              </Space>
            ),
          },
        ]}
        pagination={{ pageSize: 10 }}
      />

      {/* Modal Thêm */}
      <Modal
        title="Thêm nhân viên mới"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleCreateStaff} form={form}>
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
            <Form.Item name="role" hidden initialValue="staff">
              <Input />
            </Form.Item>
            <Form.Item
              name="avatarUrl"
              hidden
              initialValue="images/logo/Default_pfp.jpg"
            >
              <Input />
            </Form.Item>
          </Row>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={mutationCreateStaff.isLoading}
          >
            Thêm nhân viên
          </Button>
        </Form>
      </Modal>

      {/* Modal Thông tin */}
      <Modal
        title="Thông tin nhân viên"
        open={isInfoModalOpen}
        onCancel={() => setIsInfoModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsInfoModalOpen(false)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedStaff && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <img
                src={`${url}${selectedStaff.avatarUrl}`}
                alt={selectedStaff.fullName}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            </div>
            <p>
              <strong>Họ tên:</strong> {selectedStaff.fullName}
            </p>
            <p>
              <strong>Email:</strong> {selectedStaff.email}
            </p>
            <p>
              <strong>Số điện thoại:</strong> {selectedStaff.phone}
            </p>
            <p>
              <strong>Vai trò:</strong> {selectedStaff.role}
            </p>
            <p>
              <strong>Giới tính:</strong> {selectedStaff.gender}
            </p>
            <p>
              <strong>Ngày sinh:</strong>{" "}
              {dayjs(selectedStaff.dateOfBirth).format("DD/MM/YYYY")}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              {selectedStaff.isActive ? "Hoạt động" : "Khóa"}
            </p>
            <Button
              onClick={() => handleResetPassword(selectedStaff.email)}
              type="primary"
              danger
              block
            >
              <KeyOutlined /> Reset Mật Khẩu
            </Button>
          </div>
        )}
      </Modal>

      {/* Modal Sửa */}
      <Modal
        title="Chỉnh sửa nhân viên"
        open={isEditModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleEditStaff}>
          <Row gutter={16}>
            <Col span={24} style={{ textAlign: "center", marginBottom: 16 }}>
              {editStaff?.avatarUrl && (
                <img
                  src={`${url}${editStaff.avatarUrl}`}
                  alt={editStaff.fullName}
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
                    setSelectedFile(file);
                    return false;
                  }}
                >
                  <Button icon={<UploadOutlined />}>Chọn ảnh mới</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
          <Button type="primary" htmlType="submit" block>
            Cập nhật nhân viên
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffsPage;
