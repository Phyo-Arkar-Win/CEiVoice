import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const signup = async (req, res) => {

    const { email, password, confirmPassword } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const name = email.split("@")[0];

    const newUser = await User.create({ email, password: hashedPassword, name });
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
    res.status(200).json({ message: "Login successful.", user });

    const token = jwt.sign(
        { userId: user._id }, 
        process.env.JWT_SECRET, { expiresIn: "3h" }
    );

    res.json({ token });
}

export default { signup, login };