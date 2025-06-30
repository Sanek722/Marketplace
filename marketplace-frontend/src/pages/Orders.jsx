import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import "../styles/Orders.css"
const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/market/orders/all", {
      credentials: "include",
    })
      .then(async (res) => {
        const text = await res.text();
        const data = JSON.parse(text);
        setOrders(data);
      })
      .catch(err => console.error("Ошибка загрузки заказов", err));
  }, []);
  

  return ( 
    <div>
      <Header />
        <div className="orders-page">
        <div className="orders-container">
          <h1 className="orders-title">Мои заказы</h1>
      
          {orders.length === 0 ? (
            <div className="orders-empty">У вас пока нет заказов 🛒</div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-date">
                  Заказ от <span>{new Date(order.orderDate).toLocaleString()}</span>
                </div>
                <div className="order-status">
                  Статус: {order.status}
                </div>
                <div className="order-items-title">Товары:</div>
                <ul className="order-items-list">
                  {order.items.map(item => (
                    <li key={item.id} className="order-item">
                      <span className="order-item-name">{item.product.name}</span>
                      <span className="order-item-info">{item.quantity} × {item.price}₽</span>
                    </li>
                  ))}
                </ul>
      
                <div className="order-total">
                  Сумма: {order.items.reduce((sum, item) => sum + item.quantity * item.price, 0)}₽
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>

  );
};

export default Orders;
