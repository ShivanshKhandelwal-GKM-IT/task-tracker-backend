import * as authService from "../services/auth-service.js";
import validator from "validator";

function isValidEmail(email) {
  return validator.isEmail(email);
}

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function register(req, res) {
  try {
    const { email, password, name } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    
    const { user, token } = await authService.registerUser(email, password, name);

    setAuthCookie(res, token);
    
    res.status(201).json({ user });
  } catch (error) {
    if (error.message === "Email already exists") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Server error during registration" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const { user, token } = await authService.loginUser(email, password);

    setAuthCookie(res, token);

    res.json({ user });
  } catch (error) {
    if (error.message === "Invalid credentials") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error during login" });
  }
}

export function me(req, res) {
  res.json({ user: req.user });
}

export function logout(req, res) {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    expires: new Date(0)
  });
  res.json({ message: "Logged out successfully" });
}