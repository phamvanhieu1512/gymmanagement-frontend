import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { Dumbbell } from "lucide-react"; // icon thể hình, hiện đại

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate("/"); // quay về trang chủ hoặc login tùy ý bạn
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "linear-gradient(135deg, #ffe5e5 0%, #fff 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Result
        icon={<Dumbbell size={64} color="#B22222" />}
        status="404"
        title="404 - Không tìm thấy trang"
        subTitle="Rất tiếc, trang bạn đang tìm không tồn tại hoặc đã bị di chuyển."
        extra={
          <Button
            type="primary"
            onClick={handleBackHome}
            style={{
              backgroundColor: "#B22222",
              borderColor: "#B22222",
              fontWeight: 600,
            }}
          >
            Quay lại trang chủ
          </Button>
        }
        style={{
          background: "white",
          borderRadius: 16,
          padding: 48,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      />
    </div>
  );
};

export default NotFoundPage;
