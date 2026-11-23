import { create } from "zustand";
import http from "../api/http";

const rawUser = localStorage.getItem("user");

export const useAuthStore = create((set) => ({
  user: rawUser ? JSON.parse(rawUser) : null,
  token: localStorage.getItem("token") || null,
  submitting: false,
  errorMsg: null,

  resetError: () => set({ errorMsg: null }),

  signup: async (payload) => {
    set({ submitting: true, errorMsg: null });
    try {
      const { data } = await http.post("/users/register", payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, submitting: false });
      return true;
    } catch (err) {
      set({
        errorMsg:
          err.response?.data?.message ||
          "အကောင့်ဖွင့်ရာတွင် အခက်အခဲရှိနေပါသည်",
        submitting: false,
      });
      return false;
    }
  },

  signin: async (payload) => {
    set({ submitting: true, errorMsg: null });
    try {
      const { data } = await http.post("/users/login", payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, submitting: false });
      return true;
    } catch (err) {
      set({
        errorMsg:
          err.response?.data?.message ||
          "Email သို့မဟုတ် Password မှားယွင်းနေပါသည်",
        submitting: false,
      });
      return false;
    }
  },

  signout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, errorMsg: null });
  },
}));