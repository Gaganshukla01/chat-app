import React, { useRef, useState } from "react";
import { useMessageStore } from "../store/useMessageStore";
import { useEffect } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./Skeleton/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Trash2, Pencil, Check, X, Reply } from "lucide-react";

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
    setReplyToMessage,
  } = useMessageStore();

  const { authUser, onlineUsers } = useAuthStore();
  const messageRef = useRef(null);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);

  // swipe to reply
  const [touchStart, setTouchStart] = useState(null);
  const [swipingId, setSwipingId] = useState(null);
  const [swipeX, setSwipeX] = useState(0);

  useEffect(() => {
    getMessages(selectedUser._id);
  }, [selectedUser._id, getMessages]);

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

  const handleTouchStart = (e, message) => {
    setTouchStart(e.touches[0].clientX);
    setSwipingId(message._id);
    setSwipeX(0);
  };

  const handleTouchMove = (e, message) => {
    if (!touchStart) return;
    const diff = e.touches[0].clientX - touchStart;
    const isOwn = message.senderId === authUser._id;

    // own messages swipe left, received swipe right
    if (isOwn && diff < 0) {
      setSwipeX(Math.max(diff, -60));
    } else if (!isOwn && diff > 0) {
      setSwipeX(Math.min(diff, 60));
    }
  };

  const handleTouchEnd = (message) => {
    if (Math.abs(swipeX) > 40) {
      setReplyToMessage(message);
    }
    setSwipeX(0);
    setSwipingId(null);
    setTouchStart(null);
  };

  const isOnline = onlineUsers.includes(selectedUser._id);

  if (isMessagesLoading) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
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
    <div className="flex flex-col flex-1 overflow-hidden">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-base-content/40 text-sm">
            No messages yet. Say hi! 👋
          </div>
        )}

        {messages.map((message, index) => {
          const isOwn = message.senderId === authUser._id;
          const isNew = message.isNew;
          const isLast = index === messages.length - 1;
          const isEditing = editingMessage?.id === message._id;
          const isSwiping = swipingId === message._id;

          return (
            <div
              key={message._id}
              className="flex flex-col"
              ref={isLast ? messageRef : null}
            >
              <div
                className={`flex items-end w-full ${isOwn ? "justify-end" : "justify-start"}`}
                onMouseEnter={() => setHoveredMessage(message._id)}
                onMouseLeave={() => setHoveredMessage(null)}
                onTouchStart={(e) => handleTouchStart(e, message)}
                onTouchMove={(e) => handleTouchMove(e, message)}
                onTouchEnd={() => handleTouchEnd(message)}
              >
                {/* Avatar — received only */}
                {!isOwn && (
                  <div className="relative shrink-0 mr-2 self-end">
                    <img
                      src={selectedUser.profilePic || "/avatar.png"}
                      alt="profile pic"
                      className="size-8 rounded-full border object-cover"
                    />
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full ring-2 ring-base-100" />
                    )}
                  </div>
                )}

                <div
                  className={`flex items-center gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                  style={{
                    transform: isSwiping
                      ? `translateX(${swipeX}px)`
                      : "translateX(0)",
                    transition: isSwiping ? "none" : "transform 0.2s ease",
                  }}
                >
                  {/* Reply icon shown while swiping */}
                  {isSwiping && Math.abs(swipeX) > 20 && (
                    <div
                      className={`${isOwn ? "order-last ml-1" : "order-first mr-1"}`}
                    >
                      <Reply size={18} className="text-primary" />
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`flex flex-col max-w-[65%] ${isOwn ? "items-end" : "items-start"}`}
                  >
                    <div className="relative group">
                      {/* Quoted reply preview inside bubble */}
                      {message.replyTo && (
                        <div
                          className={`mb-1 px-3 py-1.5 rounded-xl text-xs border-l-4 border-primary
                          ${isOwn ? "bg-primary/20" : "bg-base-200"}`}
                        >
                          <p className="text-primary font-semibold mb-0.5">
                            {message.replyTo.senderId === authUser._id
                              ? "You"
                              : selectedUser.fullName}
                          </p>
                          <p className="opacity-60 truncate max-w-[200px]">
                            {message.replyTo.image && !message.replyTo.text
                              ? "📷 Photo"
                              : message.replyTo.text}
                          </p>
                        </div>
                      )}

                      {/* Image */}
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
                              if (e.key === "Enter")
                                handleEditSave(message._id);
                              if (e.key === "Escape") setEditingMessage(null);
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => handleEditSave(message._id)}
                            className="text-green-500"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setEditingMessage(null)}
                            className="text-red-500"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        message.text && (
                          <div
                            className={`px-4 py-2 rounded-2xl text-sm break-words leading-relaxed
                            ${
                              isOwn
                                ? "bg-primary text-primary-content rounded-br-none"
                                : "bg-base-300 text-base-content rounded-bl-none"
                            }`}
                          >
                            {message.text}
                          </div>
                        )
                      )}

                      {/* Hover actions */}
                      {hoveredMessage === message._id && !isEditing && (
                        <div
                          className={`absolute -top-8 ${isOwn ? "right-0" : "left-0"} flex gap-1 z-10`}
                        >
                          {/* Reply — for all messages */}
                          <button
                            onClick={() => setReplyToMessage(message)}
                            className="bg-base-300 hover:bg-primary hover:text-white text-zinc-400 rounded-full p-1.5 transition-all shadow-md"
                            title="Reply"
                          >
                            <Reply size={12} />
                          </button>

                          {/* Edit + Delete — own only */}
                          {isOwn && (
                            <>
                              {message.text && (
                                <button
                                  onClick={() =>
                                    setEditingMessage({
                                      id: message._id,
                                      text: message.text,
                                    })
                                  }
                                  className="bg-base-300 hover:bg-blue-500 hover:text-white text-zinc-400 rounded-full p-1.5 transition-all shadow-md"
                                  title="Edit"
                                >
                                  <Pencil size={12} />
                                </button>
                              )}
                              <button
                                onClick={() => deleteMessage(message._id)}
                                className="bg-base-300 hover:bg-red-500 hover:text-white text-zinc-400 rounded-full p-1.5 transition-all shadow-md"
                                title="Delete"
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Time + edited + new */}
                    <div className="flex items-center gap-1 mt-1 px-1">
                      <time className="text-xs opacity-40">
                        {formatMessageTime(message.createdAt)}
                      </time>
                      {message.isEdited && (
                        <span className="text-xs opacity-40 italic">
                          edited
                        </span>
                      )}
                      {isNew && !isOwn && (
                        <span className="text-xs text-green-500 font-semibold animate-pulse">
                          ● new
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="shrink-0">
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatContainer;
