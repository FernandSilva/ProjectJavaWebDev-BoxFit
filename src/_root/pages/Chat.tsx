import { Loader } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
import { useCreateMessage, useGetMessages } from "@/lib/react-query/queries";
import { Message, User } from "@/types";
import { useWindowSize } from "@uidotdev/usehooks";
import { ID } from "appwrite";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { MdArrowBack } from "react-icons/md";
import UsersList from "./UsersList";

function Chat() {
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { user } = useUserContext();
  const [steps, setSteps] = useState<number>(0);
  const { width } = useWindowSize();
  const messagesEndRef = useRef<HTMLDivElement>(null); // Add this ref

  const { mutateAsync: createMessage } = useCreateMessage();
  const { data: receivedMessages, isLoading: loading } = useGetMessages(
    selectedUser?.id || "",
    user?.id || ""
  );

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !user) return;

    const messageData: Message = {
      $id: ID.unique(),
      userId: user.id,
      username: user.name,
      id: ID.unique(),
      content: newMessage,
      text: newMessage,
      createdAt: new Date().toISOString(),
      recipientId: selectedUser.id,
      senderImageUrl: user.imageUrl, // <-- Added required attribute
    };

    try {
      setNewMessage("");
      await createMessage(messageData);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [receivedMessages]); // Scrolls whenever messages update

  return (
    <div className="chat-container">
      <div className="chat-layout !h-[84vh] sm:!h-full">
        {(width ?? 0) < 1024 ? (
          <>
            {steps === 0 && (
              <UsersList
                onSelectUser={setSelectedUser}
                selectedUser={selectedUser}
                setSteps={setSteps}
              />
            )}
            {steps === 1 && selectedUser && (
              <div className="chat-messages-section !w-full lg:!w-[70%] !h-[80vh] lg:!h-[100vh]">
                <div className="py-4 w-[90%] mx-auto border-b flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MdArrowBack onClick={() => setSteps(0)} className="text-black text-lg" />
                    <img
                      src={selectedUser.imageUrl}
                      className="w-8 h-8 rounded-full"
                      alt="User avatar"
                    />
                    <p>{selectedUser.name}</p>
                  </div>
                </div>
                <div className="chat-messages overflow-y-auto flex flex-col gap-2 p-4">
                  {!loading ? (
                    receivedMessages?.documents.length ? (
                      receivedMessages.documents.map((message) => (
                        <div
                          key={message.$id}
                          className={`flex ${
                            message.userId === user.id ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`message px-3 py-2 rounded-lg ${
                              message.userId === user.id
                                ? "bg-green-500 text-white"
                                : "bg-gray-200"
                            }`}
                          >
                            <span className="text-sm">{message.content}</span>
                            <sub className="text-xs ml-2 text-gray-600">
                              {moment(message.$createdAt).format("hh:mm")}
                            </sub>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center">Start a new chat</div>
                    )
                  ) : (
                    <Loader />
                  )}
                  <div ref={messagesEndRef} /> {/* Add this empty div at the end */}
                </div>
                <form onSubmit={sendMessage} className="message-form">
                  <input
                    type="text"
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
            )}
          </>
        ) : (
          <>
            <UsersList
              onSelectUser={setSelectedUser}
              selectedUser={selectedUser}
              setSteps={setSteps}
            />
            {selectedUser && (
              <div className="chat-messages-section">
                <div className="py-4 w-[90%] mx-auto border-b flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedUser.imageUrl}
                      className="w-8 h-8 rounded-full"
                      alt="User avatar"
                    />
                    <p>{selectedUser.name}</p>
                  </div>
                </div>
                <div className="chat-messages overflow-y-auto flex flex-col gap-2 p-4">
                  {!loading ? (
                    receivedMessages?.documents.length ? (
                      receivedMessages.documents.map((message) => (
                        <div
                          key={message.$id}
                          className={`flex ${
                            message.userId === user.id ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`message px-3 py-2 rounded-lg ${
                              message.userId === user.id
                                ? "bg-green-500 text-white"
                                : "bg-gray-200"
                            }`}
                          >
                            <span className="text-sm">{message.content}</span>
                            <sub className="text-xs ml-2 text-gray-600">
                              {moment(message.$createdAt).format("hh:mm")}
                            </sub>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center">Start a new chat</div>
                    )
                  ) : (
                    <Loader />
                  )}
                  <div ref={messagesEndRef} /> {/* Add this empty div at the end */}
                </div>
                <form onSubmit={sendMessage} className="message-form">
                  <input
                    type="text"
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
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Chat;
