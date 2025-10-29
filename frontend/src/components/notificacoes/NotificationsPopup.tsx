import React from "react";
import { X, Bell } from "lucide-react";

export interface NotificationsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPopup: React.FC<NotificationsPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "2rem",
          width: "90%",
          maxWidth: "500px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
          <Bell size={20} style={{ marginRight: "8px" }} />
          Notificações
        </h2>

        <p style={{ color: "#475569" }}>
          Você ainda não possui novas notificações.
        </p>
      </div>
    </div>
  );
};

export default NotificationsPopup;
