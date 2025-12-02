import React, { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Descriptions,
  Avatar,
  List,
  Empty,
  message,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import * as MembershipService from "../../../services/Admin/MembershipService";
import { getValidToken } from "../../../services/getValidToken";
import dayjs from "dayjs";

const MembershipPage = () => {
  const [visibleDetail, setVisibleDetail] = useState(false);
  const [selected, setSelected] = useState(null);

  const baseURL = "http://localhost:5000";

  // fetch memberships (giữ nguyên hàm của bạn)
  const getAllMembership = async () => {
    const token = await getValidToken();
    if (!token) return { status: "ERROR", data: [] };
    const res = await MembershipService.getAllMembership(token);
    return res;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["get-all-memberships"],
    queryFn: getAllMembership,
  });

  // map membership để hiển thị table (lưu cả object gốc)
  const memberships = (data?.data || []).map((m) => ({
    _id: m._id,
    raw: m, // keep populated document for modal
    userName: m.userId?.fullName || "Không rõ",
    packageName: m.packageId?.name || "Không rõ",
    trainerName: m.trainerId?.fullName || "-",
    startDate: m.startDate ? dayjs(m.startDate).format("DD/MM/YYYY") : "-",
    endDate: m.endDate ? dayjs(m.endDate).format("DD/MM/YYYY") : "-",
    status: m.status,
    remainingSessions: m.remainingSessions ?? 0,
  }));

  const statusColors = {
    active: "green",
    pending: "gold",
    expired: "red",
    cancelled: "volcano",
  };

  // Mở modal chi tiết — không gọi thêm API vì dùng dữ liệu đã populate
  const openDetailModal = (record) => {
    setSelected(record.raw || record); // raw là object populated
    setVisibleDetail(true);
  };

  const closeDetailModal = () => {
    setVisibleDetail(false);
    setSelected(null);
  };

  // Nếu membership đã populate userId/packageId/trainerId, ta có thể truy cập trực tiếp:
  // selected.userId.fullName, selected.packageId.name, selected.trainerId.fullName

  const columns = [
    {
      title: "Hội viên",
      dataIndex: "userName",
      ellipsis: {
        showTitle: true, // hover sẽ hiển thị tooltip
      },
      render: (text) => <div style={{ maxWidth: 150 }}>{text}</div>, // giới hạn width
    },
    {
      title: "Gói tập",
      dataIndex: "packageName",
      ellipsis: { showTitle: true },
      render: (value) => (
        <Tag
          color="blue"
          style={{
            maxWidth: 120,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </Tag>
      ),
    },
    {
      title: "Trainer",
      dataIndex: "trainerName",
      render: (name) =>
        name === "-" ? <Tag>-</Tag> : <Tag color="purple">{name}</Tag>,
    },
    { title: "Ngày bắt đầu", dataIndex: "startDate", align: "center" },
    { title: "Ngày kết thúc", dataIndex: "endDate", align: "center" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: (status) => (
        <Tag color={statusColors[status]}>{status?.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Buổi còn lại",
      dataIndex: "remainingSessions",
      align: "center",
      render: (value) => (
        <Tag color={value > 0 ? "green" : "default"}>{value}</Tag>
      ),
    },
    {
      title: "Hành động",
      align: "center",
      render: (record) => (
        <Space style={{ whiteSpace: "nowrap" }}>
          <Button size="small" onClick={() => openDetailModal(record)}>
            Chi tiết
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={() => alert(`Gia hạn ${record.userName}`)}
          >
            Gia hạn
          </Button>
          <Button
            size="small"
            danger
            onClick={() => alert(`Hủy ${record.userName}`)}
          >
            Hủy
          </Button>
        </Space>
      ),
      width: 250, // đặt chiều rộng tối thiểu
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: "#fff" }}>Quản lý hội viên</h2>

      <Table
        loading={isLoading}
        dataSource={memberships}
        columns={columns}
        rowKey="_id"
        bordered
        style={{ background: "#fff" }}
      />

      {/* Modal chi tiết */}
      <Modal
        open={visibleDetail}
        title="Chi tiết Membership"
        onCancel={closeDetailModal}
        footer={[
          <Button key="close" onClick={closeDetailModal}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selected ? (
          <>
            {/* Phần: Thông tin hội viên */}
            <Descriptions title="Thông tin hội viên" column={1} bordered>
              <Descriptions.Item label="Tên">
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <Avatar
                    src={
                      selected.userId?.avatarUrl
                        ? `${baseURL}${selected.userId.avatarUrl}`
                        : null
                    }
                    alt={selected.userId?.fullName}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {selected.userId?.fullName || "-"}
                    </div>
                    <div style={{ color: "#666" }}>
                      {selected.userId?.email || "-"}
                    </div>
                    <div style={{ color: "#666" }}>
                      {selected.userId?.phone || "-"}
                    </div>
                  </div>
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Ngày sinh">
                {selected.userId?.dateOfBirth
                  ? dayjs(selected.userId.dateOfBirth).format("DD/MM/YYYY")
                  : "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Giới tính">
                {selected.userId?.gender || "-"}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ height: 12 }} />

            {/* Phần: Thông tin gói */}
            <Descriptions title="Thông tin gói tập" column={1} bordered>
              <Descriptions.Item label="Tên gói">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Tag color="blue">{selected.packageId?.name || "-"}</Tag>
                  <div style={{ color: "#666" }}>
                    {selected.packageId?.type || "-"}
                  </div>
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Thời hạn / Giá">
                {selected.packageId?.durationInDays
                  ? `${selected.packageId.durationInDays} ngày`
                  : "-"}{" "}
                /{" "}
                {selected.packageId?.price != null
                  ? `${selected.packageId.price} VNĐ`
                  : "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Mô tả">
                {selected.packageId?.description || "-"}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ height: 12 }} />

            {/* Phần: Thông tin membership */}
            <Descriptions title="Thông tin Membership" column={2} bordered>
              <Descriptions.Item label="Mã Membership">
                {selected._id}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusColors[selected.status]}>
                  {selected.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Ngày bắt đầu">
                {selected.startDate
                  ? dayjs(selected.startDate).format("DD/MM/YYYY")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày kết thúc">
                {selected.endDate
                  ? dayjs(selected.endDate).format("DD/MM/YYYY")
                  : "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Buổi còn lại">
                {selected.remainingSessions ?? 0}
              </Descriptions.Item>
              <Descriptions.Item label="Số lần gia hạn">
                {selected.renewalCount ?? 0}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ height: 12 }} />

            {/* Phần: Trainer (nếu có) */}
            <Descriptions title="Trainer" column={1} bordered>
              <Descriptions.Item label="Trainer">
                {selected.trainerId ? (
                  <div
                    style={{ display: "flex", gap: 12, alignItems: "center" }}
                  >
                    <Avatar
                      src={
                        selected.trainerId?.avatarUrl
                          ? `${baseURL}${selected.trainerId.avatarUrl}`
                          : null
                      }
                      alt={selected.trainerId?.fullName}
                    />

                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {selected.trainerId.fullName}
                      </div>
                      <div style={{ color: "#666" }}>
                        {selected.trainerId.email}
                      </div>
                      <div style={{ color: "#666" }}>
                        {selected.trainerId.phone}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Tag>-</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ height: 12 }} />

            {/* Phần: Lịch sử check-in (nếu có) */}
            <div>
              <h3 style={{ marginBottom: 8 }}>Lịch sử check-in</h3>
              {Array.isArray(selected.checkInDates) &&
              selected.checkInDates.length > 0 ? (
                <List
                  size="small"
                  bordered
                  dataSource={selected.checkInDates}
                  renderItem={(ci) => (
                    <List.Item>
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          {ci.date
                            ? dayjs(ci.date).format("DD/MM/YYYY HH:mm")
                            : "-"}
                        </div>
                        <div style={{ color: "#666" }}>
                          {ci.sessionId ? `Buổi: ${ci.sessionId}` : ""}
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="Chưa có check-in" />
              )}
            </div>
          </>
        ) : (
          <div>Đang tải...</div>
        )}
      </Modal>
    </div>
  );
};

export default MembershipPage;
