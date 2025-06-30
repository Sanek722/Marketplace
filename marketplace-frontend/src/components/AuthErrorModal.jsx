import React from "react";
import '../styles/AuthErrorModal.css'; // Импортируем стили

const AuthErrorModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null; // Не отображаем модальное окно, если isOpen = false

  return (
    <div className="modal-overlay"> {/* Контейнер для затемнения */}
      <div className="modal-content"> {/* Контейнер для контента модального окна */}
        <h2>Ошибка авторизации</h2>
        <p>Вы должны быть авторизованы, чтобы выполнить это действие.</p>
        <button onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
};

export default AuthErrorModal;
