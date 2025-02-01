import { Loader } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
import React, { useEffect, useState, useRef } from "react";
import { useCreateMessage, useGetMessages } from "@/lib/react-query/queries";
import { Message, User } from "@/types";
import { useWindowSize } from "@uidotdev/usehooks";
import { ID } from "appwrite";
import moment from "moment";
import { MdArrowBack } from "react-icons/md";
import UsersList from "./UsersList";

function Chat() {
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { user } = useUserContext();
  const [steps, setSteps] = useState<number>(0);
  const { width } = useWindowSize();

  const { mutateAsync: createMessage } = useCreateMessage();
  const { data: recievedMessages, isLoading: loading } = useGetMessages(
    selectedUser?.id,
    user?.id
  );

  useEffect(() => {
    // (Optional: additional logic to fetch messages if needed)
  }, [selectedUser, user]);

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
    };

    try {
      setNewMessage("");
      await createMessage(messageData);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Type the videoRefs as an array of HTMLVideoElement
  const videoRefs = useRef<HTMLVideoElement[]>([]);

  return (
    <div className="chat-container">
      <div className="chat-layout !h-[84vh] sm:!h-full">
        {(width ?? 0) < 1024 && (
          <>
            {steps === 0 && (
              <UsersList
                onSelectUser={setSelectedUser}
                selectedUser={selectedUser}
                setSteps={setSteps}
              />
            )}
            {steps === 1 && (
              <div className="chat-messages-section !w-full lg:!w-[70%] !h-[80vh] lg:!h-[100vh]">
                <div className="py-4 w-[90%] mx-auto border-b flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MdArrowBack onClick={() => setSteps(0)} className="text-black text-lg" />
                    <img
                      src={selectedUser?.imageUrl}
                      className="w-8 h-8 rounded-full"
                      alt="User avatar"
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
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></circle>
                      <circle cx="11.819" cy="7.709" r="1.25"></circle>
                      <line
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        x1="10.569"
                        x2="13.432"
                        y1="16.777"
                        y2="16.777"
                      ></line>
                      <polyline
                        fill="none"
                        points="10.569 11.05 12 11.05 12 16.777"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></polyline>
                    </svg>
                  </div>
                </div>
                <div className="chat-messages">
                  {!loading ? (
                    (recievedMessages?.documents?.length ?? 0) > 0 ? (
                      (recievedMessages?.documents ?? []).map((message) => (
                        <div
                          key={message.$id}
                          className={`${
                            message.userId === user.id ? "flex-row-reverse justify-start" : "flex-row"
                          } flex items-center w-full gap-2`}
                        >
                          <div
                            className={`message ${
                              message.userId === user.id ? "bg-green-500" : "!bg-gray-500"
                            }`}
                          >
                            <span className="text-sm">{message.content}</span>
                            <sub className="text-[10px] font-medium ml-2">
                              {moment(message.$createdAt).format("hh:mm")}
                            </sub>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <img
                          src={selectedUser?.imageUrl}
                          className="w-20 h-20 rounded-full"
                          alt="User avatar"
                        />
                        <span className="font-semibold text-lg">{selectedUser?.name}</span>
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
            )}
          </>
        )}
        {(width ?? 0) > 1024 && (
          <>
            <UsersList
              onSelectUser={setSelectedUser}
              selectedUser={selectedUser}
              setSteps={setSteps}
            />
            <div className="chat-messages-section">
              <div className="py-4 w-[90%] mx-auto border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img
                    src={selectedUser?.imageUrl}
                    className="w-8 h-8 rounded-full"
                    alt="User avatar"
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
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    ></circle>
                    <circle cx="11.819" cy="7.709" r="1.25"></circle>
                    <line
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      x1="10.569"
                      x2="13.432"
                      y1="16.777"
                      y2="16.777"
                    ></line>
                    <polyline
                      fill="none"
                      points="10.569 11.05 12 11.05 12 16.777"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    ></polyline>
                  </svg>
                </div>
              </div>
              <div className="chat-messages">
                {!loading ? (
                  (recievedMessages?.documents?.length ?? 0) > 0 ? (
                    (recievedMessages?.documents ?? []).map((message) => (
                      <div
                        key={message.$id}
                        className={`${
                          message.userId === user.id ? "flex-row-reverse justify-start" : "flex-row"
                        } flex items-center w-full gap-2`}
                      >
                        <div
                          className={`message ${
                            message.userId === user.id ? "bg-green-500" : "!bg-gray-500"
                          }`}
                        >
                          <span>
                            {message.content}{" "}
                            <sub className="text-[10px] font-medium ml-2">
                              {moment(message.$createdAt).format("hh:mm")}
                            </sub>
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <img
                        src={selectedUser?.imageUrl}
                        className="w-20 h-20 rounded-full"
                        alt="User avatar"
                      />
                      <span className="font-semibold text-lg">{selectedUser?.name}</span>
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
          </>
        )}
      </div>
    </div>
  );
}

export default Chat;
