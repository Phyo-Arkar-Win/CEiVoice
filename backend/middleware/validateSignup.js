const validateSignup = (req, res, next) => {
    const { email, password, confirmPassword, username } = req.body;

    if (!email || !password || !confirmPassword || !username) {
        return res.status(400).json({ message: "Enter all required fields." });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match." });
    }
    next();
}

export default validateSignup;