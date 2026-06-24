import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import  config from "../config/config.js";
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
      return res.status(409).json("User already exists");
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
    const {email, password } = req.body;

    let user = await userModel.findOne({email}).select("+password");

    if (!user) {
      return res.status(401).json({ message: "User does not exist" });
    }
    if (user.isBanned) {
      return res.status(403).json({ message: "Your account has been banned" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const refreshToken = jwt.sign(
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
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    user = await userModel.findById(user._id);

    return res.status(200).json({ message: "User logged in successfully", user, accessToken });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function refresh(req, res) {
  try {
    let refreshToken = req.cookies.refreshToken;

    console.log("Cookie token:", refreshToken);

    if (!refreshToken) {
      return res.status(400).json({ message: "No refresh token detected" })
    }
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
    } catch (err) {
      console.log("JWT verify failed:", err.message);
      return res.status(401).json({ message: "Invalid refresh token" })
    }

    let user = await userModel.findById(decoded.id).select("+refreshToken");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    console.log("DB token:", user.refreshToken);
    console.log("Match:", user.refreshToken === refreshToken);

    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" })
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
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return res.status(200).json({ message: "Token rotation done successfully", accessToken });
  } catch (err) {
    console.log("Server error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
}

export async function logout(req, res) {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId);
    user.refreshToken = null;
    await user.save();
    res.clearCookie("refreshToken")
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    return res.status(400).json({ message: "Server error" });
  }
}

export async function getMe(req, res) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
}

export async function kycSubmit(req, res) {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId);
    if (user.kyc.status === "verified" || user.kyc.status === "submitted") {
      return res.status(400).json({ message: "Already verified or submitted" });
    }
    user.kyc.status = "submitted";
    await user.save();
    return res.status(200).json({message:"KYC submitted successfully",user})
  } catch (err) {
    return res.status(500).json({ message: "Server Error" })
  }
}

export async function kycVerify(req, res) {
  try {
    const userId = req.params.userId;
    const user = await userModel.findById(userId);
    user.kyc.status = "verified";
    await user.save();
    return res.status(200).json({ message: "Kyc submitted successfully", user });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" })
  }
}