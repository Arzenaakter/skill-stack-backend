import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already exists" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashPassword });
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Register failed", error: error });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      console.log("JWT_SECRET environment variable is not defined");
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    console.log("token", token);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error });
  }
};
