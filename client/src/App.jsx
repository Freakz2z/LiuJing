import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import './styles/global.css';

// 懒加载所有页面组件
const Content = lazy(() => import('./pages/Content'));
const ContentDetail = lazy(() => import('./pages/ContentDetail'));
const Policy = lazy(() => import('./pages/Policy'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Bases = lazy(() => import('./pages/Bases'));
const BaseDetail = lazy(() => import('./pages/BaseDetail'));
const About = lazy(() => import('./pages/About'));
const Charity = lazy(() => import('./pages/Charity'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Guide = lazy(() => import('./pages/Guide'));
const Feedback = lazy(() => import('./pages/Feedback'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Profile = lazy(() => import('./pages/Profile'));
const PolicyDetail = lazy(() => import('./pages/PolicyDetail'));
const Industry = lazy(() => import('./pages/Industry'));
const Cart = lazy(() => import('./pages/Cart'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const MyAppointments = lazy(() => import('./pages/MyAppointments'));

// Loading fallback
function PageLoader() {
  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '60vh', color: '#999', fontSize: '14px'
    }}>
      加载中...
    </div>
  );
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem('liujing_token');
  if (!token) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }
  return children;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    const t = setTimeout(() => {
      window.scroll(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 50);
    return () => clearTimeout(t);
  }, [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      <ScrollToTop />
      {isLoginPage ? (
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      ) : (
        <Layout homePage={isHomePage}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/content" element={<Content />} />
              <Route path="/content/:id" element={<ContentDetail />} />
              <Route path="/policy" element={<Policy />} />
              <Route path="/products" element={<Products />} />
              <Route path="/bases" element={<Bases />} />
              <Route path="/about" element={<About />} />
              <Route path="/charity" element={<Charity />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/guide" element={<Guide />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/policy/:id" element={<PolicyDetail />} />
              <Route path="/industry" element={<Industry />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/bases/:id" element={<BaseDetail />} />
              <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
              <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
              <Route path="/orders/:id" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
              <Route path="/my-appointments" element={<PrivateRoute><MyAppointments /></PrivateRoute>} />
            </Routes>
          </Suspense>
        </Layout>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
