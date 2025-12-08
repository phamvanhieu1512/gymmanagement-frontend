import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Tag,
  Button,
  Space,
  message,
  DatePicker,
  Input,
  Row,
  Col,
  Select,
  Modal,
  Form,
} from "antd";
import {
  EditOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getValidToken } from "../../../services/getValidToken";
import * as TransactionService from "../../../services/Admin/TransactionService";
import * as UserService from "../../../services/Admin/UserService"; // có getAllMembers
import * as TrainerService from "../../../services/Admin/TrainerService"; // có getAllTrainers
import * as PackageService from "../../../services/Admin/PackageService"; // có getAllPackages

import { useMutationHook } from "../../../hooks/useMutationHook";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const { RangePicker } = DatePicker;
const { Option } = Select;

const TransactionsPage = () => {
  const [search, setSearch] = useState("");
  const [filterCustomer, setFilterCustomer] = useState("all");
  const [filterPackage, setFilterPackage] = useState("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const queryClient = useQueryClient();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [formCreate] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      const token = await getValidToken();
      const membersRes = await UserService.getAllMembers(token);
      const trainersRes = await TrainerService.getAllTrainers(token);
      const packagesRes = await PackageService.getAllPackages(token);

      setMembers(membersRes.data || []);
      setTrainers(trainersRes.data || []);
      setPackages(packagesRes.data || []);
    };
    fetchData();
  }, []);

  const openDetailModal = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailModalVisible(true);
  };

  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedTransaction(null);
  };

  const openStatusModal = (record) => {
    setSelectedTransaction(record);
    setIsStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setIsStatusModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleExportSubmit = async (values) => {
    try {
      const token = await getValidToken();

      const filters = {
        from: values.dateRange[0].startOf("day").toISOString(),
        to: values.dateRange[1].endOf("day").toISOString(),
        paymentMethod: values.paymentMethod || null,
        status: values.status || null,
      };

      let res;

      if (exportType === "excel") {
        res = await TransactionService.exportExcel(filters, token);
      } else {
        res = await TransactionService.exportPDF(filters, token);
      }

      const blob = new Blob([res.data], {
        type: res.headers["content-type"],
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = exportType === "excel" ? "report.xlsx" : "report.pdf";
      link.click();
      window.URL.revokeObjectURL(url);

      message.success("Xuất file thành công!");
      setIsExportModalOpen(false);
    } catch (err) {
      console.log(err);
      message.error("Xuất file thất bại!");
    }
  };

  const getAllTransactions = async () => {
    const token = await getValidToken();
    if (!token)
      return { status: "ERROR", message: "Token không hợp lệ", data: [] };

    return TransactionService.getAllTransactions(token);
  };

  const {
    isLoading,
    data: transactionsData,
    refetch,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: getAllTransactions,
  });

  const handleUpdateStatus = async (values) => {
    try {
      const token = await getValidToken();

      const res = await TransactionService.updateTransaction(
        selectedTransaction.id,
        values,
        token
      );

      if (res.status === "OK") {
        message.success("Cập nhật giao dịch thành công");
        closeStatusModal();
        queryClient.invalidateQueries(["transactions"]);
      } else {
        message.error(res.message);
      }
    } catch (err) {
      message.error("Lỗi khi cập nhật giao dịch");
      console.error(err);
    }
  };

  const transactions = (transactionsData?.data || []).map((tx) => ({
    id: tx._id,
    transactionCode: tx.transactionCode || "N/A",

    customerName: tx.userId?.fullName || "Không rõ",
    customerId: tx.userId?._id,
    customerEmail: tx.userId?.email || "Không rõ",
    customerPhone: tx.userId?.phone || "Không rõ",

    packageName: tx.packageId?.name || "Không rõ",
    packageId: tx.packageId?._id,
    packageDescription: tx.packageId?.description || "",
    packagePrice: tx.packageId?.price || 0,

    membershipId: tx.membershipId?._id || null,
    membershipStatus: tx.membershipId?.status || "",
    membershipStart: tx.membershipId?.startDate || "",
    membershipEnd: tx.membershipId?.endDate || "",

    amount: tx.amount,
    paymentMethod: tx.paymentMethod,
    status: tx.status,
    date: tx.transactionDate,

    createdAt: tx.createdAt,
    updatedAt: tx.updatedAt,
  }));

  const filteredData = transactions.filter((tx) => {
    const matchSearch =
      tx.customerName.toLowerCase().includes(search.toLowerCase()) ||
      tx.packageName.toLowerCase().includes(search.toLowerCase());

    const matchCustomer =
      filterCustomer === "all" ? true : tx.customerId === filterCustomer;

    const matchPackage =
      filterPackage === "all" ? true : tx.packageId === filterPackage;

    const matchPayment =
      filterPaymentMethod === "all"
        ? true
        : tx.paymentMethod === filterPaymentMethod;

    const matchStatus =
      filterStatus === "all" ? true : tx.status === filterStatus;

    const matchDate =
      dateRange.length === 2
        ? dayjs(tx.date).isSameOrAfter(dateRange[0], "day") &&
          dayjs(tx.date).isSameOrBefore(dateRange[1], "day")
        : true;

    return (
      matchSearch &&
      matchCustomer &&
      matchPackage &&
      matchPayment &&
      matchStatus &&
      matchDate
    );
  });

  const columns = [
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      render: (name) => <b>{name}</b>,
    },
    {
      title: "Gói tập",
      dataIndex: "packageName",
      key: "packageName",
    },
    {
      title: "Số tiền (₫)",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => amount?.toLocaleString(),
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method) => {
        switch (method) {
          case "direct":
            return <Tag color="green">Tiền mặt trực tiếp</Tag>;
          case "bank_transfer":
            return <Tag color="blue">Chuyển khoản</Tag>;
          case "momo":
            return <Tag color="purple">MoMo</Tag>;
          case "paypal":
            return <Tag color="cyan">PayPal</Tag>;
          case "other":
            return <Tag color="default">Khác</Tag>;
          default:
            return <Tag>Không rõ</Tag>;
        }
      },
    },
    {
      title: "Ngày giao dịch",
      dataIndex: "date",
      key: "date",
      render: (d) => dayjs(d).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        switch (status) {
          case "completed":
            return <Tag color="green">Hoàn tất</Tag>;
          case "pending":
            return <Tag color="orange">Đang xử lý</Tag>;
          case "failed":
            return <Tag color="red">Thất bại</Tag>;
          default:
            return <Tag>Không rõ</Tag>;
        }
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openDetailModal(record)}>
            <InfoCircleOutlined style={{ fontSize: "20px" }} />
          </Button>

          <Button type="link" onClick={() => openStatusModal(record)}>
            <EditOutlined style={{ fontSize: "20px" }} />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2 style={{ margin: 0 }}>Quản lý giao dịch</h2>
        </Col>

        <Space>
          <Button type="primary" onClick={() => setCreateModalVisible(true)}>
            Tạo giao dịch trực tiếp
          </Button>
          <Button
            type="primary"
            onClick={() => {
              setExportType("excel");
              setIsExportModalOpen(true);
            }}
          >
            Xuất Excel
          </Button>

          <Button
            type="default"
            onClick={() => {
              setExportType("pdf");
              setIsExportModalOpen(true);
            }}
          >
            Xuất PDF
          </Button>
        </Space>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm theo khách hàng hoặc gói tập..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>

          {/* Filter Customer */}
          <Col xs={24} md={8}>
            <Select
              value={filterCustomer}
              onChange={setFilterCustomer}
              style={{ width: "100%" }}
              placeholder="Lọc theo khách hàng"
              allowClear
            >
              <Option value="all">Tất cả khách hàng</Option>
              {transactions
                .map((t) => ({ name: t.customerName, id: t.customerId }))
                .filter(
                  (v, i, a) => a.findIndex((x) => x.id === v.id) === i // unique
                )
                .map((user) => (
                  <Option key={user.id} value={user.id}>
                    {user.name}
                  </Option>
                ))}
            </Select>
          </Col>

          {/* Filter Package */}
          <Col xs={24} md={8}>
            <Select
              value={filterPackage}
              onChange={setFilterPackage}
              style={{ width: "100%" }}
              placeholder="Lọc theo gói tập"
            >
              <Option value="all">Tất cả gói tập</Option>
              {transactions
                .map((t) => ({ name: t.packageName, id: t.packageId }))
                .filter(
                  (v, i, a) => a.findIndex((x) => x.id === v.id) === i // unique
                )
                .map((pkg) => (
                  <Option key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </Option>
                ))}
            </Select>
          </Col>

          {/* Filter Payment Method */}
          <Col xs={24} md={8}>
            <Select
              value={filterPaymentMethod}
              onChange={setFilterPaymentMethod}
              style={{ width: "100%" }}
            >
              <Option value="all">Tất cả phương thức</Option>
              <Option value="direct">Tiền mặt</Option>
              <Option value="bank_transfer">Chuyển khoản</Option>
              <Option value="momo">Momo</Option>
              <Option value="paypal">Paypal</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Col>

          {/* Filter Status */}
          <Col xs={24} md={8}>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: "100%" }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="pending">Đang xử lý</Option>
              <Option value="completed">Hoàn tất</Option>
              <Option value="failed">Thất bại</Option>
            </Select>
          </Col>

          {/* Date Range */}
          <Col xs={24} md={8}>
            <RangePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              value={dateRange}
              onChange={(dates) => setDateRange(dates || [])}
            />
          </Col>
        </Row>
      </Card>

      {/* Bảng giao dịch */}
      <Card bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey={(r) => r.id}
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Chi tiết giao dịch"
        open={detailModalVisible}
        onCancel={closeDetailModal}
        footer={[<Button onClick={closeDetailModal}>Đóng</Button>]}
        width={600}
      >
        {selectedTransaction && (
          <div style={{ lineHeight: "26px" }}>
            {/* MÃ GIAO DỊCH */}
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 6 }}>Mã giao dịch</h3>
              <Card size="small">
                <b>{selectedTransaction.transactionCode || "N/A"}</b>
              </Card>
            </div>

            {/* THÔNG TIN KHÁCH HÀNG */}
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 6 }}>Thông tin khách hàng</h3>
              <Card size="small">
                <p>
                  <b>Họ tên:</b> {selectedTransaction.customerName}
                </p>
                <p>
                  <b>Email:</b> {selectedTransaction.customerEmail}
                </p>
                <p>
                  <b>Số điện thoại:</b> {selectedTransaction.customerPhone}
                </p>
              </Card>
            </div>

            {/* THÔNG TIN GÓI TẬP */}
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 6 }}>Thông tin gói tập</h3>
              <Card size="small">
                <p>
                  <b>Tên gói:</b> {selectedTransaction.packageName}
                </p>
                <p>
                  <b>Giá gốc:</b>{" "}
                  {selectedTransaction.packagePrice?.toLocaleString()} ₫
                </p>
                <p>
                  <b>Mô tả:</b>{" "}
                  {selectedTransaction.packageDescription || "Không có mô tả"}
                </p>
              </Card>
            </div>

            {/* Membership */}
            {selectedTransaction.membershipId && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ marginBottom: 6 }}>Membership</h3>
                <Card size="small">
                  <p>
                    <b>ID:</b> {selectedTransaction.membershipId}
                  </p>
                  <p>
                    <b>Trạng thái:</b> {selectedTransaction.membershipStatus}
                  </p>
                  <p>
                    <b>Ngày bắt đầu:</b>{" "}
                    {dayjs(selectedTransaction.membershipStart).format(
                      "DD/MM/YYYY"
                    )}
                  </p>
                  <p>
                    <b>Ngày kết thúc:</b>{" "}
                    {dayjs(selectedTransaction.membershipEnd).format(
                      "DD/MM/YYYY"
                    )}
                  </p>
                </Card>
              </div>
            )}

            {/* THÔNG TIN THANH TOÁN */}
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 6 }}>Thông tin thanh toán</h3>
              <Card size="small">
                <p>
                  <b>Số tiền thanh toán:</b>{" "}
                  {selectedTransaction.amount.toLocaleString()} ₫
                </p>
                <p>
                  <b>Phương thức:</b> {selectedTransaction.paymentMethod}
                </p>
                <p>
                  <b>Trạng thái:</b> {selectedTransaction.status}
                </p>
                <p>
                  <b>Ngày giao dịch:</b>{" "}
                  {dayjs(selectedTransaction.date).format("DD/MM/YYYY HH:mm")}
                </p>
              </Card>
            </div>

            {/* THỜI GIAN HỆ THỐNG */}
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 6 }}>Thời gian hệ thống</h3>
              <Card size="small">
                <p>
                  <b>Ngày tạo:</b>{" "}
                  {dayjs(selectedTransaction.createdAt).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </p>
                <p>
                  <b>Cập nhật cuối:</b>{" "}
                  {dayjs(selectedTransaction.updatedAt).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </p>
              </Card>
            </div>
          </div>
        )}
      </Modal>

      {/* <Modal
        title="Cập nhật trạng thái giao dịch"
        open={isStatusModalOpen}
        onCancel={closeStatusModal}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handleUpdateStatus}
          initialValues={{
            status: selectedTransaction?.status,
            paymentMethod: selectedTransaction?.paymentMethod,
          }}
        >
          <Form.Item label="Trạng thái" name="status">
            <Select>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
              <Select.Option value="failed">Failed</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Phương thức thanh toán" name="paymentMethod">
            <Select>
              <Select.Option value="cash">Tiền mặt</Select.Option>
              <Select.Option value="banking">Chuyển khoản</Select.Option>
              <Select.Option value="momo">Momo</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal> */}

      <Modal
        title="Xuất báo cáo giao dịch"
        open={isExportModalOpen}
        onCancel={() => setIsExportModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleExportSubmit}>
          {/* Date Range */}
          <Form.Item
            label="Khoảng thời gian"
            name="dateRange"
            rules={[{ required: true }]}
          >
            <RangePicker format="DD/MM/YYYY" />
          </Form.Item>

          {/* Payment Method */}
          <Form.Item label="Phương thức thanh toán" name="paymentMethod">
            <Select allowClear>
              <Select.Option value="direct">Tiền mặt</Select.Option>
              <Select.Option value="bank_transfer">Chuyển khoản</Select.Option>
              <Select.Option value="momo">MoMo</Select.Option>
              <Select.Option value="paypal">paypal</Select.Option>
              <Select.Option value="other">khác</Select.Option>
            </Select>
          </Form.Item>

          {/* Status */}
          <Form.Item label="Trạng thái giao dịch" name="status">
            <Select allowClear>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="completed">Completed</Select.Option>
              <Select.Option value="failed">Failed</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Xuất {exportType === "excel" ? "Excel" : "PDF"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Tạo giao dịch trực tiếp"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          form={formCreate}
          onFinish={async (values) => {
            try {
              const token = await getValidToken();

              // Lấy package đang chọn
              const selectedPkg = packages.find(
                (p) => p._id === values.packageId
              );

              // Nếu package có trainer cố định, gán tự động
              const trainerIdToSend =
                selectedPkg?.type === "personal_trainer" &&
                selectedPkg?.trainerId
                  ? selectedPkg.trainerId
                  : values.trainerId || null;

              const res = await TransactionService.createTransactionDirect(
                {
                  userId: values.userId,
                  packageId: values.packageId,
                  trainerId: trainerIdToSend,
                },
                token
              );

              if (res.status === "OK") {
                message.success(res.message);
                queryClient.invalidateQueries(["transactions"]); // reload bảng
                setCreateModalVisible(false);
                formCreate.resetFields();
              } else {
                message.error(res.message);
              }
            } catch (err) {
              console.error(err);
              message.error("Tạo giao dịch thất bại");
            }
          }}
        >
          {/* Chọn khách hàng */}
          <Form.Item
            label="Khách hàng"
            name="userId"
            rules={[{ required: true, message: "Chọn khách hàng" }]}
          >
            <Select placeholder="Chọn khách hàng">
              {members.map((m) => (
                <Option key={m._id} value={m._id}>
                  {m.fullName} - {m.email}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {/* Chọn package */}
          <Form.Item
            label="Gói tập"
            name="packageId"
            rules={[{ required: true, message: "Chọn gói tập" }]}
          >
            <Select
              placeholder="Chọn gói tập"
              onChange={(pkgId) => {
                const pkg = packages.find((p) => p._id === pkgId);
                setSelectedPackage(pkg);

                if (pkg?.type === "personal_trainer" && pkg?.trainerId) {
                  const trainerInfo = trainers.find(
                    (t) => t._id === pkg.trainerId
                  );
                  setSelectedTrainer(trainerInfo || null);
                } else {
                  setSelectedTrainer(null);
                }

                formCreate.setFieldsValue({ trainerId: undefined });
              }}
            >
              {packages.map((p) => (
                <Option key={p._id} value={p._id}>
                  {p.name} - {p.price.toLocaleString()} ₫
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Hiển thị thông tin package khi chọn */}
          {selectedPackage && (
            <Card size="small" style={{ marginBottom: 16 }}>
              <p>
                <b>Tên gói:</b> {selectedPackage.name}
              </p>
              <p>
                <b>Giá:</b> {selectedPackage.price.toLocaleString()} ₫
              </p>
              <p>
                <b>Mô tả:</b> {selectedPackage.description || "Không có mô tả"}
              </p>
              {selectedPackage.type === "personal_trainer" &&
                selectedPackage.trainerId && (
                  <p>
                    <b>Trainer:</b> {selectedPackage.trainerId.fullName} - ID:{" "}
                    {selectedPackage.trainerId._id}
                  </p>
                )}
            </Card>
          )}
          {/* Submit */}
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Tạo giao dịch trực tiếp
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TransactionsPage;
