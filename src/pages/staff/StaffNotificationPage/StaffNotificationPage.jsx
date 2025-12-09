import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  message,
  Table,
  Modal,
  Tag,
} from "antd";
import { getValidToken } from "../../../services/getValidToken";
import * as NotificationService from "../../../services/Admin/NotificationService";
import * as UserService from "../../../services/Admin/UserService";
import * as TrainerService from "../../../services/Admin/TrainerService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutationHook } from "../../../hooks/useMutationHook";

const { Option } = Select;

const StaffNotificationPage = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // 🔥 3 modal
  const [openMemberModal, setOpenMemberModal] = useState(false);
  const [openTrainerModal, setOpenTrainerModal] = useState(false);
  const [openAllModal, setOpenAllModal] = useState(false);

  // 🔥 Danh sách member, trainer
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);

  // Lấy danh sách thông báo
  const { data: notiList } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const token = await getValidToken();
      const res = await NotificationService.getAllNotifications(token);
      return res?.data || [];
    },
  });

  // Lấy members
  const fetchMembers = async () => {
    const token = await getValidToken();
    const res = await UserService.getAllMembers(token);
    setMembers(res?.data || []);
  };

  // Lấy trainers
  const fetchTrainers = async () => {
    const token = await getValidToken();
    const res = await TrainerService.getAllTrainers(token);
    setTrainers(res?.data || []);
  };

  // Mutation gửi thông báo
  const mutationSend = useMutationHook(async (data) => {
    const token = await getValidToken();
    return NotificationService.sendNotification(data, token);
  });

  // Gửi form
  const handleFinish = (values) => {
    mutationSend.mutate(values, {
      onSuccess: (res) => {
        if (res?.status === "OK") {
          message.success("Gửi thành công!");
          form.resetFields();
          setOpenMemberModal(false);
          setOpenTrainerModal(false);
          setOpenAllModal(false);
          queryClient.invalidateQueries(["notifications"]);
        } else {
          message.error(res?.message);
        }
      },
      onError: () => message.error("Không thể gửi"),
    });
  };

  // Table columns
  const columns = [
    {
      title: "Người nhận",
      dataIndex: "userId",
      render: (u) => <span>{u?.fullName || "Tất cả"}</span>,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
    },
    {
      title: "Loại",
      dataIndex: "type",
      render: (t) => <Tag color="blue">{t}</Tag>,
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      render: (t) => new Date(t).toLocaleString(),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Card title="Gửi thông báo" bordered={false} style={{ marginBottom: 30 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <Button
            type="primary"
            onClick={() => {
              fetchMembers();
              setOpenMemberModal(true);
            }}
          >
            Gửi cho Member
          </Button>

          <Button
            type="primary"
            onClick={() => {
              fetchTrainers();
              setOpenTrainerModal(true);
            }}
          >
            Gửi cho Trainer
          </Button>

          <Button
            type="primary"
            onClick={() => {
              setOpenAllModal(true);
            }}
          >
            Gửi cho Tất cả Users
          </Button>
        </div>
      </Card>

      {/* Modal gửi single cho member */}
      <Modal
        title="Gửi thông báo cho Member"
        open={openMemberModal}
        onCancel={() => setOpenMemberModal(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="userId"
            label="Chọn Member"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn member">
              {members.map((m) => (
                <Option key={m._id} value={m._id}>
                  {m.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
            <Select>
              <Option value="reminder">Nhắc nhở</Option>
              <Option value="deal">Khuyến mãi</Option>
              <Option value="trainer_message">Huấn luyện viên</Option>
            </Select>
          </Form.Item>

          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="message"
            label="Nội dung"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item hidden name="target" initialValue="single" />

          <Button
            type="primary"
            htmlType="submit"
            loading={mutationSend.isPending}
          >
            Gửi
          </Button>
        </Form>
      </Modal>

      {/* Modal gửi single cho trainer */}
      <Modal
        title="Gửi thông báo cho Trainer"
        open={openTrainerModal}
        onCancel={() => setOpenTrainerModal(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="userId"
            label="Chọn Trainer"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn trainer">
              {trainers.map((t) => (
                <Option key={t._id} value={t._id}>
                  {t.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
            <Select>
              <Option value="trainer_message">Tin nhắn từ Trainer</Option>
              <Option value="reminder">Nhắc nhở</Option>
            </Select>
          </Form.Item>

          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="message"
            label="Nội dung"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item hidden name="target" initialValue="single" />

          <Button
            type="primary"
            htmlType="submit"
            loading={mutationSend.isPending}
          >
            Gửi
          </Button>
        </Form>
      </Modal>

      {/* Modal gửi ALL */}
      <Modal
        title="Gửi thông báo cho Tất cả người dùng"
        open={openAllModal}
        onCancel={() => setOpenAllModal(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleFinish}>
          <Form.Item name="type" label="Loại" rules={[{ required: true }]}>
            <Select>
              <Option value="reminder">Nhắc nhở</Option>
              <Option value="deal">Khuyến mãi</Option>
            </Select>
          </Form.Item>

          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="message"
            label="Nội dung"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item hidden name="target" initialValue="all" />

          <Button
            type="primary"
            htmlType="submit"
            loading={mutationSend.isPending}
          >
            Gửi
          </Button>
        </Form>
      </Modal>

      {/* Lịch sử */}
      <Card title="Lịch sử thông báo đã gửi">
        <Table columns={columns} dataSource={notiList} rowKey="_id" />
      </Card>
    </div>
  );
};

export default StaffNotificationPage;
