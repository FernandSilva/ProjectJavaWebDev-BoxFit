import React, { useState, useEffect } from "react";
import { Loader } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
import { databases, appwriteConfig } from "@/lib/appwrite/config";
import { Query, ID, Permission, Role } from "appwrite";
import UsersList from "./UsersList";
import { User, Message } from "@/types"; // Ensure these types are correctly defined in your project

function Chat() {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { user } = useUserContext();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return; // Only fetch messages if a user is selected
      try {
        setLoading(true);
        const result = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.messageCollectionId,
          [
            Query.orderDesc("$createdAt"),
            Query.limit(50),
            Query.equal("userId", selectedUser.id),
          ]
        );
        const typedMessages: Message[] = result.documents.map((doc: any) => ({
          $id: doc.$id,
          userId: doc.userId,
          username: doc.username,
          id:doc.$id,
          content: doc.content, // Assuming text is stored under 'content'
          text: doc.content,
          createdAt: doc.createdAt,
        }));
        console.log({ typedMessages });
        setMessages(typedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser, user]); // React to changes in selectedUser and user

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Creating message data
    const messageData: Message = {
      id: ID.unique(),
      content: newMessage,
      userId: user.id,
      username: user.name,
      createdAt: new Date().toISOString(),
    };

    try {
      setMessages((prev) => [...prev, messageData]); // Append new message to the list
      setNewMessage("");
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.messageCollectionId,
        messageData.id,
        messageData,
        [
          Permission.read(Role.any()), // All users can read
          Permission.write(Role.user(user.id)), // Only the creator can write
          Permission.update(Role.user(user.id)), // Only the creator can update
          Permission.delete(Role.user(user.id)), // Only the creator can delete
        ]
      );
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-layout">
        <UsersList onSelectUser={setSelectedUser} selectedUser={selectedUser} />
        <div className="chat-messages-section">
          <div className="py-4 w-[90%] mx-auto border-b flex justify-between items-center ">
            <div className="flex items-center gap-2">
              <img
                src={selectedUser?.imageUrl}
                className="w-8 h-8 rounded-full"
                alt=""
              />
              <p>{selectedUser?.name}</p>
            </div>
            <div>
              <svg
                aria-label="Conversation information"
                className="x1lliihq x1n2onr6 x5n08af"
                fill="currentColor"
                height="24"
                role="img"
                viewBox="0 0 24 24"
                width="24"
              >
                <title>Conversation information</title>
                <circle
                  cx="12.001"
                  cy="12.005"
                  fill="none"
                  r="10.5"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                ></circle>
                <circle cx="11.819" cy="7.709" r="1.25"></circle>
                <line
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  x1="10.569"
                  x2="13.432"
                  y1="16.777"
                  y2="16.777"
                ></line>
                <polyline
                  fill="none"
                  points="10.569 11.05 12 11.05 12 16.777"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                ></polyline>
              </svg>
            </div>
          </div>
          <div className="chat-messages">
            {!loading ? (
              messages.length ? (
                messages.map((message) => (
                  <div
                    key={message.$id}
                    className={`${message.userId === user.id ? "flex-row-reverse justify-start" : " flex-row"} flex items-center w-full gap-2`}
                  >
                    {/* <img
                      src={user?.imageUrl}
                      className="w-6 h-6 rounded-full"
                    /> */}
                    <div className="message">
                      <span>{message.content}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <img
                    src={selectedUser?.imageUrl}
                    className="w-20 h-20 rounded-full"
                  />
                  <span className="font-semibold text-lg">
                    {selectedUser?.name}
                  </span>
                  <span className="font-normal text-sm">Start A new chat</span>
                </div>
              )
            ) : (
              <Loader />
            )}
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
            <button type="submit" className="send-button hover:bg-green-200">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
