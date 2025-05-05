import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  console.log("Register request body:", req.body);
  try {
    const { email, password, name } = req.body;
    const result = await authService.registerUser(name, email, password);

    res.status(201).json({
      message: "User created successfully",
      token: result.token,
      user: result.user,
    });
  } catch (error: any) {
    console.error("Register error:", error);
    if (error.message === "User already exists with this email") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);

    res.json({
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    if (error.message === "Invalid credentials") {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.status(500).json({ message: "Server error during login" });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await authService.getUserProfile(req.user.userId);
    res.json(user);
  } catch (error: any) {
    console.error("Profile error:", error);
    if (error.message === "User not found") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Server error while fetching profile" });
  }
};
