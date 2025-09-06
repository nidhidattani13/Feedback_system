// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import supabase from "../supabaseClient.js";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; 

const router = express.Router();

// Login route
router.post("/login", async (req, res) => {
  const { enrollment, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("enrollment", enrollment)
      .maybeSingle(); // Avoids throwing if no match

    if (!user) {
      return res.status(401).json({ message: "Invalid enrollment or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid enrollment or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        enrollment: user.enrollment,
        email: user.email,
        role: user.role || 'user'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ 
      message: "Login successful", 
      user,
      token 
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// Signup route
router.post("/signup", async (req, res) => {
  const { name, enrollment, password } = req.body;

  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("enrollment", enrollment)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this enrollment number" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([{ name, enrollment, password: hashedPassword }])
      .single();

    if (insertError) throw insertError;

    res.status(201).json({ message: "Signup successful", user: newUser });
  } catch (error) {
    console.error("❌ Signup error:", error.message);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});


export default router;
