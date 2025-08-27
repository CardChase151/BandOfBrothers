import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './onboarding/login';
import CreateAccount from './onboarding/createAccount';
import EmailVerify from './onboarding/emailVerify';
import ForgotPassword from './onboarding/forgotPassword';
import NewPassword from './onboarding/newPassword';
import Home from './main/home';
import Training from './main/training';
import Schedule from './main/schedule';
import Licensing from './main/licensing';
import Admin from './admin/admin';
import Admin2 from './admin/admin2';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Authentication Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/email-verify" element={<EmailVerify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/new-password" element={<NewPassword />} />
          
          {/* Main App Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/training" element={<Training />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/licensing" element={<Licensing />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin-manage" element={<Admin2 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;