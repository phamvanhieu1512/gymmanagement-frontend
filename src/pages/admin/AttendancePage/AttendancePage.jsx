import React, { useState } from "react";
import { Table, Modal, Checkbox, Button } from "antd";
import { QRCodeCanvas } from "qrcode.react";

// Mock data gói tập / session
const mockPackages = [
  { id: "p1", name: "Yoga 10 buổi", type: "Group", duration: "1 tháng" },
  { id: "p2", name: "PT 1-1", type: "Personal Trainer", duration: "2 tuần" },
];

// Mock member data
const mockMembers = {
  p1: [
    { id: "m1", name: "Nguyễn A", remainingSessions: 5 },
    { id: "m2", name: "Trần B", remainingSessions: 3 },
  ],
  p2: [
    { id: "m3", name: "Lê C", remainingSessions: 1 },
    { id: "m4", name: "Phạm D", remainingSessions: 0 },
  ],
};

const AttendancePage = () => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isMemberModalVisible, setIsMemberModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Khi click vào row của gói
  const handlePackageRowClick = (record) => {
    setSelectedPackage(record);
    setIsMemberModalVisible(true);
  };

  // Khi tick member → hiển thị QR modal
  const handleTickMember = (member) => {
    setSelectedMember(member);
  };

  // Columns của table gói
  const packageColumns = [
    { title: "Tên gói tập", dataIndex: "name", key: "name" },
    { title: "Loại", dataIndex: "type", key: "type" },
    { title: "Thời lượng", dataIndex: "duration", key: "duration" },
  ];

  // Columns của table member
  const memberColumns = [
    {
      title: "Tick",
      key: "tick",
      render: (_, member) => (
        <Checkbox
          disabled={member.remainingSessions === 0}
          onChange={() => handleTickMember(member)}
        />
      ),
    },
    { title: "Tên Member", dataIndex: "name", key: "name" },
    { title: "Buổi còn lại", dataIndex: "remainingSessions", key: "remaining" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Danh sách gói tập / lớp</h1>
      <Table
        columns={packageColumns}
        dataSource={mockPackages}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => handlePackageRowClick(record),
          style: { cursor: "pointer" },
        })}
      />

      {/* Modal danh sách member */}
      <Modal
        title={selectedPackage ? `Member của gói: ${selectedPackage.name}` : ""}
        visible={isMemberModalVisible}
        onCancel={() => setIsMemberModalVisible(false)}
        footer={null}
      >
        <Table
          columns={memberColumns}
          dataSource={selectedPackage ? mockMembers[selectedPackage.id] : []}
          rowKey="id"
          pagination={false}
        />
      </Modal>

      {/* Modal QR member */}
      <Modal
        title={selectedMember ? `QR của ${selectedMember.name}` : ""}
        visible={!!selectedMember}
        onCancel={() => setSelectedMember(null)}
        footer={<Button onClick={() => setSelectedMember(null)}>Đóng</Button>}
      >
        {selectedMember && (
          <div className="flex justify-center">
            <QRCodeCanvas
              value={`QR-${selectedPackage.id}-${selectedMember.id}`}
              size={200}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AttendancePage;
