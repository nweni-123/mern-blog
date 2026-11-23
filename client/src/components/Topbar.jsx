import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Topbar() {
  const { user, signout } = useAuthStore();
  const navigate = useNavigate();

  const handleSignout = () => {
    signout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-10 bg-teal-950 text-stone-100 border-b border-teal-800/70">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-teal-300">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" />
          <span>InkWell</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-stone-200 hover:text-teal-300 transition">
            Posts
          </Link>

          {user ? (
            <>
              <Link
                to="/create"
                className="bg-teal-500 hover:bg-teal-400 text-teal-950 font-semibold px-3.5 py-1.5 rounded-full transition"
              >
                + Post
              </Link>
              <span className="text-teal-200/80 hidden sm:inline">{user.username}</span>
              <button
                onClick={handleSignout}
                className="text-stone-300 hover:text-rose-300 transition cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-stone-200 hover:text-teal-300 transition">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-teal-600 hover:bg-teal-500 text-white font-medium px-3.5 py-1.5 rounded-full transition"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
