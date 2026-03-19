const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
app.use(cors());
const secretKey = "secretKey";

app.use(express.json());

mongoose.connect("mongodb://localhost:27017/admin").then(() => console.log("MONGODB CONNECTED.")).catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});

const User = mongoose.model("users", userSchema);

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "email and password required" });
    }
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(401).json({ message: "User Not Found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    jwt.sign({ userId: user._id }, secretKey, { expiresIn: "1h" }, (err, token) => {
        if (err) {
            return res.status(500).json({ message: "token signing fail" });
        }
        res.json({ message: "Login Successfully ", token, user })
    })
})

app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "name, email and password are required." })
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(409).json({ message: "User already exist." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        })
        await newUser.save();
        res.status(201).json({ message: "User added successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
})
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(403).json({ message: "Token required" });
    const token = authHeader.split(" ")[1];
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Invalid token" });
        req.userId = decoded.userId;
        next();
    });
};
app.get("/users", verifyToken, async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Exclude password
        res.status(200).json({ users }); // Always wrap in object
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(5000, () => {
    console.log("Server is running on port 5000");
})