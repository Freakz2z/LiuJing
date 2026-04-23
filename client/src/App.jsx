import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Content from './pages/Content';
import ContentDetail from './pages/ContentDetail';
import Policy from './pages/Policy';
import Products from './pages/Products';
import Bases from './pages/Bases';
import Login from './pages/Login';
import About from './pages/About';
import Charity from './pages/Charity';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Guide from './pages/Guide';
import Feedback from './pages/Feedback';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';
import PolicyDetail from './pages/PolicyDetail';
import ProductDetail from './pages/ProductDetail';
import BaseDetail from './pages/BaseDetail';
import './styles/global.css';

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
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/bases/:id" element={<BaseDetail />} />
          </Routes>
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
