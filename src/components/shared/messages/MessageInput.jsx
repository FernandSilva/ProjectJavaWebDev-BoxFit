import React from 'react';

const MessageInput = ({ onSubmit, value, onChange }) => {
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit();
    }}>
      <input
        type="text"
        placeholder="Type your message..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="message-input"
      />
      <button type="submit" className="send-button">Send</button>
    </form>
  );
};

export default MessageInput;
