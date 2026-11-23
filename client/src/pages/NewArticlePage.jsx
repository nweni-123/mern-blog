import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePostStore } from "../store/postStore";

export default function NewArticlePage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const { addArticle, fetching, errorMsg } = usePostStore();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("content", content);
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    const created = await addArticle(formData);
    if (created) {
      const postId = created._id || created.id || created.post?._id;
      navigate(postId ? `/posts/${postId}` : "/");
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-5 py-10">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Write New Post</h1>

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
            Thumbnail Image
          </label>
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
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

        <button
          type="submit"
          disabled={fetching}
          className="bg-teal-700 hover:bg-teal-600 text-white font-semibold px-6 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-60"
        >
          {fetching ? "တင်နေပါသည်..." : "Publish"}
        </button>
      </form>
    </main>
  );
}