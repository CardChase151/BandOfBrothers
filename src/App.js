import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Login from './onboarding/login';
import CreateAccount from './onboarding/createAccount';
import EmailVerify from './onboarding/emailVerify';
import ForgotPassword from './onboarding/forgotPassword';
import NewPassword from './onboarding/newPassword';
import Home from './main/home';
import Training from './main/training';
import Schedule from './main/schedule';
import Licensing from './main/licensing';
import Calculator from './main/calculator';
import NewRepStart from './main/newrepstart';
import ChatDash from './main/chatdash';
import ChatCreate from './main/chatcreate';
import ChatMessage from './main/chatmessage';
import Admin from './admin/admin';
import Admin2 from './admin/admin2';
import Profile from './main/profile';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, just set loading to false and don't fetch profiles
    console.log('Setting loading to false immediately');
    setLoading(false);

    // Listen for auth changes but don't fetch profile yet
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.email);
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, not fetching profile yet');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App" style={{ overflow: 'hidden', height: '100vh', width: '100vw' }}>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/email-verify" element={<EmailVerify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/new-password" element={<NewPassword />} />
          
          {/* Main App Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/newrepstart" element={<NewRepStart />} />
          <Route path="/training" element={<Training />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/licensing" element={<Licensing />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/chat" element={<ChatDash />} />
          <Route path="/chat/create" element={<ChatCreate />} />
          <Route path="/chat/:chatId" element={<ChatMessage />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin-manage" element={<Admin2 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;