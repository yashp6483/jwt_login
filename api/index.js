import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

// Connect to MongoDB Atlas
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGO_URI, { dbName: "admin" })
    .then(() => console.log("MONGODB CONNECTED."))
    .catch(err => console.log(err));
}

// User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

// Serverless handler
export default async function handler(req, res) {
  // Enable CORS for your GitHub Pages frontend
  res.setHeader("Access-Control-Allow-Origin", "https://yashp6483.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") return res.status(200).end();

  const { url, method, body } = req;

  // -------------------- SIGNUP --------------------
  if (url === "/signup" && method === "POST") {
    const { name, email, password } = body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ message: "User created successfully" });
  }

  // -------------------- LOGIN --------------------
  if (url === "/login" && method === "POST") {
    const { email, password } = body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1h" });
    return res.status(200).json({ message: "Login successful", token, user });
  }

  // -------------------- GET USERS (Protected) --------------------
  if (url === "/users" && method === "GET") {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(403).json({ message: "Token required" });

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      const users = await User.find().select("-password");
      return res.status(200).json({ users });
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  }

  // -------------------- ROUTE NOT FOUND --------------------
  return res.status(404).json({ message: "Route not found" });
}
