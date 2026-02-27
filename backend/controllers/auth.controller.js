import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signup = async (req, res) => {

    const { email, password, username } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ email, password: hashedPassword, name: username });
    res.status(201).json({ message: "User created successfully.", user: newUser });

}

const login = async (req, res) => {

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: "Invalid email or password." });
    }
    const correctPassword = await bcrypt.compare(password, user.password);

    if (!correctPassword) {
        return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET, { expiresIn: "3h" }
    );

    res.status(200).json({ message: "Login successful.", user, token });
}

const googleLogin = async (req, res) => {
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

        const appToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3h" }
        );

        res.status(200).json({ message: "Google login successful.", token: appToken, user });
    } catch (error) {
        console.error("Google login error:", error);
        res.status(400).json({ message: "Google authentication failed." });
    }
}

export default { signup, login, googleLogin };