import React from 'react';
import { Trash2 } from 'react-feather'; // Icon for deleting messages

const MessageList = ({ messages, onDelete }) => {
  return (
    <div className="message-list">
      {messages.map(message => (
        <div key={message.$id} className="message">
          <span>{message.username}: {message.text}</span>
          <Trash2 onClick={() => onDelete(message.$id)} className="delete-icon" />
        </div>
      ))}
    </div>
  );
};

export default MessageList;
