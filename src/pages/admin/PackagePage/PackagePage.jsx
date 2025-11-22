import {
  Button,
  Card,
  Col,
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
import { EditOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import * as PackageService from "../../../services/Admin/PackageService";
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
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [form] = Form.useForm();

  const mutationcreatePackage = useMutationHook(async (data) => {
    const token = await getValidToken();
    return PackageService.createPackage(data, token);
  });

  const getAllPackage = async () => {
    const token = await getValidToken();
    if (!token) {
      return { status: "ERROR", message: "Token không hợp lệ", data: [] };
    }

    const res = await PackageService.getAllPackage(token);
    return res;
  };

  const { isLoading: isLoadingPackages, data: PackagesData } = useQuery({
    queryKey: ["packages"],
    queryFn: getAllPackage,
  });

  const infoPackage = (Package) => {
    setSelectedPackage(Package);
    setIsInfoModalOpen(true);
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

  const handleSearch = async () => {
    setLoadingSearch(true);
    try {
      const token = await getValidToken();
      if (!token) {
        message.error("Token không hợp lệ");
        return;
      }

      const res = await PackageService.searchPackage(filters, token);
      if (res.status === "ERROR") {
        message.error(res.message || "Tìm kiếm thất bại");
        setSearchResults([]);
      } else {
        setSearchResults(res.data || []);
      }

      setHasSearched(true);
    } catch (error) {
      message.error("Có lỗi xảy ra khi tìm kiếm");
      console.error(error);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleReset = () => {
    setFilters({
      name: "",
      type: null,
      isActive: null,
      minPrice: "",
      maxPrice: "",
      minDuration: "",
      maxDuration: "",
    });
    setSearchResults([]);
    setHasSearched(false); // <-- reset trạng thái search
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

      <Card style={{ marginBottom: 16, background: "transparent", border: 0 }}>
        <Row gutter={16} align="middle">
          <Col span={20}>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Input
                  placeholder="Tên gói tập..."
                  value={filters.name}
                  onChange={(e) =>
                    setFilters({ ...filters, name: e.target.value })
                  }
                />
              </Col>

              {/* Loại gói */}
              <Col span={4}>
                <Select
                  placeholder="Loại gói"
                  value={filters.type}
                  onChange={(value) => setFilters({ ...filters, type: value })}
                  allowClear
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
                  value={
                    filters.isActive !== null ? filters.isActive : undefined
                  }
                  onChange={(value) =>
                    setFilters({ ...filters, isActive: value })
                  }
                  allowClear
                  options={[
                    { label: "Đang hoạt động", value: true },
                    { label: "Ngừng hoạt động", value: false },
                  ]}
                />
              </Col>

              <Col span={4}>
                <Input
                  placeholder="Giá min"
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, minPrice: e.target.value })
                  }
                />
              </Col>
              <Col span={4}>
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

            <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
              {/* Thời lượng min/max */}
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
          </Col>

          {/* Cột nút: chiếm 4/24 */}
          <Col span={4} style={{ textAlign: "right" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button type="primary" block onClick={handleSearch}>
                Tìm kiếm
              </Button>
              <Button danger block onClick={handleReset}>
                Reset
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Table
        rowKey="_id"
        loading={loadingSearch || isLoadingPackages}
        dataSource={hasSearched ? searchResults : PackagesData?.data || []}
        locale={{
          emptyText: hasSearched
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
                  type="default"
                  icon={<EditOutlined />}
                  onClick={() => openEditModal(record)}
                  size="small"
                >
                  Sửa
                </Button>
                <Popconfirm
                  title="Xác nhận Ngừng gói này?"
                  onConfirm={() => handleDelete(record)}
                  okText="Ngừng"
                  cancelText="Hủy"
                >
                  <Button danger icon={<DeleteOutlined />} size="small">
                    Ngừng
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
        pagination={{
          pageSize: 10, // mỗi trang 10 người
        }}
      />

      <Modal
        title="Thêm gói tập mới"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        form={form}
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
              <Form.Item label="Loại gói" name="type">
                <Select
                  options={[
                    { label: "Standard", value: "standard" },
                    { label: "Personal Trainer", value: "personal_trainer" },
                  ]}
                />
              </Form.Item>
            </Col>

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
        title="Thông tin gói tập"
        open={isInfoModalOpen}
        onCancel={() => setIsInfoModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsInfoModalOpen(false)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedPackage && (
          <div>
            <p>
              <strong>Tên gói:</strong> {selectedPackage.name}
            </p>
            <p>
              <strong>Giá:</strong> {selectedPackage.price?.toLocaleString()}₫
            </p>
            <p>
              <strong>Thời lượng:</strong> {selectedPackage.durationInDays} ngày
            </p>
            <p>
              <strong>Loại:</strong> {selectedPackage.type}
            </p>
            <p>
              <strong>Buổi PT:</strong> {selectedPackage.sessionsWithTrainer}
            </p>
            <p>
              <strong>Tối đa:</strong> {selectedPackage.maxMembers}
            </p>
            <p>
              <strong>Đã đăng ký:</strong> {selectedPackage.registeredCount}
            </p>
            <p>
              <strong>Mô tả:</strong> {selectedPackage.description}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              {selectedPackage.isActive ? "Hoạt động" : "Ngừng"}
            </p>
          </div>
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
                />
              </Form.Item>
            </Col>

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
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái" },
                ]}
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
