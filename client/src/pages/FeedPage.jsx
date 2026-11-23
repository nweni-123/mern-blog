import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePostStore } from "../store/postStore";

const API_ORIGIN = "http://localhost:5000";

const getThumbnailUrl = (thumbnail) => {
  if (!thumbnail) return null;
  if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) {
    return thumbnail;
  }
  return `${API_ORIGIN}/uploads/${thumbnail}`;
};

export default function FeedPage() {
  const { articles, fetching, errorMsg, loadArticles } = usePostStore();
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const visiblePosts = articles.filter((post) => {
    const q = keyword.toLowerCase();
    return (
      (post.title || "").toLowerCase().includes(q) ||
      (post.category || "").toLowerCase().includes(q) ||
      (post.authorName || "").toLowerCase().includes(q)
    );
  });

  if (fetching) {
    return (
      <p className="text-center py-16 text-stone-500">
        Posts များ ဆွဲယူနေပါသည်...
      </p>
    );
  }

  if (errorMsg) {
    return <p className="text-center py-16 text-rose-600">{errorMsg}</p>;
  }

  return (
    <main className="max-w-6xl mx-auto px-5 py-10">
      <section className="bg-gradient-to-r from-teal-900 to-teal-800 text-stone-100 rounded-3xl p-7 mb-9 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-teal-300 font-semibold mb-1">
            Community Journal
          </p>
          <h1 className="text-3xl font-bold">Stories & Notes</h1>
          <p className="text-sm text-teal-100/80 mt-1">
            စိတ်ဝင်စားဖွယ် Blog Post များကို ဖတ်ရှုနိုင်ပြီး ကိုယ်ပိုင် Post များလည်း ရေးသားနိုင်ပါသည်
          </p>
        </div>

        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="ရှာဖွေရန် (title, category, author)..."
          className="w-full md:w-72 bg-teal-950/70 text-stone-100 placeholder:text-teal-200/50 border border-teal-600/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-300"
        />
      </section>

      {visiblePosts.length === 0 ? (
        <div className="bg-stone-100 border border-stone-200 rounded-2xl p-10 text-center text-stone-500">
          ပြသရန် Post မရှိသေးပါ။
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePosts.map((post) => {
            const thumbnailUrl = getThumbnailUrl(post.thumbnail);
            const postBody = post.content ?? post.description ?? "";

            return (
              <article
                key={post._id}
                className="bg-stone-50 border border-stone-200/90 rounded-2xl p-6 hover:border-teal-500/60 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-3 py-1 rounded-full">
                      {post.category || "General"}
                    </span>
                    <span className="text-xs text-stone-400">
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleDateString()
                        : ""}
                    </span>
                  </div>

                  {thumbnailUrl && (
                    <div className="mb-4 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                      <img
                        src={thumbnailUrl}
                        alt={post.title}
                        className="w-full h-44 object-cover"
                        onError={(e) => {
                          e.currentTarget.parentElement.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <h2 className="text-lg font-bold text-stone-900 mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-stone-600 line-clamp-3 mb-5">
                    {postBody}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-200/80 flex items-center justify-between text-xs">
                  <span className="text-stone-500 font-medium">
                    {post.authorName || "Unknown"}
                  </span>
                  <Link
                    to={`/posts/${post._id}`}
                    className="text-teal-700 font-bold hover:text-teal-900"
                  >
                    ဆက်ဖတ်ရန် →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}