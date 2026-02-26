import React, { useRef, useState, useEffect } from "react";
import { useMessageStore } from "../store/useMessageStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./Skeleton/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Trash2, Pencil, Check, X, Reply, Mic } from "lucide-react";

const ChatContainer = () => {
  const {
    getMessages,
    isMessagesLoading,
    selectedUser,
    messages,
    deleteMessage,
    updateMessage,
    setReplyToMessage,
  } = useMessageStore();

  const { authUser, onlineUsers } = useAuthStore();
  const messageRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);
  const [swipingId, setSwipingId] = useState(null);
  const [swipeX, setSwipeX] = useState(0);
  const [swipeTriggered, setSwipeTriggered] = useState(false);

  useEffect(() => {
    getMessages(selectedUser._id);
  }, [selectedUser._id, getMessages]);

  useEffect(() => {
    if (messageRef.current && messages) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    return () => clearTimeout(hoverTimeoutRef.current);
  }, []);

  const handleMouseEnter = (messageId) => {
    clearTimeout(hoverTimeoutRef.current);
    setHoveredMessage(messageId);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMessage(null);
    }, 300);
  };

  const handleEditSave = async (messageId) => {
    if (!editingMessage.text.trim()) return;
    await updateMessage(messageId, editingMessage.text);
    setEditingMessage(null);
  };

  const handleTouchStart = (e, message) => {
    setTouchStartX(e.touches[0].clientX);
    setSwipingId(message._id);
    setSwipeX(0);
    setSwipeTriggered(false);
  };

  const handleTouchMove = (e, message) => {
    if (!touchStartX) return;
    const diff = e.touches[0].clientX - touchStartX;
    const isOwn = message.senderId === authUser._id;
    if (isOwn && diff < 0) setSwipeX(Math.max(diff, -65));
    else if (!isOwn && diff > 0) setSwipeX(Math.min(diff, 65));
  };

  const handleTouchEnd = (message) => {
    if (Math.abs(swipeX) >= 50 && !swipeTriggered) {
      setSwipeTriggered(true);
      setReplyToMessage(message);
    }
    setSwipeX(0);
    setSwipingId(null);
    setTouchStartX(null);
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

      <div className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
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

          const nextMessage = messages[index + 1];
          const isLastInGroup =
            !nextMessage || nextMessage.senderId !== message.senderId;
          const prevMessage = messages[index - 1];
          const isFirstInGroup =
            !prevMessage || prevMessage.senderId !== message.senderId;

          return (
            <div
              key={message._id}
              className={`flex flex-col ${isFirstInGroup ? "mt-3" : "mt-0.5"}`}
              ref={isLast ? messageRef : null}
            >
              <div
                className={`flex items-end w-full ${isOwn ? "justify-end" : "justify-start"}`}
                onMouseEnter={() => handleMouseEnter(message._id)}
                onMouseLeave={handleMouseLeave}
                onTouchStart={(e) => handleTouchStart(e, message)}
                onTouchMove={(e) => handleTouchMove(e, message)}
                onTouchEnd={() => handleTouchEnd(message)}
              >
                {/* Avatar — received only, last in group */}
                {!isOwn && (
                  <div className="relative shrink-0 mr-2 self-end">
                    {isLastInGroup ? (
                      <img
                        src={selectedUser.profilePic || "/avatar.png"}
                        alt="profile pic"
                        className="size-8 rounded-full border object-cover"
                      />
                    ) : (
                      <div className="size-8" />
                    )}
                  </div>
                )}

                {/* Swipe container */}
                <div
                  className={`flex items-center gap-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                  style={{
                    transform: isSwiping
                      ? `translateX(${swipeX}px)`
                      : "translateX(0)",
                    transition: isSwiping ? "none" : "transform 0.25s ease",
                  }}
                >
                  {isSwiping && Math.abs(swipeX) > 20 && (
                    <div className={`${isOwn ? "ml-1" : "mr-1"}`}>
                      <Reply size={18} className="text-primary" />
                    </div>
                  )}

                  {/* Bubble — wider */}
                  <div
                    className={`flex flex-col max-w-[100%] md:max-w-[100%] ${isOwn ? "items-end" : "items-start"}`}
                  >
                    <div className="relative overflow-visible">
                      {/* Quoted reply */}
                      {message.replyTo && (
                        <div
                          className={`mb-0.8 px-3 py-2 rounded-xl text-xs border-l-[3px] border-primary/80
                          ${isOwn ? "bg-primary/10" : "bg-base-300/80"}`}
                        >
                          <p className="text-primary font-semibold text-[11px] mb-0.8">
                            {message.replyTo.senderId === authUser._id
                              ? "You"
                              : selectedUser.fullName}
                          </p>
                          <p className="opacity-60 truncate max-w-full text-[11px]">
                            {message.replyTo.audio
                              ? "🎤 Voice message"
                              : message.replyTo.image && !message.replyTo.text
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
                          className="max-w-full rounded-xl mb-1 object-cover"
                        />
                      )}

                      {/* Audio */}
                      {message.audio && (
                        <div
                          className={`flex items-center gap-2 px-3 py-2 rounded-2xl
                          ${isOwn ? "bg-primary text-primary-content" : "bg-base-300"}`}
                        >
                          <Mic size={16} className="shrink-0" />
                          <audio
                            src={message.audio}
                            controls
                            className="h-8 max-w-full"
                          />
                        </div>
                      )}

                      {/* Text bubble */}
                      {!isEditing && message.text && (
                        <div
                          className={`px-4 py-2 text-sm break-words leading-relaxed
                          ${
                            message.replyTo
                              ? "rounded-b-2xl rounded-tr-2xl rounded-tl-sm"
                              : "rounded-2xl"
                          }
                          ${
                            isOwn
                              ? `bg-primary text-primary-content ${!message.replyTo ? "rounded-br-none" : ""}`
                              : `bg-base-300 text-base-content ${!message.replyTo ? "rounded-bl-none" : ""}`
                          }`}
                        >
                          {message.text}
                        </div>
                      )}

                      {/* Edit mode */}
                      {isEditing && (
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
                      )}

                      {/* Hover action buttons */}
                      {hoveredMessage === message._id && !isEditing && (
                        <div
                          className={`absolute bottom-full mb-1 flex gap-1 z-20 ${isOwn ? "right-0" : "left-0"}`}
                          onMouseEnter={() => handleMouseEnter(message._id)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <button
                            onClick={() => setReplyToMessage(message)}
                            className="bg-base-200 hover:bg-primary hover:text-white text-zinc-400 
                            rounded-full p-1.5 transition-all shadow-lg border border-base-300"
                            title="Reply"
                          >
                            <Reply size={13} />
                          </button>
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
                                  className="bg-base-200 hover:bg-blue-500 hover:text-white text-zinc-400 
                                  rounded-full p-1.5 transition-all shadow-lg border border-base-300"
                                  title="Edit"
                                >
                                  <Pencil size={13} />
                                </button>
                              )}
                              <button
                                onClick={() => deleteMessage(message._id)}
                                className="bg-base-200 hover:bg-red-500 hover:text-white text-zinc-400 
                                rounded-full p-1.5 transition-all shadow-lg border border-base-300"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Time + edited + new */}
                    <div className="flex items-center gap-1 mt-0.5 px-1">
                      <time className="text-xs opacity-30">
                        {formatMessageTime(message.createdAt)}
                      </time>
                      {message.isEdited && (
                        <span className="text-xs opacity-30 italic">
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
