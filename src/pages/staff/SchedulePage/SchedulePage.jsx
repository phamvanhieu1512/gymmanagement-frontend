import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  Space,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;

const SchedulePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // 🔹 Dữ liệu mẫu — sau này bạn sẽ thay bằng data từ database
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      memberName: "Nguyễn Văn A",
      trainer: "HLV Trọng",
      date: "2025-10-09",
      time: "08:00 - 09:00",
    },
    {
      id: 2,
      memberName: "Trần Thị B",
      trainer: "HLV Mai",
      date: "2025-10-10",
      time: "17:00 - 18:00",
    },
  ]);

  const columns = [
    { title: "Hội viên", dataIndex: "memberName", key: "memberName" },
    { title: "Huấn luyện viên", dataIndex: "trainer", key: "trainer" },
    { title: "Ngày", dataIndex: "date", key: "date" },
    { title: "Giờ", dataIndex: "time", key: "time" },
  ];

  const handleAddSchedule = (values) => {
    const newSchedule = {
      id: schedules.length + 1,
      memberName: values.memberName,
      trainer: values.trainer,
      date: values.date.format("YYYY-MM-DD"),
      time: `${values.startTime.format("HH:mm")} - ${values.endTime.format(
        "HH:mm"
      )}`,
    };
    setSchedules([...schedules, newSchedule]);
    form.resetFields();
    setIsModalOpen(false);
  };

  return (
    <div style={{ padding: 24, color: "white" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2 style={{ color: "#FFD700" }}>📅 Quản lý lịch tập</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Thêm lịch mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={schedules}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        bordered
        style={{ background: "#1F1F1F" }}
      />

      <Modal
        title="Thêm lịch tập mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleAddSchedule} form={form}>
          <Form.Item
            label="Tên hội viên"
            name="memberName"
            rules={[{ required: true, message: "Vui lòng nhập tên hội viên!" }]}
          >
            <Input placeholder="Nhập tên hội viên" />
          </Form.Item>

          <Form.Item
            label="Huấn luyện viên"
            name="trainer"
            rules={[{ required: true, message: "Vui lòng chọn HLV!" }]}
          >
            <Select placeholder="Chọn huấn luyện viên">
              <Option value="HLV Trọng">HLV Trọng</Option>
              <Option value="HLV Mai">HLV Mai</Option>
              <Option value="HLV Dũng">HLV Dũng</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Ngày tập"
            name="date"
            rules={[{ required: true, message: "Vui lòng chọn ngày tập!" }]}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>

          <Space style={{ display: "flex", justifyContent: "space-between" }}>
            <Form.Item
              label="Giờ bắt đầu"
              name="startTime"
              rules={[{ required: true, message: "Chọn giờ bắt đầu!" }]}
            >
              <TimePicker format="HH:mm" />
            </Form.Item>

            <Form.Item
              label="Giờ kết thúc"
              name="endTime"
              rules={[{ required: true, message: "Chọn giờ kết thúc!" }]}
            >
              <TimePicker format="HH:mm" />
            </Form.Item>
          </Space>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Lưu lịch tập
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SchedulePage;
