import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const validateLogin = async (req, res, next) => {

    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Please enter all required fields." });
    }

    next();
}

export const validateSignup = async (req, res, next) => {
    
    const { email, password, confirmPassword, username } = req.body;

    if (!email || !password || !confirmPassword || !username) {
        return res.status(400).json({ message: "Enter all required fields." });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match." });
    }
    next();
}

export const protect = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({ message: "Please log in to get access." });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decodedToken.userId).select('-password');
        if (!currentUser) {
            return res.status(401).json({ message: "The user belonging to this token no longer exists." });
        }
        req.user = currentUser;
        next();
    } catch (error) {
        console.error("Auth Error:", error);
        res.status(401).json({ message: "Authentication failed." });
    }
}

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Permission Denied"
            });
        }
        next();
    };
};