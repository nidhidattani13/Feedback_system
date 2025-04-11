// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import supabase from "../supabaseClient.js"; 

const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
  const { name, enrollment, password } = req.body;

  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("enrollment", enrollment)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    }

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const { error } = await supabase.from("users").insert([
      {
        name,
        enrollment,
        password: hashedPassword,
      },
    ]);

    if (error) {
      throw error;
    }

    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
