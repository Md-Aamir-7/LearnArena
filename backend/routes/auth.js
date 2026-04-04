import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { check, validationResult } from "express-validator";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) => {
  const payload = { userId: user._id, role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET || "secret", {
    expiresIn: "1d",
  });
};

// Register a new user
router.post(
  "/register",
  [
    check("username", "Username is required (min 3 chars)").isLength({ min: 3 }),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, email, password } = req.body;

      // Check if user exists
      let user = await User.findOne({ $or: [{ email }, { username }] });
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      user = new User({
        username,
        email,
        password: hashedPassword,
      });

      await user.save();

      const token = generateToken(user);

      res.status(201).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          level: user.level,
          xp: user.xp,
          role: user.role,
          avatar: user.avatar,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// Login user
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Check user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Check if it's a google user without password
      if (!user.password && user.googleId) {
        return res.status(400).json({ message: "This account is linked with Google. Please login using Google." });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user);

      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          level: user.level,
          xp: user.xp,
          role: user.role,
          avatar: user.avatar,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// Google Auth
router.post("/google-login", async (req, res) => {
  try {
    const { tokenId } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture, sub } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (user) {
      // If user exists, update googleId if not present
      if (!user.googleId) {
        user.googleId = sub;
        if (!user.avatar) user.avatar = picture;
        await user.save();
      }
    } else {
      // Create new user
      const username = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
      user = new User({
        username,
        email,
        googleId: sub,
        avatar: picture,
      });
      await user.save();
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        xp: user.xp,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Google Authentication failed" });
  }
});

// Get current user details
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;
