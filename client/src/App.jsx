import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Topbar from "./components/Topbar";
import AuthGuard from "./components/AuthGuard";
import FeedPage from "./pages/FeedPage";
import SignupPage from "./pages/SignupPage";
import SigninPage from "./pages/SigninPage";
import ArticlePage from "./pages/ArticlePage";
import NewArticlePage from "./pages/NewArticlePage";
import EditArticlePage from "./pages/EditArticlePage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f5f3ef] text-stone-900">
        <Topbar />
        <Routes>
          <Route path="/" element={<FeedPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="/login" element={<SigninPage />} />
          <Route path="/posts/:id" element={<ArticlePage />} />
          <Route
            path="/create"
            element={
              <AuthGuard>
                <NewArticlePage />
              </AuthGuard>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <AuthGuard>
                <EditArticlePage />
              </AuthGuard>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}