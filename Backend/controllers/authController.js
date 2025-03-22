// backend/controllers/authController.js
const supabase = require("../supabaseClient");

// Signup User
const signupUser = async (req, res) => {
  const { enrollment, password } = req.body;

  const { data, error } = await supabase
    .from("students")
    .insert([{ enrollment, password }]);

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.status(201).json({ message: "User created successfully", data });
};

// Login User
const loginUser = async (req, res) => {
  const { enrollment, password } = req.body;

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("enrollment", enrollment)
    .eq("password", password)
    .single();

  if (error || !data) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  res.status(200).json({ message: "Login successful", data });
};

module.exports = { signupUser, loginUser };
