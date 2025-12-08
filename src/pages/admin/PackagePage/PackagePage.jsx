import {
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  Modal,
  Popconfirm,
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
  DeleteOutlined,
  StopOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import * as PackageService from "../../../services/Admin/PackageService";
import * as TrainerService from "../../../services/Admin/TrainerService";
import { useMutationHook } from "../../../hooks/useMutationHook";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getValidToken } from "../../../services/getValidToken";

const PackagePage = () => {
  const { Title } = Typography;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPackage, setEditPackage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    name: "",
    type: null,
    isActive: null,
    minPrice: "",
    maxPrice: "",
    minDuration: "",
    maxDuration: "",
  });
  const [selectedType, setSelectedType] = useState("standard");
  const [form] = Form.useForm();

  const mutationcreatePackage = useMutationHook(async (data) => {
    const token = await getValidToken();
    return PackageService.createPackage(data, token);
  });

  const getAllTrainers = async () => {
    const token = await getValidToken();
    return TrainerService.getAllTrainers(token);
  };

  const { data: trainersData } = useQuery({
    queryKey: ["trainers"],
    queryFn: getAllTrainers,
  });

  const getAllPackages = async () => {
    const token = await getValidToken();
    if (!token) {
      return { status: "ERROR", message: "Token không hợp lệ", data: [] };
    }

    const res = await PackageService.getAllPackages(token);
    return res;
  };

  const { isLoading: isLoadingPackages, data: PackagesData } = useQuery({
    queryKey: ["packages"],
    queryFn: getAllPackages,
  });

  const openDetailModal = (pkg) => {
    setSelectedPackage(pkg);
    setIsDetailModalOpen(true);
  };

  const openEditModal = (Package) => {
    setEditPackage(Package);
    form.setFieldsValue({
      name: Package.name,
      durationInDays: Package.durationInDays,
      price: Package.price,
      type: Package.type,
      sessionsWithTrainer: Package.sessionsWithTrainer,
      maxMembers: Package.maxMembers,
      description: Package.description,
      isActive: Package.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleEditPackage = async (values) => {
    const token = await getValidToken();

    const res = await PackageService.updatePackage(
      editPackage._id,
      values,
      token
    );

    if (res.status === "ERROR") {
      message.error(res.message || "Cập nhật thất bại");
      return;
    }

    message.success("Cập nhật gói tập thành công!");
    queryClient.invalidateQueries(["packages"]);

    setIsEditModalOpen(false);
    form.resetFields();
    setSelectedFile(null);
  };

  const handleDelete = async (pkg) => {
    const token = await getValidToken();

    const res = await PackageService.updatePackage(
      pkg._id,
      { isActive: false },
      token
    );

    if (res.status === "ERROR") {
      message.error(res.message || "Cập nhật trạng thái thất bại");
      return;
    }

    message.success("Đã chuyển gói tập sang trạng thái NGỪNG hoạt động!");
    queryClient.invalidateQueries(["packages"]);
  };

  const onFinish = (values) => {
    mutationcreatePackage.mutate(values, {
      onSuccess: (res) => {
        if (res.data?.status === "ERROR") {
          message.error(res.data.message);
          return;
        }

        message.success("Tạo gói tập thành công!");
        queryClient.invalidateQueries(["packages"]);

        setIsModalOpen(false);
        form.resetFields();
      },
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const filterPackages = () => {
    if (!PackagesData?.data) return [];

    return PackagesData.data.filter((pkg) => {
      const matchName =
        !filters.name ||
        pkg.name.toLowerCase().includes(filters.name.toLowerCase());

      const matchType = !filters.type || pkg.type === filters.type;

      const matchStatus =
        filters.isActive === null || pkg.isActive === filters.isActive;

      const matchMinPrice =
        !filters.minPrice || pkg.price >= Number(filters.minPrice);

      const matchMaxPrice =
        !filters.maxPrice || pkg.price <= Number(filters.maxPrice);

      const matchMinDuration =
        !filters.minDuration ||
        pkg.durationInDays >= Number(filters.minDuration);

      const matchMaxDuration =
        !filters.maxDuration ||
        pkg.durationInDays <= Number(filters.maxDuration);

      return (
        matchName &&
        matchType &&
        matchStatus &&
        matchMinPrice &&
        matchMaxPrice &&
        matchMinDuration &&
        matchMaxDuration
      );
    });
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
          Quản lý gói tập
        </Title>

        <Button
          onClick={() => setIsModalOpen(true)}
          type="primary"
          icon={<PlusOutlined />}
        >
          Thêm gói tập
        </Button>
      </div>

      <Card
        style={{
          marginBottom: 16,
          background: "#fff",
          borderRadius: 8,
          padding: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Row gutter={[16, 16]}>
          {/* Tên gói */}
          <Col span={6}>
            <Input
              placeholder="Tên gói tập..."
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
          </Col>

          {/* Loại gói */}
          <Col span={4}>
            <Select
              placeholder="Loại gói"
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value })}
              allowClear
              style={{ width: "100%" }}
              options={[
                { label: "Standard", value: "standard" },
                { label: "Gói PT", value: "personal_trainer" },
              ]}
            />
          </Col>

          {/* Trạng thái */}
          <Col span={4}>
            <Select
              placeholder="Trạng thái"
              value={filters.isActive !== null ? filters.isActive : undefined}
              onChange={(value) => setFilters({ ...filters, isActive: value })}
              allowClear
              style={{ width: "100%" }}
              options={[
                { label: "Đang hoạt động", value: true },
                { label: "Ngừng hoạt động", value: false },
              ]}
            />
          </Col>

          {/* Giá min */}
          <Col span={5}>
            <Input
              placeholder="Giá min"
              type="number"
              value={filters.minPrice}
              onChange={(e) =>
                setFilters({ ...filters, minPrice: e.target.value })
              }
            />
          </Col>

          {/* Giá max */}
          <Col span={5}>
            <Input
              placeholder="Giá max"
              type="number"
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters({ ...filters, maxPrice: e.target.value })
              }
            />
          </Col>
        </Row>

        {/* Hàng 2 */}
        <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
          {/* Ngày min */}
          <Col span={6}>
            <Input
              placeholder="Ngày min"
              type="number"
              value={filters.minDuration}
              onChange={(e) =>
                setFilters({ ...filters, minDuration: e.target.value })
              }
            />
          </Col>

          {/* Ngày max */}
          <Col span={6}>
            <Input
              placeholder="Ngày max"
              type="number"
              value={filters.maxDuration}
              onChange={(e) =>
                setFilters({ ...filters, maxDuration: e.target.value })
              }
            />
          </Col>
        </Row>
      </Card>

      <Table
        rowKey="_id"
        loading={isLoadingPackages}
        dataSource={filterPackages()}
        locale={{
          emptyText:
            filterPackages().length === 0
              ? "Không tìm thấy gói tập nào"
              : "Chưa có dữ liệu",
        }}
        columns={[
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
            title: "Số người tối đa",
            dataIndex: "maxMembers",
            key: "maxMembers",
          },
          {
            title: "Đã đăng ký",
            dataIndex: "registeredCount",
            key: "registeredCount",
          },
          {
            title: "Trạng thái",
            dataIndex: "isActive",
            key: "isActive",
            render: (active) =>
              active ? (
                <Tag color="green">Đang hoạt động</Tag>
              ) : (
                <Tag color="red">Ngừng</Tag>
              ),
          },
          {
            title: "Hành động",
            key: "actions",
            width: 160,
            render: (_, record) => (
              <Space>
                <Button
                  type="link"
                  size="small"
                  onClick={() => openDetailModal(record)}
                >
                  <InfoCircleOutlined style={{ fontSize: "20px" }} />
                </Button>
                <Button
                  type="link"
                  onClick={() => openEditModal(record)}
                  size="small"
                >
                  <EditOutlined style={{ fontSize: "20px" }} />
                </Button>
                <Popconfirm
                  title="Xác nhận Ngừng gói này?"
                  onConfirm={() => handleDelete(record)}
                  okText="Ngừng"
                  cancelText="Hủy"
                >
                  <Button danger type="link" size="small">
                    <StopOutlined style={{ fontSize: "20px" }} />
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
        pagination={{
          pageSize: 10,
        }}
      />

      <Modal
        title="Thêm gói tập mới"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form layout="vertical" onFinish={onFinish} form={form}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên gói tập"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên gói tập" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Giá (₫)"
                name="price"
                rules={[{ required: true, message: "Vui lòng nhập giá" }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Thời lượng (ngày)"
                name="durationInDays"
                rules={[{ required: true }]}
              >
                <Input type="number" min={1} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Loại gói"
                name="type"
                rules={[{ required: true, message: "Vui lòng chọn loại gói" }]}
              >
                <Select
                  options={[
                    { label: "Standard", value: "standard" },
                    { label: "Personal Trainer", value: "personal_trainer" },
                  ]}
                  onChange={(value) => setSelectedType(value)}
                />
              </Form.Item>
            </Col>

            {/* Chỉ hiện khi chọn PT */}
            {selectedType === "personal_trainer" && (
              <Col span={24}>
                <Form.Item
                  label="Huấn luyện viên"
                  name="trainerId"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn huấn luyện viên",
                    },
                  ]}
                >
                  <Select
                    placeholder="Chọn PT..."
                    options={
                      trainersData?.data?.map((t) => ({
                        value: t._id,
                        label: t.fullName,
                      })) || []
                    }
                  />
                </Form.Item>
              </Col>
            )}

            <Col span={12}>
              <Form.Item label="Buổi tập với PT" name="sessionsWithTrainer">
                <Input type="number" min={0} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Số thành viên tối đa" name="maxMembers">
                <Input type="number" min={1} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Mô tả" name="description">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={mutationcreatePackage.isLoading}
          >
            Thêm gói tập
          </Button>
        </Form>
      </Modal>

      <Modal
        title="Chi tiết gói tập"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={600} // rộng hơn, dễ nhìn
      >
        {selectedPackage && (
          <Descriptions
            bordered
            column={1}
            size="middle"
            labelStyle={{ fontWeight: 600, width: 180 }}
            contentStyle={{ fontWeight: 400 }}
          >
            <Descriptions.Item label="Tên gói">
              {selectedPackage.name}
            </Descriptions.Item>

            <Descriptions.Item label="Loại">
              {selectedPackage.type === "personal_trainer"
                ? "Gói PT"
                : "Standard"}
            </Descriptions.Item>

            <Descriptions.Item label="Giá">
              {selectedPackage.price?.toLocaleString()} ₫
            </Descriptions.Item>

            <Descriptions.Item label="Thời lượng">
              {selectedPackage.durationInDays} ngày
            </Descriptions.Item>

            <Descriptions.Item label="Buổi PT">
              {selectedPackage.sessionsWithTrainer || 0}
            </Descriptions.Item>

            <Descriptions.Item label="Số người tối đa">
              {selectedPackage.maxMembers || "Không giới hạn"}
            </Descriptions.Item>

            <Descriptions.Item label="Đã đăng ký">
              {selectedPackage.registeredCount}
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái">
              {selectedPackage.isActive ? (
                <Tag color="green">Đang hoạt động</Tag>
              ) : (
                <Tag color="red">Ngừng</Tag>
              )}
            </Descriptions.Item>

            {selectedPackage.description && (
              <Descriptions.Item label="Mô tả">
                {selectedPackage.description}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      <Modal
        title="Chỉnh sửa gói tập"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleEditPackage}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Tên gói" name="name">
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Giá (₫)" name="price">
                <Input type="number" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Thời lượng (ngày)" name="durationInDays">
                <Input type="number" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Loại" name="type">
                <Select
                  options={[
                    { value: "standard", label: "Standard" },
                    { value: "personal_trainer", label: "Gói PT" },
                  ]}
                  onChange={(value) => {
                    form.setFieldsValue({ type: value });
                  }}
                />
              </Form.Item>
            </Col>

            {/* Chỉ hiện khi type = PT */}
            {form.getFieldValue("type") === "personal_trainer" && (
              <Col span={24}>
                <Form.Item label="Huấn luyện viên" name="trainerId">
                  <Select
                    placeholder="Chọn PT..."
                    options={
                      trainersData?.data?.map((t) => ({
                        label: t.fullName,
                        value: t._id,
                      })) || []
                    }
                  />
                </Form.Item>
              </Col>
            )}

            <Col span={12}>
              <Form.Item label="Buổi PT" name="sessionsWithTrainer">
                <Input type="number" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Số thành viên tối đa" name="maxMembers">
                <Input type="number" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Mô tả" name="description">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Trạng thái"
                name="isActive"
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { label: "Đang hoạt động", value: true },
                    { label: "Ngừng hoạt động", value: false },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Button type="primary" htmlType="submit" block>
            Cập nhật gói tập
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default PackagePage;
