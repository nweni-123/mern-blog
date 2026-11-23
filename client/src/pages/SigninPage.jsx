import React from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function SigninPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { signin, submitting, errorMsg, resetError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    resetError();
  }, [resetError]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const ok = await signin(form);
    if (ok) navigate("/");
  };

  return (
    <main className="max-w-md mx-auto px-5 py-14">
      <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8 shadow-xs">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Login</h1>
        <p className="text-sm text-stone-500 mb-6">သင့်အကောင့်ဖြင့် ဝင်ရောက်ပါ</p>

        {errorMsg && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-2.5 rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-teal-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-teal-600"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-teal-700 hover:bg-teal-600 text-white font-semibold py-2.5 rounded-xl transition cursor-pointer disabled:opacity-60"
          >
            {submitting ? "ဝင်နေပါသည်..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-stone-600 mt-6 text-center">
          အကောင့်မရှိသေးဘူးလား?{" "}
          <Link to="/register" className="text-teal-700 font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
