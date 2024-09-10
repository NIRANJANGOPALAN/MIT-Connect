'use client';

import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import "./Chat.css";

let socket;

export default function Chat({ username, sessionId, onLogout }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket = io('http://localhost:5000', {
      transports: ['websocket'],
      query: { session_id: sessionId }
    });

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('authenticate', { session_id: sessionId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('authentication', (response) => {
      if (response.status === 'success') {
        console.log('Socket authenticated successfully');
      } else {
        console.error('Socket authentication failed:', response.message);
        onLogout();
      }
    });

    socket.on('initial messages', (initialMessages) => {
      setMessages(initialMessages);
    });

    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('authentication');
      socket.off('initial messages');
      socket.off('chat message');
      socket.disconnect();
    };
  }, [sessionId, onLogout]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && isConnected) {
      const newMessage = { username, text: message };
      socket.emit('chat message', newMessage);
      setMessage('');
    }
  };

  const handleLogout = () => {
    socket.disconnect();
    onLogout();
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>Chat Room</h1>
        <div className="user-info">
          Logged in as: <span className="username">{username}</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.username === username ? 'own-message' : ''}`}>
            <strong>{msg.username}: </strong>
            <span>{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
        />
        <button type="submit" className="send-button" disabled={!isConnected}>Send</button>
      </form>
      {!isConnected && <div className="connection-status">Disconnected from server. Trying to reconnect...</div>}
    </div>
  );
}