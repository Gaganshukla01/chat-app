import React from "react";
import { useMessageStore } from "../store/useMessageStore";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import { Home } from "lucide-react";

const HomePage = () => {
  const { selectedUser } = useMessageStore();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-16 h-full px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-5rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
