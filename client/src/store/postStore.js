import { create } from "zustand";
import http from "../api/http";

const getAuthHeaders = (isFormData = false) => {
  const token = localStorage.getItem("token");
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (isFormData) {
    headers["Content-Type"] = "multipart/form-data";
  }
  return headers;
};

const extractErrorMessage = (err, fallback) => {
  return (
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message ||
    fallback
  );
};

export const usePostStore = create((set) => ({
  articles: [],
  activeArticle: null,
  fetching: false,
  errorMsg: null,

  loadArticles: async () => {
    set({ fetching: true, errorMsg: null });
    try {
      const { data } = await http.get("/posts");
      const list = Array.isArray(data)
        ? data
        : data.posts || data.articles || [];
      set({ articles: list, fetching: false });
    } catch (err) {
      set({
        errorMsg: extractErrorMessage(err, "Post များ ယူ၍မရပါ"),
        fetching: false,
      });
    }
  },

  loadArticleById: async (id) => {
    set({ fetching: true, errorMsg: null, activeArticle: null });
    try {
      const { data } = await http.get(`/posts/${id}`);
      const article = data.post || data;
      set({ activeArticle: article, fetching: false });
    } catch (err) {
      set({
        errorMsg: extractErrorMessage(err, "Post ရှာမတွေ့ပါ"),
        fetching: false,
      });
    }
  },

  addArticle: async (payload) => {
    set({ fetching: true, errorMsg: null });
    try {
      const isFormData = payload instanceof FormData;
      const { data } = await http.post("/posts", payload, {
        headers: getAuthHeaders(isFormData),
      });
      const created = data.post || data;
      set((state) => ({
        articles: [created, ...state.articles],
        fetching: false,
      }));
      return created;
    } catch (err) {
      set({
        errorMsg: extractErrorMessage(err, "Post အသစ်တင်၍မရပါ"),
        fetching: false,
      });
      return null;
    }
  },

  editArticle: async (id, payload) => {
    set({ fetching: true, errorMsg: null });
    try {
      const isFormData = payload instanceof FormData;
      const { data } = await http.patch(`/posts/${id}`, payload, {
        headers: getAuthHeaders(isFormData),
      });
      const updated = data.post || data;
      set((state) => ({
        articles: state.articles.map((item) =>
          item._id === id || item.id === id ? updated : item
        ),
        activeArticle: updated,
        fetching: false,
      }));
      return true;
    } catch (err) {
      set({
        errorMsg: extractErrorMessage(err, "Post ပြင်ဆင်၍မရပါ"),
        fetching: false,
      });
      return false;
    }
  },

  removeArticle: async (id) => {
    set({ fetching: true, errorMsg: null });
    try {
      await http.delete(`/posts/${id}`, {
        headers: getAuthHeaders(false),
      });
      set((state) => ({
        articles: state.articles.filter(
          (item) => item._id !== id && item.id !== id
        ),
        activeArticle: null,
        fetching: false,
      }));
      return true;
    } catch (err) {
      set({
        errorMsg: extractErrorMessage(err, "Post ဖျက်၍မရပါ"),
        fetching: false,
      });
      return false;
    }
  },
}));