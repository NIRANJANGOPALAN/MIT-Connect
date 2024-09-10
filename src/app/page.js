'use client';

import { useState } from 'react';
import './page.module.css'
import Login from './Components/Authentication/Login';
import Chat from './Components/Chat/Chat';

export default function Home() {
  const [username, setUsername] = useState('');
  const [sessionId, setSessionId] = useState('');

  const handleLogin = (name, sid) => {
    setUsername(name);
    setSessionId(sid);
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setUsername('');
    setSessionId('');
  };

  return (
    <div className="container">
      {username ? (
        <Chat username={username} sessionId={sessionId} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}