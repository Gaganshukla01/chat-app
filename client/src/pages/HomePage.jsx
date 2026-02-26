import React from "react";
import { useMessageStore } from "../store/useMessageStore";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";

const HomePage = () => {
  const { selectedUser } = useMessageStore();

  return (
    <div className="bg-base-200" style={{ height: "100dvh" }}>
      <div className="flex items-center justify-center pt-16 h-full px-4">
        <div
          className="bg-base-100 rounded-lg shadow-xl w-full max-w-6xl"
          style={{ height: "calc(100dvh - 5rem)" }}
        >
          <div className="flex h-full rounded-lg overflow-hidden">
            {/* Sidebar — full screen on mobile when no user selected */}
            <div
              className={`
              ${selectedUser ? "hidden md:flex" : "flex w-full md:w-auto"}
            `}
            >
              <Sidebar />
            </div>

            {/* Chat area — full screen on mobile when user selected */}
            <div
              className={`
              flex-1
              ${selectedUser ? "flex" : "hidden md:flex"}
            `}
            >
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
