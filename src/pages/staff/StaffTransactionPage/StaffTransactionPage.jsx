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
  Spin,
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
import * as UserService from "../../../services/Admin/UserService";
import * as TrainerService from "../../../services/Admin/TrainerService";
import * as PackageService from "../../../services/Admin/PackageService";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const { RangePicker } = DatePicker;
const { Option } = Select;

const StaffTransactionPage = () => {
  // Filters / UI state
  const [search, setSearch] = useState("");
  const [filterCustomer, setFilterCustomer] = useState("all");
  const [filterPackage, setFilterPackage] = useState("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState([]);

  // Modals & selected
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Export modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState(null);

  // Create transaction modal + form
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [formCreate] = Form.useForm();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  // OTP flow state
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [transactionTempData, setTransactionTempData] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [creatingDirect, setCreatingDirect] = useState(false);

  // Data lists
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [packages, setPackages] = useState([]);

  const queryClient = useQueryClient();

  // Fetch members/trainers/packages for selects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getValidToken();
        const [membersRes, trainersRes, packagesRes] = await Promise.all([
          UserService.getAllMembers(token),
          TrainerService.getAllTrainers(token),
          PackageService.getAllPackages(token),
        ]);

        setMembers(membersRes.data || []);
        setTrainers(trainersRes.data || []);
        // Ensure packages contain trainer info if populated by backend
        setPackages(packagesRes.data || []);
      } catch (err) {
        console.error("Fetch select lists error:", err);
      }
    };
    fetchData();
  }, []);

  // Transactions query
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

  // Derived transactions array for table
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

  // Filtering
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

  // Table columns
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

  // Detail modal handlers
  const openDetailModal = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailModalVisible(true);
  };
  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedTransaction(null);
  };

  // Status modal handlers
  const openStatusModal = (record) => {
    setSelectedTransaction(record);
    setIsStatusModalOpen(true);
  };
  const closeStatusModal = () => {
    setIsStatusModalOpen(false);
    setSelectedTransaction(null);
  };

  // Export submit (same as your implementation)
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

  // Update transaction status (reuse your code)
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

  // -----------------------
  // OTP + Create Direct Flow
  // -----------------------

  // 1) Send OTP from create modal
  const handleSendOTP = async () => {
    try {
      // validate form first
      const values = await formCreate.validateFields();
      const selectedPkg = packages.find((p) => p._id === values.packageId);

      const trainerIdToSend =
        selectedPkg?.type === "personal_trainer" && selectedPkg?.trainerId
          ? selectedPkg.trainerId
          : values.trainerId || null;

      const body = {
        userId: values.userId,
        packageId: values.packageId,
        trainerId: trainerIdToSend,
      };

      setSendingOtp(true);
      const token = await getValidToken();
      const res = await TransactionService.sendDirectTransactionOTP(
        body,
        token
      );

      if (res.status === "OK") {
        message.success("OTP đã được gửi đến email khách hàng");
        setTransactionTempData(body);
        setOtpModalVisible(true);
      } else {
        message.error(res.message || "Gửi OTP thất bại");
      }
    } catch (err) {
      // validation errors or API errors
      if (err?.errorFields) {
        // form validation: ignore, Antd already highlights
      } else {
        console.error("Send OTP error:", err);
        message.error("Gửi OTP thất bại");
      }
    } finally {
      setSendingOtp(false);
    }
  };

  // 2) Verify OTP and create transaction on success
  const handleVerifyOTP = async () => {
    try {
      if (!transactionTempData) {
        message.error("Không có dữ liệu giao dịch tạm");
        return;
      }
      if (!otpCode || otpCode.trim().length === 0) {
        message.error("Vui lòng nhập mã OTP");
        return;
      }

      setVerifyingOtp(true);
      const verifyRes = await TransactionService.verifyDirectTransactionOTP({
        memberId: transactionTempData.userId,
        otp: otpCode.trim(),
      });

      if (verifyRes.status !== "OK") {
        message.error(verifyRes.message || "OTP không hợp lệ");
        return;
      }

      // OTP đúng → tạo giao dịch trực tiếp
      setCreatingDirect(true);
      const token = await getValidToken();
      const createRes = await TransactionService.createTransactionDirect(
        transactionTempData,
        token
      );

      if (createRes.status === "OK") {
        message.success(createRes.message || "Tạo giao dịch thành công");
        setOtpModalVisible(false);
        setCreateModalVisible(false);
        formCreate.resetFields();
        setOtpCode("");
        setTransactionTempData(null);
        // reload transactions
        queryClient.invalidateQueries(["transactions"]);
        refetch();
      } else {
        // If create fails after OTP (rare), show message
        message.error(createRes.message || "Tạo giao dịch thất bại");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      message.error("Xác minh OTP thất bại");
    } finally {
      setVerifyingOtp(false);
      setCreatingDirect(false);
    }
  };

  // Optional: allow admin to directly create transaction without OTP (keep existing)
  const handleDirectCreateNoOtp = async (values) => {
    try {
      setCreatingDirect(true);
      const selectedPkg = packages.find((p) => p._id === values.packageId);

      const trainerIdToSend =
        selectedPkg?.type === "personal_trainer" && selectedPkg?.trainerId
          ? selectedPkg.trainerId
          : values.trainerId || null;

      const token = await getValidToken();
      const res = await TransactionService.createTransactionDirect(
        {
          userId: values.userId,
          packageId: values.packageId,
          trainerId: trainerIdToSend,
        },
        token
      );

      if (res.status === "OK") {
        message.success(res.message || "Tạo giao dịch trực tiếp thành công");
        setCreateModalVisible(false);
        formCreate.resetFields();
        queryClient.invalidateQueries(["transactions"]);
        refetch();
      } else {
        message.error(res.message || "Tạo giao dịch thất bại");
      }
    } catch (err) {
      console.error("Direct create error:", err);
      message.error("Tạo giao dịch thất bại");
    } finally {
      setCreatingDirect(false);
    }
  };

  // -----------------------
  // JSX
  // -----------------------
  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2 style={{ margin: 0, color: "#fff" }}>Quản lý giao dịch</h2>
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
                .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i)
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
                .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i)
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

      {/* Table */}
      <Card bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey={(r) => r.id}
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết giao dịch"
        open={detailModalVisible}
        onCancel={closeDetailModal}
        footer={[<Button onClick={closeDetailModal}>Đóng</Button>]}
        width={600}
      >
        {selectedTransaction && (
          <div style={{ lineHeight: "26px" }}>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 6 }}>Mã giao dịch</h3>
              <Card size="small">
                <b>{selectedTransaction.transactionCode || "N/A"}</b>
              </Card>
            </div>

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

      {/* Export Modal */}
      <Modal
        title="Xuất báo cáo giao dịch"
        open={isExportModalOpen}
        onCancel={() => setIsExportModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleExportSubmit}>
          <Form.Item
            label="Khoảng thời gian"
            name="dateRange"
            rules={[{ required: true }]}
          >
            <RangePicker format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item label="Phương thức thanh toán" name="paymentMethod">
            <Select allowClear>
              <Select.Option value="all">Tất cả</Select.Option>
              <Select.Option value="direct">Tiền mặt</Select.Option>
              <Select.Option value="bank_transfer">Chuyển khoản</Select.Option>
              <Select.Option value="momo">MoMo</Select.Option>
              <Select.Option value="paypal">paypal</Select.Option>
              <Select.Option value="other">khác</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Trạng thái giao dịch" name="status">
            <Select allowClear>
              <Select.Option value="all">Tất cả</Select.Option>
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

      {/* Create Transaction Modal */}
      <Modal
        title="Tạo giao dịch trực tiếp"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          formCreate.resetFields();
          setSelectedPackage(null);
          setSelectedTrainer(null);
        }}
        footer={null}
      >
        <Form
          layout="vertical"
          form={formCreate}
          onFinish={async (values) => {
            // kept as fallback: direct create without OTP (optional)
            await handleDirectCreateNoOtp(values);
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
                <Option key={m._id} value={m._1d ?? m._id}>
                  {m.fullName} - {m.email}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Gói tập */}
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
                  // set trainer info if package has fixed trainer
                  const trainerInfo = trainers.find(
                    (t) => t._id === pkg.trainerId
                  );
                  setSelectedTrainer(trainerInfo || null);
                  formCreate.setFieldsValue({ trainerId: pkg.trainerId });
                } else {
                  setSelectedTrainer(null);
                  formCreate.setFieldsValue({ trainerId: undefined });
                }
              }}
            >
              {packages.map((p) => (
                <Option key={p._id} value={p._id}>
                  {p.name} - {p.price?.toLocaleString?.() ?? p.price} ₫
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedPackage && (
            <Card
              size="small"
              style={{
                background: "#fafafa",
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <h3>{selectedPackage.name}</h3>
              <p>
                <b>Mô tả:</b> {selectedPackage.description || "Không có mô tả"}
              </p>
              <p>
                <b>Giá:</b> {selectedPackage.price.toLocaleString()} ₫
              </p>
              <p>
                <b>Loại gói:</b> {selectedPackage.type}
              </p>
              <p>
                <b>Thời hạn:</b> {selectedPackage.durationInDays} ngày
              </p>

              {selectedPackage.type === "personal_trainer" && (
                <>
                  <p>
                    <b>Số buổi PT:</b> {selectedPackage.sessionsWithTrainer}
                  </p>

                  {selectedPackage?.trainerId && (
                    <p style={{ marginTop: 8, color: "#1890ff" }}>
                      <b>Huấn luyện viên:</b>{" "}
                      {selectedPackage.trainerId.fullName}
                    </p>
                  )}
                </>
              )}
            </Card>
          )}

          {/* Buttons: send OTP OR create directly */}
          <Form.Item>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                type="primary"
                block
                onClick={handleSendOTP}
                loading={sendingOtp}
              >
                Gửi mã OTP đến email khách hàng
              </Button>

              <Button
                type="default"
                block
                onClick={async () => {
                  try {
                    const values = await formCreate.validateFields();
                    await handleDirectCreateNoOtp(values);
                  } catch (err) {
                    // validation handled by form
                  }
                }}
                loading={creatingDirect}
              >
                Tạo giao dịch trực tiếp (không cần OTP)
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* OTP Modal */}
      <Modal
        title="Xác nhận mã OTP"
        open={otpModalVisible}
        onCancel={() => {
          setOtpModalVisible(false);
          setOtpCode("");
          // keep transactionTempData in case want to retry
        }}
        okText="Xác nhận và tạo giao dịch"
        confirmLoading={verifyingOtp || creatingDirect}
        onOk={handleVerifyOTP}
      >
        <p>
          Đã gửi mã OTP tới email của khách hàng. Vui lòng nhập mã OTP (5 phút
          hiệu lực).
        </p>
        <Input
          placeholder="Nhập mã OTP"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
          maxLength={8}
        />
        <div style={{ marginTop: 8 }}>
          <Button
            type="link"
            onClick={async () => {
              // resend OTP
              if (!transactionTempData) {
                message.error("Không có dữ liệu giao dịch để gửi lại OTP");
                return;
              }
              try {
                setSendingOtp(true);
                const token = await getValidToken();
                const res = await TransactionService.sendDirectTransactionOTP(
                  transactionTempData,
                  token
                );
                if (res.status === "OK") {
                  message.success("Đã gửi lại mã OTP");
                } else {
                  message.error(res.message || "Gửi lại OTP thất bại");
                }
              } catch (err) {
                console.error("Resend OTP error:", err);
                message.error("Gửi lại OTP thất bại");
              } finally {
                setSendingOtp(false);
              }
            }}
            disabled={sendingOtp}
          >
            Gửi lại mã OTP
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default StaffTransactionPage;
