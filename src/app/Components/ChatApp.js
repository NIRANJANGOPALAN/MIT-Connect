"use client";

import React, { useState, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState('User1');

  const addMessage = (text) => {
    const newMessage = {
      id: messages.length + 1,
      text,
      sender: currentUser,
    };
    setMessages([...messages, newMessage]);
  };

  useEffect(() => {
    // Simulate User2 response
    if (messages.length > 0 && messages[messages.length - 1].sender === 'User1') {
      setTimeout(() => {
        const user2Response = {
          id: messages.length + 1,
          text: `User2 response to: "${messages[messages.length - 1].text}"`,
          sender: 'User2',
        };
        setMessages([...messages, user2Response]);
      }, 1000); // Respond after 1 second
    }
  }, [messages]);

  const switchUser = () => {
    setCurrentUser(currentUser === 'User1' ? 'User2' : 'User1');
  };

  return (
    <div className="chat-app">
      <h1>MIT-Connect</h1>
      <button onClick={switchUser}>Switch to {currentUser === 'User1' ? 'User2' : 'User1'}</button>
      <MessageList messages={messages} currentUser={currentUser} />
      <MessageInput onSendMessage={addMessage} />
    </div>
  );
};

export default ChatApp;