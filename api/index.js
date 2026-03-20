import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

// Connect MongoDB
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGO_URI, { dbName: "admin" })
    .then(() => console.log("MONGODB CONNECTED."))
    .catch(err => console.log(err));
}

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default async function handler(req, res) {
  // ---- CORS ----
  res.setHeader("Access-Control-Allow-Origin", "https://yashp6483.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { url, method, body } = req;
  const route = url.replace("/api", ""); // remove /api prefix

  // SIGNUP
  if (route === "/signup" && method === "POST") {
    const { name, email, password } = body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "User exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    return res.status(201).json({ message: "User created" });
  }

  // LOGIN
  if (route === "/login" && method === "POST") {
    const { email, password } = body;
    if (!email || !password) return res.status(400).json({ message: "Email/password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1h" });
    return res.status(200).json({ message: "Login successful", token, user });
  }

  // GET USERS
  if (route === "/users" && method === "GET") {
    const auth = req.headers.authorization;
    if (!auth) return res.status(403).json({ message: "Token required" });

    const token = auth.split(" ")[1];
    try {
      jwt.verify(token, SECRET_KEY);
      const users = await User.find().select("-password");
      return res.status(200).json({ users });
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  }

  return res.status(404).json({ message: "Route not found" });
}
