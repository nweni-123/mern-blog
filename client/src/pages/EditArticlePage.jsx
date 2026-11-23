import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePostStore } from "../store/postStore";

export default function EditArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeArticle, loadArticleById, editArticle, fetching, errorMsg } =
    usePostStore();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [content, setContent] = useState("");

  useEffect(() => {
    loadArticleById(id);
  }, [id, loadArticleById]);

  useEffect(() => {
    if (activeArticle) {
      setTitle(activeArticle.title || "");
      setCategory(activeArticle.category || "General");
      setContent(activeArticle.content || activeArticle.description || "");
    }
  }, [activeArticle]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const ok = await editArticle(id, {
      title,
      category,
      content,
      description: content,
    });
    if (ok) {
      navigate(`/posts/${id}`);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-5 py-10">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Edit Post</h1>

      {errorMsg && (
        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-2.5 rounded-xl">
          {errorMsg}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="bg-stone-50 border border-stone-200 rounded-3xl p-7 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-teal-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Category
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-teal-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Content
          </label>
          <textarea
            rows="7"
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-teal-600"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={fetching}
            className="bg-teal-700 hover:bg-teal-600 text-white font-semibold px-6 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-60"
          >
            {fetching ? "သိမ်းဆည်းနေပါသည်..." : "Update"}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/posts/${id}`)}
            className="border border-stone-300 text-stone-700 px-5 py-2.5 rounded-xl hover:bg-stone-100 transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}