// Chat.tsx
import React, { useState, useEffect } from 'react';
import { Loader } from '@/components/shared';
import { useUserContext } from '@/context/AuthContext';
import { databases, appwriteConfig } from '@/lib/appwrite/config';
import { Query, ID } from "appwrite";
import UsersList from './UsersList';
import { User, Message } from '@/types';  // Ensure these types are correctly defined in your project

function Chat() {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { user } = useUserContext();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;  // Only fetch messages if a user is selected
      try {
        const result = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.messageCollectionId,
          [Query.orderDesc('$createdAt'), Query.limit(50), Query.equal('userId', selectedUser.id)]
        );
        const typedMessages: Message[] = result.documents.map((doc: any) => ({
          $id: doc.$id,
          userId: doc.userId,
          username: doc.username,
          text: doc.content,  // Assuming text is stored under 'content'
          createdAt: doc.createdAt
        }));
        setMessages(typedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [selectedUser, user]);  // React to changes in selectedUser and user

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
  
   // Sending messages
const messageData: Message = {
  $id: ID.unique(),
  content: newMessage,  // Changed 'text' to 'content'
  userId: user.id,
  username: user.name,
  createdAt: new Date().toISOString()
};
  
    try {
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.messageCollectionId,
        messageData.$id,
        messageData,
        {
          read: ['role:all'], // All users can read
          write: ['user:' + user.id] // Only the creator can write
        }
      );
      setNewMessage('');
      setMessages(prev => [...prev, messageData]); // Append new message to the list
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };
  

  return (
    <div className="chat-container">
      <div className="chat-header" >Chat</div>
      <div className="chat-layout">
        <UsersList onSelectUser={setSelectedUser} />
        <div className="chat-messages-section">
          <div className="chat-messages">
            {messages.length ? messages.map(message => (
              <div key={message.$id} className="message">
                <span>{message.username}: {message.text}</span>
              </div>
            )) : <Loader />}
          </div>
          <form onSubmit={sendMessage} className="message-form">
            <input
              type="text"
              id="messageInput"
              name="message"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="message-input"
            />
            <button type="submit" className="send-button">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
