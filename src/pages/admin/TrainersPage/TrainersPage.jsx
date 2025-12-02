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
  const [filters, setFilters] = useState({
    gender: null,
    specialty: "",
    experienceMin: null,
    experienceMax: null,
  });

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

  const filteredUsers = usersData?.data.filter((user) => {
    const search = searchValue.toLowerCase();
    const fullNameMatch = user.fullName.toLowerCase().includes(search);
    const emailMatch = user.email.toLowerCase().includes(search);
    const phoneMatch = user.phone.includes(search);

    const genderMatch = filters.gender ? user.gender === filters.gender : true;
    const specialtyMatch = filters.specialty
      ? user.trainerProfile?.specialty
          ?.toLowerCase()
          .includes(filters.specialty.toLowerCase())
      : true;
    const experienceMatch =
      (filters.experienceMin === null ||
        user.trainerProfile?.experienceYears >= filters.experienceMin) &&
      (filters.experienceMax === null ||
        user.trainerProfile?.experienceYears <= filters.experienceMax);

    return (
      (fullNameMatch || emailMatch || phoneMatch) &&
      genderMatch &&
      specialtyMatch &&
      experienceMatch
    );
  });

  const openEditModal = (user) => {
    setEditUser(user);
    form.setFieldsValue({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      gender: user.gender || undefined,
      dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : null,
      role: user.role || "trainer",
      avatarUrl:
        user.avatarUrl ||
        "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      isActive: user.isActive,
      trainerProfile: {
        specialty: user.trainerProfile?.specialty || "",
        experienceYears: user.trainerProfile?.experienceYears || 0,
        certifications: user.trainerProfile?.certifications || [],
        bio: user.trainerProfile?.bio || "",
      },
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ color: "#ffffff" }}>
          Quản lý huấn luyện viên
        </Title>

        <Button
          onClick={() => setIsModalOpen(true)}
          type="primary"
          icon={<PlusOutlined />}
        >
          Thêm huấn luyện viên
        </Button>
      </div>

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
        <Col>
          <Select
            placeholder="Giới tính"
            allowClear
            style={{ width: 150 }}
            value={filters.gender}
            onChange={(value) => setFilters({ ...filters, gender: value })}
            options={[
              { label: "Nam", value: "male" },
              { label: "Nữ", value: "female" },
              { label: "Khác", value: "other" },
            ]}
          />
        </Col>

        <Col>
          <Input
            placeholder="Chuyên môn"
            style={{ width: 150 }}
            value={filters.specialty}
            onChange={(e) =>
              setFilters({ ...filters, specialty: e.target.value })
            }
          />
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Item
            label={
              <span style={{ color: "white" }}>Kinh nghiệm tối thiểu</span>
            }
          >
            <Input
              type="number"
              value={filters.experienceMin || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  experienceMin: e.target.value
                    ? parseInt(e.target.value)
                    : null,
                })
              }
              style={{ width: 150 }}
              placeholder="Min"
            />
          </Form.Item>
        </Col>

        <Col>
          <Form.Item
            label={<span style={{ color: "white" }}>Kinh nghiệm tối đa</span>}
          >
            <Input
              type="number"
              value={filters.experienceMax || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  experienceMax: e.target.value
                    ? parseInt(e.target.value)
                    : null,
                })
              }
              style={{ width: 150 }}
              placeholder="Max"
            />
          </Form.Item>
        </Col>
      </Row>

      <Table
        rowKey="_id"
        loading={isLoadingUsers}
        dataSource={filteredUsers || []}
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
            {/* Avatar + Tên */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <img
                src={`${url}${selectedUser.avatarUrl}`}
                alt={selectedUser.fullName}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginBottom: 8,
                }}
              />
              <h3>{selectedUser.fullName}</h3>
            </div>

            {/* Thông tin cơ bản + trạng thái */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>Giới tính:</strong> {selectedUser.gender}
                </p>
                <p>
                  <strong>Vai trò:</strong> {selectedUser.role}
                </p>
              </Col>
              <Col span={12}>
                <p>
                  <strong>Số điện thoại:</strong> {selectedUser.phone}
                </p>
                <p>
                  <strong>Ngày sinh:</strong>{" "}
                  {dayjs(selectedUser.dateOfBirth).format("DD/MM/YYYY")}
                </p>
                <p>
                  <strong>Trạng thái:</strong>{" "}
                  <Tag color={selectedUser.isActive ? "green" : "red"}>
                    {selectedUser.isActive ? "Hoạt động" : "Khóa"}
                  </Tag>
                </p>
              </Col>
            </Row>

            {/* Trainer Profile */}
            {selectedUser?.trainerProfile && (
              <>
                <hr style={{ margin: "16px 0" }} />
                <Row gutter={16}>
                  <Col span={12}>
                    <p>
                      <strong>Chuyên môn:</strong>{" "}
                      {selectedUser.trainerProfile.specialty || "-"}
                    </p>
                    <p>
                      <strong>Kinh nghiệm (năm):</strong>{" "}
                      {selectedUser.trainerProfile.experienceYears || 0}
                    </p>
                    <p>
                      <strong>Chứng chỉ:</strong>{" "}
                      {selectedUser.trainerProfile.certifications?.length
                        ? selectedUser.trainerProfile.certifications.join(", ")
                        : "-"}
                    </p>
                  </Col>
                  <Col span={12}>
                    <p>
                      <strong>Bio:</strong>{" "}
                      {selectedUser.trainerProfile.bio || "-"}
                    </p>
                    <p>
                      <strong>Đánh giá trung bình:</strong>{" "}
                      {selectedUser.trainerProfile.ratingAverage || 0}
                    </p>
                  </Col>
                </Row>
              </>
            )}
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
            {/* Avatar */}
            <Col span={24} style={{ textAlign: "center", marginBottom: 16 }}>
              {editUser?.avatarUrl && (
                <img
                  src={`${url}${editUser.avatarUrl}`}
                  alt={editUser.fullName}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginBottom: 8,
                  }}
                />
              )}
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

            {/* Thông tin cơ bản */}
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

            {/* Trạng thái hoạt động */}
            <Col span={12}>
              <Form.Item label="Trạng thái hoạt động" name="isActive">
                <Select
                  placeholder="Chọn trạng thái"
                  options={[
                    { label: "Đang hoạt động", value: true },
                    { label: "Ngừng hoạt động", value: false },
                  ]}
                  allowClear
                />
              </Form.Item>
            </Col>

            {/* Trainer Profile */}
            <Col span={12}>
              <Form.Item
                label="Chuyên môn"
                name={["trainerProfile", "specialty"]}
              >
                <Input placeholder="Ví dụ: Yoga, Gym..." />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Kinh nghiệm (năm)"
                name={["trainerProfile", "experienceYears"]}
              >
                <Input type="number" min={0} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Chứng chỉ (ngăn cách bằng dấu ,)"
                name={["trainerProfile", "certifications"]}
                getValueProps={(value) => ({
                  value: value ? value.join(", ") : "",
                })}
                getValueFromEvent={(e) =>
                  e.target.value.split(",").map((v) => v.trim())
                }
              >
                <Input placeholder="Ví dụ: ACE, NASM" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Bio" name={["trainerProfile", "bio"]}>
                <Input.TextArea rows={3} />
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
