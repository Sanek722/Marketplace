import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    axios.get("/market/orders", {
      headers: { "X-User": "testuser" },
    }).then(res => {
      const found = res.data.find((o) => o.id.toString() === id);
      setOrder(found);
    });
  }, [id]);
  if (!order) return <div>Загрузка...</div>;

  return (
    <div>
      <Header />
      <h1>Детали заказа #{order.id}</h1>
      <p>Дата: {new Date(order.orderDate).toLocaleString()}</p>
      <p>Статус: {order.status}</p>
      <h3>Товары:</h3>
      <ul>
        {order.items.map((item) => (
          <li key={item.id}>
            {item.product.name} — {item.quantity} шт. — {item.price}₽
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderDetails;
