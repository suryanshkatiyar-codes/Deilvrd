import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { config } from "../config/config.js";
import jwt from "jsonwebtoken";

export async function register(req, res) {
  try {
    const { username, email, password, role } = req.body;

    const userExits = await userModel.findOne({
      $or: [
        { username },
        { email }
      ]
    })

    if (userExits) {
      return res.status(400).json("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await userModel.create({
      username,
      email,
      password: hashedPassword,
      role,
    })

    return res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    return res.status(500).json({ message: "Server Error", err })
  }
}

export async function login(req, res) {
  try {
    const { username, email, password } = req.body;

    let user = await userModel.findOne({
      $or: [
        { username },
        { email }
      ]
    })

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    let refreshToken = user.refreshToken;

    refreshToken = jwt.sign(
      { id: user._id },
      config.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    )

    user = await userModel.findByIdAndUpdate(
      user._id,
      { refreshToken: refreshToken },
      { new: true },
    )

    const accessToken = jwt.sign(
      { id: user._id },
      config.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    )

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    user = await userModel.findById(user._id).select("-refreshToken -password");

    return res.status(200).json({ message: "User logged in successfully", user, accessToken });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function refresh(req, res) {
  try {
    let refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: "No refresh token detected" })
    }

    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);

    if (!decoded) {
      return res.status(400).json({ message: "Invalid refresh token" })
    }

    let user = await userModel.findById(decoded.id);

    if (user.refreshToken !== refreshToken) {
      return res.status(400).json({ message: "Invalid refresh token" })
    }

    refreshToken = jwt.sign(
      { id: decoded.id },
      config.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    )

    const accessToken = jwt.sign(
      { id: decoded.id },
      config.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    )

    user = await userModel.findByIdAndUpdate(
      decoded.id,
      { refreshToken: refreshToken },
      { new: true },
    )

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.cookie("accessToken", accessToken, {
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    })

    return res.status(200).json({ message: "Token rotation done successfully", accessToken });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
}