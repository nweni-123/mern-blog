import React, { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { usePostStore } from "../store/postStore";

const API_ORIGIN = "http://localhost:5000";

const getThumbnailUrl = (thumbnail) => {
  if (!thumbnail) return null;
  if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) {
    return thumbnail;
  }
  return `${API_ORIGIN}/uploads/${thumbnail}`;
};

export default function ArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    activeArticle,
    fetching,
    errorMsg,
    loadArticleById,
    removeArticle,
  } = usePostStore();

  useEffect(() => {
    loadArticleById(id);
  }, [id, loadArticleById]);

  const handleDelete = async () => {
    const ok = await removeArticle(id);
    if (ok) navigate("/");
  };

  if (fetching) {
    return (
      <p className="text-center py-16 text-stone-500">
        ဖတ်ရှုရန် ပြင်ဆင်နေပါသည်...
      </p>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-14 text-center">
        <p className="text-rose-600 mb-4">{errorMsg}</p>
        <Link to="/" className="text-teal-700 font-semibold hover:underline">
          ← Posts စာမျက်နှာသို့
        </Link>
      </div>
    );
  }

  if (!activeArticle) return null;

  const currentUserId = user?._id || user?.id;
  const articleOwnerId =
    activeArticle.author?._id ||
    activeArticle.author?.id ||
    activeArticle.author ||
    activeArticle.creator?._id ||
    activeArticle.creator?.id ||
    activeArticle.creator;

  const isOwner =
    Boolean(currentUserId && articleOwnerId) &&
    String(currentUserId) === String(articleOwnerId);

  const authorDisplayName =
    activeArticle.authorName ||
    activeArticle.author?.name ||
    activeArticle.creator?.name ||
    (typeof activeArticle.author === "string" ? activeArticle.author : "") ||
    "Unknown";

  const articleBody =
    activeArticle.content ?? activeArticle.description ?? "";

  const articleId = activeArticle._id || activeArticle.id || id;
  const thumbnailUrl = getThumbnailUrl(activeArticle.thumbnail);

  return (
    <main className="max-w-3xl mx-auto px-5 py-10">
      <Link
        to="/"
        className="text-sm text-stone-500 hover:text-teal-800 inline-block mb-5"
      >
        ← Back to Posts
      </Link>

      <article className="bg-stone-50 border border-stone-200 rounded-3xl p-8">
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-3 py-1 rounded-full">
            {activeArticle.category || "General"}
          </span>
          <span className="text-xs text-stone-400">
            {activeArticle.createdAt
              ? new Date(activeArticle.createdAt).toLocaleString()
              : ""}
          </span>
        </div>

        {thumbnailUrl && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
            <img
              src={thumbnailUrl}
              alt={activeArticle.title}
              className="w-full max-h-96 object-cover"
              onError={(e) => {
                e.currentTarget.parentElement.style.display = "none";
              }}
            />
          </div>
        )}

        <h1 className="text-3xl font-bold text-stone-900 mb-2">
          {activeArticle.title}
        </h1>
        <p className="text-xs text-stone-500 pb-6 mb-6 border-b border-stone-200">
          Author:{" "}
          <span className="font-semibold text-stone-700">
            {authorDisplayName}
          </span>
        </p>

        <div className="text-stone-700 leading-relaxed whitespace-pre-line mb-8">
          {articleBody}
        </div>

        {isOwner && (
          <div className="pt-6 border-t border-stone-200 flex items-center gap-3">
            <Link
              to={`/edit/${articleId}`}
              className="bg-teal-700 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Delete
            </button>
          </div>
        )}
      </article>
    </main>
  );
}