import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Banners from './pages/Banners';
import Contents from './pages/Contents';
import Users from './pages/Users';
import Bases from './pages/Bases';
import Products from './pages/Products';
import Appointments from './pages/Appointments';
import Orders from './pages/Orders';
import Policies from './pages/Policies';
import Industry from './pages/Industry';
import MediaLibrary from './pages/MediaLibrary';
import Login from './pages/Login';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('liujing_admin_token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<PrivateRoute><AdminLayout><Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/banners" element={<Banners />} />
          <Route path="/admin/contents" element={<Contents />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/bases" element={<Bases />} />
          <Route path="/admin/products" element={<Products />} />
          <Route path="/admin/appointments" element={<Appointments />} />
          <Route path="/admin/orders" element={<Orders />} />
          <Route path="/admin/policies" element={<Policies />} />
          <Route path="/admin/industry" element={<Industry />} />
          <Route path="/admin/media" element={<MediaLibrary />} />
        </Routes></AdminLayout></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
