import { useState, useEffect } from 'react';

export default function Chat({ username,onLogout }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      setMessages([...messages, { username, text: message }]);
      setMessage('');
    }
  };

  return (
    <div className="chat-container">
      <header className="header">
        <div className="user-info">Logged in as: <span className="username">{username}</span></div>
        <button onClick={onLogout} className="logout-button">Logout</button>
      </header>
      <div className='User-contents'>
          <h2>Welcome to VAC-Connect, {username}</h2>
      </div>
      <div className="chat-room">
        <h2>Chat Room</h2>
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className="message">
              <strong>{msg.username}: </strong>
              {msg.text}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}