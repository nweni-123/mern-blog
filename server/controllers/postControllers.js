const Post = require("../models/postModel");
const User = require("../models/userModel");
const path = require("path");
const fs = require("fs");
const { v4: uuid } = require("uuid");
const HttpError = require("../models/errorModel");

const formatPost = (postDoc) => {
  if (!postDoc) return postDoc;
  const obj = typeof postDoc.toObject === "function" ? postDoc.toObject() : postDoc;
  const creatorName =
    obj.creator && typeof obj.creator === "object" ? obj.creator.name : undefined;
  return {
    ...obj,
    authorName: obj.authorName || creatorName || "Unknown",
  };
};

// =================== CREATE A POST
// POST : /api/posts
// PROTECTED
const createPost = async (req, res, next) => {
  try {
    const { title, category, description, content } = req.body;
    const postDescription = description || content;

    if (!title || !category || !postDescription || !req.files || !req.files.thumbnail) {
      return next(
        new HttpError("Fill in all fields and choose thumbnail.", 422)
      );
    }

    const { thumbnail } = req.files;

    // Check the file size (less than 2MB)
    if (thumbnail.size > 2000000) {
      return next(
        new HttpError("Thumbnail too big. File should be less than 2mb.", 422)
      );
    }

    const fileName = thumbnail.name;
    const splittedFilename = fileName.split(".");
    const ext = splittedFilename.pop();
    const baseName = splittedFilename.join(".");
    const newFilename = `${baseName}-${uuid()}.${ext}`;

    const uploadDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    thumbnail.mv(path.join(uploadDir, newFilename), async (err) => {
      if (err) {
        return next(new HttpError(err.message || "File upload failed.", 500));
      }

      try {
        const newPost = await Post.create({
          title: title.trim(),
          category: category.trim(),
          description: postDescription,
          content: postDescription,
          thumbnail: newFilename,
          creator: req.user.id,
        });

        if (!newPost) {
          return next(new HttpError("Post couldn't be created.", 422));
        }

        const currentUser = await User.findById(req.user.id);
        if (currentUser) {
          const userPostCount = (currentUser.posts || 0) + 1;
          await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });
        }

        const populatedPost = await Post.findById(newPost._id).populate(
          "creator",
          "name"
        );
        res.status(201).json(formatPost(populatedPost || newPost));
      } catch (dbError) {
        return next(
          new HttpError(dbError.message || "Failed to save post.", 500)
        );
      }
    });
  } catch (error) {
    return next(new HttpError(error.message || "Create post failed.", 500));
  }
};

// =================== GET ALL POSTS
// GET : /api/posts
// UNPROTECTED
const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("creator", "name")
      .sort({ updatedAt: -1 });
    res.status(200).json(posts.map(formatPost));
  } catch (error) {
    return next(new HttpError(error.message || "Failed to fetch posts.", 500));
  }
};

// =================== GET SINGLE POST
// GET : /api/posts/:id
// UNPROTECTED
const getPost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId).populate("creator", "name");

    if (!post) {
      return next(new HttpError("Post not found.", 404));
    }

    res.status(200).json(formatPost(post));
  } catch (error) {
    return next(new HttpError(error.message || "Failed to fetch post.", 500));
  }
};

// =================== GET POSTS BY CATEGORY
// GET : /api/posts/categories/:category
// UNPROTECTED
const getCatPosts = async (req, res, next) => {
  try {
    const { category } = req.params;
    const catPosts = await Post.find({ category })
      .populate("creator", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(catPosts.map(formatPost));
  } catch (error) {
    return next(
      new HttpError(error.message || "Failed to fetch category posts.", 500)
    );
  }
};

// =================== GET USER/AUTHOR POSTS
// GET : /api/posts/users/:id
// UNPROTECTED
const getUserPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const posts = await Post.find({ creator: id })
      .populate("creator", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(posts.map(formatPost));
  } catch (error) {
    return next(
      new HttpError(error.message || "Failed to fetch user posts.", 500)
    );
  }
};

// =================== EDIT POST
// PATCH / PUT : /api/posts/:id
// PROTECTED
const editPost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const { title, category, description, content } = req.body;
    const postDescription = description || content;

    if (!title || !category || !postDescription || postDescription.trim().length < 12) {
      return next(
        new HttpError("Fill in all fields (description at least 12 characters).", 422)
      );
    }

    const oldPost = await Post.findById(postId);
    if (!oldPost) {
      return next(new HttpError("Post not found.", 404));
    }

    if (req.user.id.toString() !== oldPost.creator.toString()) {
      return next(new HttpError("Unauthorized", 403));
    }

    const uploadDir = path.join(__dirname, "..", "uploads");

    if (!req.files || !req.files.thumbnail) {
      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        {
          title: title.trim(),
          category: category.trim(),
          description: postDescription,
          content: postDescription,
        },
        { new: true }
      ).populate("creator", "name");

      if (!updatedPost) {
        return next(new HttpError("Post couldn't be updated.", 422));
      }

      return res.status(200).json(formatPost(updatedPost));
    }

    const { thumbnail } = req.files;
    if (thumbnail.size > 2000000) {
      return next(
        new HttpError("Thumbnail too big. File should be less than 2mb.", 422)
      );
    }

    const fileName = thumbnail.name;
    const splittedFilename = fileName.split(".");
    const ext = splittedFilename.pop();
    const baseName = splittedFilename.join(".");
    const newFilename = `${baseName}-${uuid()}.${ext}`;

    thumbnail.mv(path.join(uploadDir, newFilename), async (err) => {
      if (err) {
        return next(new HttpError(err.message || "File upload failed.", 500));
      }

      try {
        if (oldPost.thumbnail) {
          const oldThumbnailPath = path.join(uploadDir, oldPost.thumbnail);
          if (fs.existsSync(oldThumbnailPath)) {
            fs.unlinkSync(oldThumbnailPath);
          }
        }

        const updatedPost = await Post.findByIdAndUpdate(
          postId,
          {
            title: title.trim(),
            category: category.trim(),
            description: postDescription,
            content: postDescription,
            thumbnail: newFilename,
          },
          { new: true }
        ).populate("creator", "name");

        if (!updatedPost) {
          return next(new HttpError("Post couldn't be updated.", 422));
        }

        res.status(200).json(formatPost(updatedPost));
      } catch (dbError) {
        return next(
          new HttpError(dbError.message || "Failed to update post.", 500)
        );
      }
    });
  } catch (error) {
    return next(new HttpError(error.message || "Edit post failed.", 500));
  }
};

// =================== DELETE POST
// DELETE : /api/posts/:id
// PROTECTED
const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    if (!postId) {
      return next(new HttpError("Post unavailable.", 400));
    }

    const post = await Post.findById(postId);
    if (!post) {
      return next(new HttpError("Post not found.", 404));
    }

    if (req.user.id.toString() !== post.creator.toString()) {
      return next(new HttpError("Unauthorized", 403));
    }

    const fileName = post.thumbnail;
    if (fileName) {
      const filePath = path.join(__dirname, "..", "uploads", fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Post.findByIdAndDelete(postId);

    const currentUser = await User.findById(req.user.id);
    if (currentUser) {
      const userPostCount = currentUser.posts > 0 ? currentUser.posts - 1 : 0;
      await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });
    }

    res.status(200).json({ message: `Post ${postId} deleted successfully.` });
  } catch (error) {
    return next(new HttpError(error.message || "Delete post failed.", 500));
  }
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  getCatPosts,
  getUserPosts,
  editPost,
  deletePost,
};