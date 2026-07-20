import { create } from "zustand";
import { apiCall } from "@/lib/apiClient";

export interface BlogData {
  _id?: string;
  category: string;
  title: string;
  subtitle?: string;
  picture?: string;
  author: string;
  date: string;
  content: string;
  shortName?: string;
  abbreviation?: string;
  createdAt?: string;
}



interface BlogState {
  blogs: BlogData[];
  isLoading: boolean;
  error: string | null;
  fetchBlogs: () => Promise<void>;
  createBlog: (data: BlogData) => Promise<{ success: boolean; error?: string }>;
  updateBlog: (id: string, data: Partial<BlogData>) => Promise<{ success: boolean; error?: string }>;
  deleteBlog: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const useBlogStore = create<BlogState>((set, get) => ({
  blogs: [],
  isLoading: false,
  error: null,

  fetchBlogs: async () => {
    const currentBlogs = get().blogs;
    if (currentBlogs && currentBlogs.length > 0) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await apiCall<{ success: boolean; blogs: BlogData[] }>("/api/blogs");
      set({ blogs: res.blogs || [], isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Failed to load blogs." });
    }
  },


  createBlog: async (data) => {
    try {
      await apiCall("/api/blogs", { method: "POST", body: data });
      await get().fetchBlogs();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to create blog." };
    }
  },

  updateBlog: async (id, data) => {
    try {
      await apiCall(`/api/blogs/${id}`, { method: "PUT", body: data });
      await get().fetchBlogs();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to update blog." };
    }
  },

  deleteBlog: async (id) => {
    try {
      await apiCall(`/api/blogs/${id}`, { method: "DELETE" });
      set((s) => ({ blogs: s.blogs.filter((b) => b._id !== id) }));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to delete blog." };
    }
  },
}));
