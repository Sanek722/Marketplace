import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import "../styles/Basket.css";
import { useNavigate } from "react-router-dom";

const Basket = () => {
  const [basket, setBasket] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchBasket();
  }, []);

  const fetchBasket = async () => {
    try {
      const response = await axios.get("http://localhost:8080/market/basket/all", {
        withCredentials: true,
      });
      console.log(response.data);
      setBasket(response.data);
    } catch (err) {
      console.error("Ошибка при получении корзины", err);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await axios.put(
        `http://localhost:8080/market/basket/update/${productId}`,
        null,
        {
          params: { quantity },
          withCredentials: true,
        }
      );
      fetchBasket();
    } catch (err) {
      console.error("Ошибка при обновлении количества", err);
    }
  };

  const removeItem = async (productId) => {
    try {
      await axios.delete(`http://localhost:8080/market/basket/remove/${productId}`, {
        withCredentials: true,
      });
      fetchBasket();
    } catch (err) {
      console.error("Ошибка при удалении товара", err);
    }
  };

  const handleOrder = async () => {
    try {
      const response = await axios.post("http://localhost:8080/market/orders/create", null, {
        withCredentials: true,
      });
      setMessage("Заказ успешно оформлен!");
      setBasket([]);
    } catch (err) {
      console.error("Ошибка при создании заказа", err);
      setMessage(" Ошибка при оформлении заказа.");
    }
  };

  return (
    <div>
      <Header />
      <main className="basket-main">
        <h1 className="basket-title">Корзина</h1>
  
        {message && (
          <div className="basket-message">
            {message}
          </div>
        )}
  
        {Array.isArray(basket) && basket.length > 0 ? (
          <div className="basket-list">
            {basket.map((item) => (
              <div key={item.id} className="basket-card">
                {item.images?.length > 0 && (
                  <img
                    src={`http://localhost:8080${item.images[0].imageUrl}`}
                    alt={item.product.name}
                    className="basket-image"
                  />
                )}
                <div className="basket-info">
                  <h3>{item.product.name}</h3>
                  <p>Цена: {item.product.price} ₽</p>
                  <div className="basket-actions">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</button>
                      <button onClick={() => removeItem(item.product.id)} className="basket-remove-btn">
                        Удалить
                      </button>
                    </div>
                </div>
              </div>
            ))}
  
            <div className="basket-total">
              <strong>
                Общая сумма:{" "}
                {basket.reduce((sum, item) => sum + item.product.price * item.quantity, 0)} ₽
              </strong>
            </div>
  
            <button onClick={handleOrder} className="basket-order-btn">
              Оформить заказ
            </button>
          </div>
        ) : (
          <p className="basket-empty">Корзина пуста</p>
        )}
      </main>
    </div>
  );
};

export default Basket;
