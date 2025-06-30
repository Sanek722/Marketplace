import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Basket from './pages/Basket.jsx';
import Orders from './pages/Orders';
import Profile from './pages/Profile.jsx';
import LoginForm from './api/Login.jsx';
import LogoutForm from './api/Logout.jsx';
import ProductPage from './components/ProductPage.jsx';
import OrderDetails from './components/OrderDetails.jsx';
import ProductManager from './pages/ProductManager.jsx';
import RegisterForm from './api/Register.jsx';
import ProtectedAdminRoute from './components/ProtectedAdminRoute.jsx';
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/basket" element={<Basket />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/logout" element={<LogoutForm />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/orders/:id" element={<OrderDetails />} />
      <Route path="/admin/" element={
        <ProtectedAdminRoute>
          <ProductManager />
        </ProtectedAdminRoute>
  }/>
      <Route path='/register' element = {<RegisterForm/>} />

    </Routes>
  );
};

export default App;
