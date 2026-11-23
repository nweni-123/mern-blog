const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const User = require("../models/userModel");
const HttpError = require("../models/errorModel");

// =================== REGISTER A NEW USER
// POST : /api/users/register
// UNPROTECTED
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, password2 } = req.body;
    if (!name || !email || !password) {
      return next(new HttpError("Fill in all fields.", 422));
    }

    const cleanName = name.trim();
    const newEmail = email.trim().toLowerCase();

    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return next(new HttpError("Email already exists.", 422));
    }

    if (password.trim().length < 6) {
      return next(
        new HttpError("Password should be at least 6 characters.", 422)
      );
    }

    if (typeof password2 === "string" && password2.length > 0 && password !== password2) {
      return next(new HttpError("Passwords do not match.", 422));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: cleanName,
      email: newEmail,
      password: hashedPass,
    });

    res.status(201).json({
      message: `New user ${newUser.email} registered.`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR DETAILS:", error);
    return next(new HttpError("User registration failed.", 422));
  }
};

// =================== LOGIN A REGISTERED USER
// POST : /api/users/login
// UNPROTECTED
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new HttpError("Fill in all fields.", 422));
    }

    const newEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: newEmail });
    if (!user) {
      return next(new HttpError("Invalid credentials.", 422));
    }

    const comparePass = await bcrypt.compare(password, user.password);
    if (!comparePass) {
      return next(new HttpError("Invalid credentials.", 422));
    }

    const { _id: id, name } = user;
    const token = jwt.sign({ id, name }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      token,
      id,
      name,
      user: {
        id,
        name,
        email: user.email,
        avatar: user.avatar || null,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR DETAILS:", error);
    return next(
      new HttpError("Login failed. Please check your credentials.", 422)
    );
  }
};

// =================== USER PROFILE
// GET : /api/users/:id
// UNPROTECTED
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return next(new HttpError("User not found", 404));
    }
    res.status(200).json(user);
  } catch (error) {
    return next(new HttpError(error.message || "Failed to fetch user", 400));
  }
};

// =================== CHANGE USER AVATAR (profile picture)
// POST : /api/users/change-avatar
// PROTECTED
const changeAvatar = async (req, res, next) => {
  try {
    if (!req.files || !req.files.avatar) {
      return next(new HttpError("Please choose an image.", 422));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new HttpError("User not found.", 404));
    }

    if (user.avatar) {
      fs.unlink(
        path.join(__dirname, "..", "uploads", user.avatar),
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    }

    const { avatar } = req.files;
    if (avatar.size > 500000) {
      return next(
        new HttpError(
          "Profile picture too big. Should be less than 500kb",
          422
        )
      );
    }

    const fileName = avatar.name;
    const splittedFilename = fileName.split(".");
    const ext = splittedFilename[splittedFilename.length - 1];
    const baseName = splittedFilename.slice(0, -1).join(".");
    const newFilename = `${baseName}-${uuid()}.${ext}`;

    avatar.mv(
      path.join(__dirname, "..", "uploads", newFilename),
      async (err) => {
        if (err) {
          return next(new HttpError(err.message || "File upload failed", 500));
        }

        const updatedAvatar = await User.findByIdAndUpdate(
          req.user.id,
          { avatar: newFilename },
          { new: true }
        ).select("-password");

        if (!updatedAvatar) {
          return next(new HttpError("Avatar couldn't be changed.", 422));
        }
        res.status(200).json(updatedAvatar);
      }
    );
  } catch (error) {
    return next(new HttpError(error.message || "Avatar update failed", 500));
  }
};

// =================== EDIT USER DETAILS (from profile)
// PATCH : /api/users/edit-user
// PROTECTED
const editUser = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword, confirmNewPassword } =
      req.body;
    if (!name || !email || !currentPassword) {
      return next(new HttpError("Fill in all required fields.", 422));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new HttpError("User not found.", 404));
    }

    const newEmail = email.trim().toLowerCase();
    const emailExist = await User.findOne({ email: newEmail });
    if (emailExist && emailExist._id.toString() !== req.user.id.toString()) {
      return next(new HttpError("Email already exists.", 422));
    }

    const validateUserPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!validateUserPassword) {
      return next(new HttpError("Invalid current password", 422));
    }

    const updateFields = {
      name: name.trim(),
      email: newEmail,
    };

    if (newPassword) {
      if (newPassword.trim().length < 6) {
        return next(
          new HttpError("New password should be at least 6 characters.", 422)
        );
      }
      if (newPassword !== confirmNewPassword) {
        return next(new HttpError("New passwords do not match.", 422));
      }
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateFields, {
      new: true,
    }).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    return next(new HttpError(error.message || "User update failed", 500));
  }
};

// =================== GET AUTHORS
// GET : /api/users
// UNPROTECTED
const getAuthors = async (req, res, next) => {
  try {
    const authors = await User.find().select("-password");
    res.status(200).json(authors);
  } catch (error) {
    return next(new HttpError(error.message || "Failed to fetch authors", 500));
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  changeAvatar,
  editUser,
  getAuthors,
};