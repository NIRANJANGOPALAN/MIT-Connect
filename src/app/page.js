'use client';

import { useEffect, useState } from 'react';

import Login from './Components/Authentication/Login';
import Chat from './Components/Chat/Chat';
import { API_BASE_URL } from './API/Config';
import GoogleAnalytics from './AI/GoogleAnalytics';
import { ImportExport } from '@mui/icons-material';

export default function Home() {
  const [username, setUsername] = useState('');
  const [sessionId, setSessionId] = useState('');

  const handleLogin = (name, sid) => {
    setUsername(name);
    setSessionId(sid);
    localStorage.setItem('username',name);
    localStorage.setItem('sessionId', sid);
  };

  useEffect(() =>{
    const storedUsername = localStorage.getItem('username');
    const storedSessionId = localStorage.getItem('sessionId');
    if(storedUsername && storedSessionId){
      setUsername(storedUsername);
      setSessionId(storedSessionId)
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
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
    localStorage.removeItem('userName');
    localStorage.removeItem('sessionId');
  };

  return (
    <>
      <GoogleAnalytics/>
      {username && sessionId ? (
        <Chat username={username} sessionId={sessionId} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </>
  );
}