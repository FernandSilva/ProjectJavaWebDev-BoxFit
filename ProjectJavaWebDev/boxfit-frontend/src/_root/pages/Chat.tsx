// src/_root/pages/Chat.tsx
import { Loader } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
import {
  useSendMessage,
  useThread,
  useUser,
} from "@/lib/react-query/queries";
import { User } from "@/types";
import { useWindowSize } from "@uidotdev/usehooks";
import moment from "moment";
import { useEffect, useRef, useState, useMemo } from "react";
import { MdArrowBack } from "react-icons/md";
import UsersList from "./UsersList";
import { useSearchParams } from "react-router-dom";

type MaybeDocUser = User & { $id?: string; id?: string };

function Chat() {
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<MaybeDocUser | null>(null);
  const { user } = useUserContext();
  const [steps, setSteps] = useState<number>(0);
  const { width } = useWindowSize();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const userIdFromQuery = searchParams.get("userId");

  // Normalize the peer id whether the object has id or $id
  const peerId = useMemo(
    () => (selectedUser ? selectedUser.id ?? selectedUser.$id : undefined),
    [selectedUser]
  );

  // ✅ correct hook
  const { data: userFromQuery } = useUser(userIdFromQuery || "");

  // ✅ correct hook (conversation)
  const {
    data: receivedMessages,
    isLoading: loading,
  } = useThread(user?.id as any, peerId as any);

  // ✅ correct hook (send message)
  const { mutateAsync: sendMessageMutation } = useSendMessage();

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const content = newMessage.trim();
    if (!content || !user?.id || !peerId) return;

    try {
      setNewMessage("");
      await sendMessageMutation({
        userId: user.id,
        recipientId: peerId,
        content: content.slice(0, 220),
        username: user.name,
      });

      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [receivedMessages]);

  // If navigated here with ?userId=, preselect that user
  useEffect(() => {
    if (userIdFromQuery && userFromQuery) {
      const mappedUser: MaybeDocUser = {
        id: userFromQuery.$id,
        name: userFromQuery.name,
        username: userFromQuery.username,
        email: userFromQuery.email,
        imageUrl: userFromQuery.imageUrl,
        bio: userFromQuery.bio,
        $id: userFromQuery.$id,
      };
      setSelectedUser(mappedUser);
      setSteps(1);
    }
  }, [userIdFromQuery, userFromQuery]);

  const MessageList = (
    <div className="chat-messages overflow-y-auto flex flex-col gap-2 p-4">
      {!loading ? (
        receivedMessages?.documents?.length ? (
          receivedMessages.documents.map((message: any) => (
            <div
              key={message.$id}
              className={`flex ${
                message.userId === user?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`message px-3 py-2 rounded-lg ${
                  message.userId === user?.id
                    ? "bg-green-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                <span className="text-sm">{message.content}</span>
                <sub className="text-xs ml-2 text-gray-600">
                  {moment(message.$createdAt ?? message.createdAt).format("hh:mm")}
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
      <div ref={messagesEndRef} />
    </div>
  );

  const Composer = (
    <form onSubmit={handleSendMessage} className="message-form">
      <input
        type="text"
        placeholder="Type your message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        className="message-input"
      />
      <button
        type="submit"
        className="send-button hover:bg-green-200"
        disabled={!newMessage.trim() || !peerId || !user?.id}
        title={!peerId ? "Select a user to chat with" : undefined}
      >
        Send
      </button>
    </form>
  );

  return (
    <div className="chat-container">
      <div className="chat-layout !h-[84vh] sm:!h-full">
        {(width ?? 0) < 1024 ? (
          <>
            {steps === 0 && (
              <UsersList
                onSelectUser={(u: any) => {
                  const normalized: MaybeDocUser = {
                    ...(u || {}),
                    id: u?.id ?? u?.$id,
                  };
                  setSelectedUser(normalized);
                  setSteps(1);
                }}
                selectedUser={selectedUser as any}
                setSteps={setSteps}
              />
            )}

            {steps === 1 && selectedUser && (
              <div className="chat-messages-section !w-full lg:!w-[70%] !h-[80vh] lg:!h-[100vh]">
                <div className="py-4 w-[90%] mx-auto border-b flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MdArrowBack
                      onClick={() => setSteps(0)}
                      className="text-black text-lg cursor-pointer"
                    />
                    <img
                      src={selectedUser.imageUrl}
                      className="w-8 h-8 rounded-full"
                      alt="User avatar"
                    />
                    <p>{selectedUser.name}</p>
                  </div>
                </div>

                {MessageList}
                {Composer}
              </div>
            )}
          </>
        ) : (
          <>
            <UsersList
              onSelectUser={(u: any) => {
                const normalized: MaybeDocUser = {
                  ...(u || {}),
                  id: u?.id ?? u?.$id,
                };
                setSelectedUser(normalized);
              }}
              selectedUser={selectedUser as any}
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

                {MessageList}
                {Composer}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Chat;
