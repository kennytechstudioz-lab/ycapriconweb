import { create } from "zustand";
import { apiCall } from "@/lib/apiClient";
import { io, Socket } from "socket.io-client";

export interface NotificationItem {
  _id: string;
  username: string;
  notificationName: string;
  notificationTitle: string;
  content: string;
  isRead: boolean;
  isAdminRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  socket: Socket | null;

  // Computes active unread alerts
  getUnreadCount: (isAdmin: boolean) => number;
  getUnreadBadge: (isAdmin: boolean) => string;

  // Real-time socket lifecycles
  connectSocket: (username: string) => void;
  disconnectSocket: () => void;
  addNotification: (notification: NotificationItem) => void;

  // DB interactions
  fetchNotifications: (username: string, page?: number) => Promise<{ success: boolean }>;
  markAsRead: (id: string, username: string) => Promise<{ success: boolean }>;
  markAllAsRead: (username: string) => Promise<{ success: boolean }>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  totalPages: 1,
  currentPage: 1,
  isLoading: false,
  error: null,
  socket: null,

  getUnreadCount: (isAdmin: boolean) => {
    return get().notifications.filter((n) => 
      isAdmin ? !n.isAdminRead : !n.isRead
    ).length;
  },

  getUnreadBadge: (isAdmin: boolean) => {
    const count = get().getUnreadCount(isAdmin);
    if (count === 0) return "";
    return count > 9 ? "9+" : count.toString();
  },

  connectSocket: (username: string) => {
    const currentSocket = get().socket;
    if (currentSocket) return; // Discard redundant connects

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";
    const newSocket = io(socketUrl);

    newSocket.on("connect", () => {
      console.log(`[Socket] Connected to messaging server: ${newSocket.id}`);
      newSocket.emit("join", username);
    });

    // Re-join room after automatic reconnection so the user stays in their channel
    newSocket.on("reconnect", () => {
      console.log(`[Socket] Reconnected — rejoining channel for ${username}`);
      newSocket.emit("join", username);
    });

    newSocket.on("notification", (data: NotificationItem) => {
      console.log(`[Socket] New real-time notification streamed:`, data);
      get().addNotification(data);
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
      console.log(`[Socket] Cleanly disconnected from messaging server.`);
    }
  },

  addNotification: (notification) => {
    set((state) => {
      // Prevent duplicates if already fetched via REST edge case
      const exists = state.notifications.some((n) => n._id === notification._id);
      if (exists) return state;

      return {
        // Unshift to place newest on top
        notifications: [notification, ...state.notifications],
      };
    });
  },

  fetchNotifications: async (username: string, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiCall<{
        success: boolean;
        notifications: NotificationItem[];
        totalPages: number;
        page: number;
      }>(`/api/notifications?username=${username}&page=${page}&limit=20`);
      set({
        notifications: response.notifications || [],
        totalPages: response.totalPages || 1,
        currentPage: response.page || page,
        isLoading: false,
      });
      return { success: true };
    } catch (err: any) {
      const msg = err.message || "Failed to retrieve notifications.";
      set({ error: msg, isLoading: false });
      return { success: false };
    }
  },

  markAsRead: async (id: string, username: string) => {
    try {
      await apiCall<{ success: boolean }>(`/api/notifications/${id}/read`, {
        method: "PATCH",
        body: { username },
      });
      
      // Optimistic cache update
      const isAdmin = username.toLowerCase() === "admin";
      set((state) => ({
        notifications: state.notifications.map((n) => {
          if (n._id === id) {
            return { 
              ...n, 
              isRead: !isAdmin ? true : n.isRead, 
              isAdminRead: isAdmin ? true : n.isAdminRead 
            };
          }
          return n;
        }),
      }));

      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false };
    }
  },

  markAllAsRead: async (username: string) => {
    try {
      await apiCall<{ success: boolean }>(`/api/notifications/read-all`, {
        method: "PATCH",
        body: { username },
      });

      const isAdmin = username.toLowerCase() === "admin";
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          isRead: !isAdmin ? true : n.isRead,
          isAdminRead: isAdmin ? true : n.isAdminRead,
        })),
      }));

      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false };
    }
  },
}));
