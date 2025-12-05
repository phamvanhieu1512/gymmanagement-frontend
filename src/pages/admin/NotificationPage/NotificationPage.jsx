import React, { useEffect, useState } from "react";
import { Card, Form, Input, Select, Button, message, Table, Tag } from "antd";
import { getValidToken } from "../../../services/getValidToken";
import * as NotificationService from "../../../services/Admin/NotificationService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutationHook } from "../../../hooks/useMutationHook";

const { Option } = Select;

const NotificationPage = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // 🟦 Query: Lấy danh sách thông báo
  const { data: notiList, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const token = await getValidToken();
      const res = await NotificationService.getAllNotifications(token);
      return res?.data || [];
    },
  });

  const mutationSendNotification = useMutationHook(async (data) => {
    const token = await getValidToken();
    return NotificationService.sendNotification(data, token);
  });

  const handleSend = (values) => {
    mutationSendNotification.mutate(values, {
      onSuccess: (res) => {
        if (res?.status === "OK") {
          message.success("Gửi thông báo thành công!");
          form.resetFields();

          // Load lại danh sách
          queryClient.invalidateQueries(["notifications"]);
          refetch();
        } else {
          message.error(res?.message || "Lỗi gửi thông báo");
        }
      },
      onError: () => {
        message.error("Không thể gửi thông báo");
      },
    });
  };

  const columns = [
    {
      title: "Người nhận",
      dataIndex: "userId",
      render: (u) => <span>{u?.fullName || "Tất cả"}</span>,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      render: (t) => <b>{t}</b>,
    },
    {
      title: "Loại",
      dataIndex: "type",
      render: (t) => <Tag color="blue">{t}</Tag>,
    },
    {
      title: "Mục tiêu",
      dataIndex: "target",
      render: (t) => (
        <Tag
          color={t === "single" ? "purple" : t === "group" ? "orange" : "green"}
        >
          {t}
        </Tag>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      render: (time) => new Date(time).toLocaleString(),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Card title="Gửi thông báo" bordered={false} style={{ marginBottom: 30 }}>
        <Form form={form} layout="vertical" onFinish={handleSend}>
          {/* Target */}
          <Form.Item name="target" label="Gửi đến" rules={[{ required: true }]}>
            <Select placeholder="Chọn mục tiêu gửi">
              <Option value="single">Một người</Option>
              <Option value="group">Nhóm (role)</Option>
              <Option value="all">Tất cả</Option>
            </Select>
          </Form.Item>

          {/* Single user */}
          {form.getFieldValue("target") === "single" && (
            <Form.Item
              name="userId"
              label="User ID"
              rules={[{ required: true }]}
            >
              <Input placeholder="Nhập userId" />
            </Form.Item>
          )}

          {/* Group role */}
          {form.getFieldValue("target") === "group" && (
            <Form.Item
              name="userRole"
              label="Role"
              rules={[{ required: true }]}
            >
              <Select placeholder="Chọn role">
                <Option value="member">member</Option>
                <Option value="trainer">trainer</Option>
              </Select>
            </Form.Item>
          )}

          {/* Type */}
          <Form.Item
            name="type"
            label="Loại thông báo"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn loại">
              <Option value="purchase">Mua hàng</Option>
              <Option value="reminder">Nhắc nhở</Option>
              <Option value="deal">Khuyến mãi</Option>
              <Option value="trainer_message">Tin nhắn trainer</Option>
            </Select>
          </Form.Item>

          {/* Title */}
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
            <Input placeholder="Nhập tiêu đề" />
          </Form.Item>

          {/* Message */}
          <Form.Item
            name="message"
            label="Nội dung"
            rules={[{ required: true }]}
          >
            <Input.TextArea placeholder="Nhập nội dung" rows={4} />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={mutationSendNotification.isPending}
          >
            Gửi thông báo
          </Button>
        </Form>
      </Card>

      {/* Notification List */}
      <Card title="Lịch sử thông báo đã gửi">
        <Table columns={columns} dataSource={notiList} rowKey="_id" />
      </Card>
    </div>
  );
};

export default NotificationPage;
