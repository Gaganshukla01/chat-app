import React, { useRef } from "react";
import { useMessageStore } from "../store/useMessageStore";
import { useEffect } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./Skeleton/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const { getMessages, isMessagesLoading, selectedUser, messages 
    , subscribeToMessage , unSubscribeFromMessage} =
    useMessageStore();

  const { authUser } = useAuthStore();
  const messageRef=useRef(null)

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessage();

    return ()=>unSubscribeFromMessage()
     
  }, [selectedUser._id, getMessages,subscribeToMessage,unSubscribeFromMessage]);

  useEffect(()=>{
    if(messageRef.current && messages){
    messageRef.current.scrollIntoView({behaviour:"smooth"});
    }
  },[messages])

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex-col flex overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />

        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[450px]">
          {" "}
          {/* Set max height here */}
          {messages.map((message) => (
            <div
              key={message._id}
              className={`chat ${
                message.senderId === authUser._id ? "chat-end" : "chat-start"
              }`}

              ref={messageRef}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      message.senderId === authUser._id
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile pic"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className="chat-bubble flex flex-col">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.text && <p>{message.text}</p>}
              </div>
            </div>
          ))}
        </div>

        <MessageInput />
      </div>
    </>
  );
};

export default ChatContainer;
