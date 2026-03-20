const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;

async function connectDb() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set");
  }

  if (mongoose.connection.readyState) {
    return;
  }

  await mongoose.connect(process.env.MONGO_URI, { dbName: "admin" });
}

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.models.User || mongoose.model("User", userSchema);

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "object") return body;
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://yashp6483.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    await connectDb();

    const method = req.method;
    const route = (req.url || "").split("?")[0].replace("/api", "");
    const body = parseBody(req.body);

    if (route === "/signup" && method === "POST") {
      const { name, email, password } = body;
      if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields required" });
      }

      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ message: "User exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ name, email, password: hashedPassword });
      await newUser.save();
      return res.status(201).json({ message: "User created" });
    }

    if (route === "/login" && method === "POST") {
      if (!SECRET_KEY) {
        return res.status(500).json({ message: "JWT_SECRET is not set" });
      }

      const { email, password } = body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email/password required" });
      }

      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: "User not found" });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1h" });
      return res.status(200).json({ message: "Login successful", token, user });
    }

    if (route === "/users" && method === "GET") {
      if (!SECRET_KEY) {
        return res.status(500).json({ message: "JWT_SECRET is not set" });
      }

      const auth = req.headers.authorization;
      if (!auth) return res.status(403).json({ message: "Token required" });

      const token = auth.split(" ")[1];
      try {
        jwt.verify(token, SECRET_KEY);
        const users = await User.find().select("-password");
        return res.status(200).json({ users });
      } catch {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    return res.status(404).json({ message: "Route not found" });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};
