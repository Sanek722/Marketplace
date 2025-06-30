import React, { useState } from "react";
import "../styles/Modal.css"; // можно добавить стиль отдельно

const Modal = ({ onClose, onConfirm }) => {
  const [address, setAddress] = useState("");

  const handleSubmit = () => {
    if (address.trim() === "") return;
    onConfirm(address);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Введите адрес пункта выдачи</h3>
        <input
          type="text"
          placeholder="Адрес"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={handleSubmit}>Оформить заказ</button>
          <button onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
