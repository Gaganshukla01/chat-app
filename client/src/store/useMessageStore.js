import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useMessageStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  unreadCounts: {},

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      set({
        messages: res.data,
        // clear unread when chat opened
        unreadCounts: { ...get().unreadCounts, [userId]: 0 },
      });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/message/send/${selectedUser._id}`,
        messageData,
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/message/${messageId}`);
      set((state) => ({
        messages: state.messages.filter((m) => m._id !== messageId),
      }));
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  },

  updateMessage: async (messageId, newText) => {
    try {
      const res = await axiosInstance.put(`/message/${messageId}`, {
        text: newText,
      });
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === messageId ? res.data : m,
        ),
      }));
      toast.success("Message updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update");
    }
  },

  subscribeToMessage: () => {
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, unreadCounts, messages } = get();

      // chat is open with this sender → show message directly
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        set({ messages: [...messages, { ...newMessage, isNew: true }] });
      } else {
        // chat not open → increment unread count
        set({
          unreadCounts: {
            ...unreadCounts,
            [newMessage.senderId]: (unreadCounts[newMessage.senderId] || 0) + 1,
          },
        });
      }
    });

    socket.on("messageDeleted", (messageId) => {
      set((state) => ({
        messages: state.messages.filter((m) => m._id !== messageId),
      }));
    });

    socket.on("messageUpdated", (updatedMessage) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === updatedMessage._id ? updatedMessage : m,
        ),
      }));
    });
  },

  unSubscribeFromMessage: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageDeleted");
    socket.off("messageUpdated");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
