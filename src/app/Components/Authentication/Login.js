'use client';

import { useState, useEffect,useRef } from 'react';
import './Login.css'
import UserForm from '../Utilities/UserForm';
import { API_BASE_URL } from '@/app/API/Config';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const loginRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(username, data.session_id);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.log("password", password);
      setError('An error occurred. Please try again.');
    }
  };

  const handleClear = () => {
    setUsername('');
    setPassword('');
    setError('');
  };

  const scrollToLogin = () => {
    loginRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Welcome to DaVis</h1>

      <div className="product-info">
        <h2 className="main-headline">Discover the Power of Data</h2>
        <p>DaVis is a data exploration tool designed to revolutionize the way you interact with your data.</p>
        <ul>
          <li>Intuitive data visualization</li>
          <li>Comprehensive data summaries</li>
          <li>Advanced analytics capabilities</li>
          <li>User-friendly interface</li>
          <li>Seamless integration with various data sources</li>
        </ul>
        <div className="scroll-indicator" onClick={scrollToLogin}> 
          <p>Scroll down to use DaVis</p>
          <div className="arrow-down"></div>
        </div>
      </div>

      <div className="login" ref={loginRef}>
        <h2>Login here</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="error">{error}</div>}
          <div className="button-group">
            <button type="submit">Submit</button>
            <button type="button" onClick={handleClear}>Clear</button>
          </div>
        </form>
   
      </div>
      <div className='OtherContents'>
        <p>Please Note:</p>
        <p>This product is in development stage. You can use this product free for now.
           </p>
        <p>Try giving any username (please give your name) and password is Test01.</p>
        <p>If you want to know more about this product mail to niranjangopalan948@gmail.com</p>
        <p> Thank you. Enjoy!</p>
      </div>
      <div className="footer"> A Product of 
 <a href="https://wearevac.github.io/wearevac/"> Visionary Arts Company</a>, Made in Birmingham, England, UK. &copy; 2024
</div>
    </div>
  );
}