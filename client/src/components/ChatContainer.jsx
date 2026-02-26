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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((message, index) => {
          const isOwn = message.senderId === authUser._id;
          const isNew = message.isNew;
          const isLast = index === messages.length - 1;
          const isEditing = editingMessage?.id === message._id;

          return (
            <div
              key={message._id}
              className={`chat ${isOwn ? "chat-end" : "chat-start"}`}
              ref={isLast ? messageRef : null}
              onMouseEnter={() => setHoveredMessage(message._id)}
              onMouseLeave={() => setHoveredMessage(null)}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border relative">
                  <img
                    src={
                      isOwn
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                  {/* 🟢 Online green dot */}
                  {!isOwn && isOnline && (
                    <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-base-100" />
                  )}
                  {/* 🟢 New message pulse dot */}
                  {isNew && !isOwn && (
                    <span className="absolute -top-1 -right-1 size-3 bg-green-400 rounded-full ring-2 ring-base-100 animate-pulse" />
                  )}
                </div>
              </div>

              <div className="chat-header mb-1 flex items-center gap-2">
                <time className="text-xs opacity-50 ml-1">
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

              <div className="chat-bubble flex flex-col relative">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}

                {/* ✏️ Edit mode */}
                {isEditing ? (
                  <div className="flex items-center gap-2 min-w-[200px]">
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
                  message.text && <p>{message.text}</p>
                )}

                {/* 🗑️ ✏️ Action buttons on hover — own messages only */}
                {isOwn && hoveredMessage === message._id && !isEditing && (
                  <div className="absolute -top-7 right-0 flex gap-1">
                    {message.text && (
                      <button
                        onClick={() =>
                          setEditingMessage({
                            id: message._id,
                            text: message.text,
                          })
                        }
                        className="bg-base-300 hover:bg-blue-500 hover:text-white text-zinc-400 
                        rounded-full p-1 transition-all duration-200 shadow"
                        title="Edit"
                      >
                        <Pencil size={12} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteMessage(message._id)}
                      className="bg-base-300 hover:bg-red-500 hover:text-white text-zinc-400 
                      rounded-full p-1 transition-all duration-200 shadow"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
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
