import React, { useEffect, useState } from "react";
import { useMessageStore } from "../store/useMessageStore";
import { Users } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./Skeleton/SidebarSkeleton";

const Sidebar = () => {
  const { isUsersLoading, setSelectedUser, selectedUser, users, getUsers } =
    useMessageStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full md:w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Header */}
      <div className="border-b border-base-300 w-full p-4">
        <div className="flex items-center gap-2">
          <Users className="size-6 shrink-0" />
          {/* Show "Contacts" on mobile and lg screens, hide on md */}
          <span className="font-medium md:hidden lg:block">Contacts</span>
        </div>

        {/* Online filter — show on mobile and lg, hide on md */}
        <div className="mt-3 flex md:hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
      </div>

      {/* User list */}
      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-base-100" />
              )}
            </div>

            {/* Name + status — show on mobile and lg, hide on md */}
            <div className="md:hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div
                className={`text-sm ${onlineUsers.includes(user._id) ? "text-green-500" : "text-zinc-400"}`}
              >
                {onlineUsers.includes(user._id) ? "● Online" : "○ Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No users found</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
