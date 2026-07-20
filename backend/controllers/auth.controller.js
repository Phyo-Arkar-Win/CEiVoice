import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const signup = async (req, res) => {

    const { email, password, username } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ email, password: hashedPassword, name: username });

    await cookieSetter(newUser, res);

    res.status(201).json({ message: "User created successfully.", user: newUser });

}

export const login = async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "Invalid email or password." });
    }

    const correctPassword = await bcrypt.compare(password, user.password);
    if (!correctPassword) {
        return res.status(400).json({ message: "Invalid email or password." });
    }

    await cookieSetter(user, res);

    res.status(200).json({ message: "Login successful.", user });
}

export const googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                name: email.split('@')[0],
            });
        }

        await cookieSetter(user, res);
        res.status(200).json({ message: "Google login successful.", user });
    } catch (error) {
        console.error("Google login error:", error);
        res.status(400).json({ message: "Google authentication failed." });
    }
}

// Helper Function to set cookies
const cookieSetter = async(user, res) => {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
    });
}

export const refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        return res.status(401).json({ message: "Token expired. Please log in again." });
    }

    try {
        const decodedRefreshToken = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedRefreshToken.userId);

        if (!user) {
            return res.status(403).json({ message: "User not found." });
        }

        // Protection against hijacks
        const tokenInDatabase = user.refreshTokens.includes(refreshToken);
        if (!tokenInDatabase) {
            res.clearCookie('refreshToken');
            res.clearCookie('accessToken');
            user.refreshTokens = [];
            await user.save();
            return res.status(403).json({ message: "Invalid refresh token. Please log in again." });
        }

        const newAccessToken = generateAccessToken(user);
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000
        });
        res.status(200).json({ message: "Access token refreshed successfully." });

    } catch (error) {
        console.log("RefreshToken Error: ", error);
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        return res.status(403).json({ message: "Invalid refresh token. Please log in again." });
    }
}

export const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        await User.findOneAndUpdate(
            { refreshTokens: refreshToken },
            { $pull: { refreshTokens: refreshToken } }
        );
    }
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    return res.status(200).json({ message: "Logout successful." });
}

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "You do not have permission to perform this action." });
        }
        next();
    };
};

