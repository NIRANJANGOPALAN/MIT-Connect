import React from 'react';

const MessageList = ({ messages, currentUser }) => {
  return (
    <div className="message-list">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`message ${message.sender === currentUser ? 'current-user' : 'other-user'}`}
        >
          <strong>{message.sender}: </strong>
          {message.text}
        </div>
      ))}
    </div>
  );
};

export default MessageList;