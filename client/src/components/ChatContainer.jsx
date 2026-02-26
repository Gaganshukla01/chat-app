import React, { useRef, useState } from "react";
import { useMessageStore } from "../store/useMessageStore";
import { useEffect } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./Skeleton/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Trash2, Pencil, Check, X } from "lucide-react";

const ChatContainer = () => {
  const {
    getMessages,
    isMessagesLoading,
    selectedUser,
    messages,
    subscribeToMessage,
    unSubscribeFromMessage,
    deleteMessage,
    updateMessage,
  } = useMessageStore();

  const { authUser, onlineUsers } = useAuthStore();
  const messageRef = useRef(null);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessage();
    return () => unSubscribeFromMessage();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessage,
    unSubscribeFromMessage,
  ]);

  useEffect(() => {
    if (messageRef.current && messages) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleEditSave = async (messageId) => {
    if (!editingMessage.text.trim()) return;
    await updateMessage(messageId, editingMessage.text);
    setEditingMessage(null);
  };

  const isOnline = onlineUsers.includes(selectedUser._id);

  if (isMessagesLoading) {
    return (
      <div className="flex flex-col overflow-hidden" style={{ height: "100%" }}>
        <ChatHeader />
        <div className="flex-1 min-h-0 overflow-y-auto">
          <MessageSkeleton />
        </div>
        <div className="shrink-0">
          <MessageInput />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100%" }}>
      <ChatHeader />

      {/* Messages scroll area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((message, index) => {
          const isOwn = message.senderId === authUser._id;
          const isNew = message.isNew;
          const isLast = index === messages.length - 1;
          const isEditing = editingMessage?.id === message._id;

          return (
            <div
              key={message._id}
              className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
              ref={isLast ? messageRef : null}
              onMouseEnter={() => setHoveredMessage(message._id)}
              onMouseLeave={() => setHoveredMessage(null)}
            >
              {/* Avatar — only for received messages */}
              {!isOwn && (
                <div className="relative shrink-0">
                  <img
                    src={selectedUser.profilePic || "/avatar.png"}
                    alt="profile pic"
                    className="size-8 rounded-full border object-cover"
                  />
                  {/* Online dot */}
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full ring-2 ring-base-100" />
                  )}
                  {/* New message pulse dot */}
                  {isNew && (
                    <span className="absolute -top-1 -right-1 size-2.5 bg-green-400 rounded-full ring-2 ring-base-100 animate-pulse" />
                  )}
                </div>
              )}

              {/* Bubble + time */}
              <div
                className={`flex flex-col max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}
              >
                <div className="relative group">
                  {/* Image attachment */}
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="max-w-[200px] rounded-xl mb-1 object-cover"
                    />
                  )}

                  {/* Edit mode */}
                  {isEditing ? (
                    <div className="flex items-center gap-2 min-w-[180px]">
                      <input
                        type="text"
                        className="input input-sm flex-1 text-base-content bg-base-200 rounded"
                        value={editingMessage.text}
                        onChange={(e) =>
                          setEditingMessage({
                            ...editingMessage,
                            text: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditSave(message._id);
                          if (e.key === "Escape") setEditingMessage(null);
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => handleEditSave(message._id)}
                        className="text-green-500 hover:text-green-400"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingMessage(null)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    message.text && (
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm break-words ${
                          isOwn
                            ? "bg-primary text-primary-content rounded-br-none"
                            : "bg-base-300 text-base-content rounded-bl-none"
                        }`}
                      >
                        {message.text}
                      </div>
                    )
                  )}

                  {/* 🗑️ ✏️ Action buttons on hover — own messages only */}
                  {isOwn && hoveredMessage === message._id && !isEditing && (
                    <div className="absolute -top-8 right-0 flex gap-1 z-10">
                      {message.text && (
                        <button
                          onClick={() =>
                            setEditingMessage({
                              id: message._id,
                              text: message.text,
                            })
                          }
                          className="bg-base-300 hover:bg-blue-500 hover:text-white 
                          text-zinc-400 rounded-full p-1.5 transition-all duration-200 shadow-md"
                          title="Edit"
                        >
                          <Pencil size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteMessage(message._id)}
                        className="bg-base-300 hover:bg-red-500 hover:text-white 
                        text-zinc-400 rounded-full p-1.5 transition-all duration-200 shadow-md"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Timestamp + edited + new badge */}
                <div className="flex items-center gap-1 mt-1 px-1">
                  <time className="text-xs opacity-40">
                    {formatMessageTime(message.createdAt)}
                  </time>
                  {message.isEdited && (
                    <span className="text-xs opacity-40 italic">edited</span>
                  )}
                  {isNew && !isOwn && (
                    <span className="text-xs text-green-500 font-semibold">
                      New
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input pinned at bottom */}
      <div className="shrink-0">
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatContainer;
