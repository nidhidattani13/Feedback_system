import express from "express";
import bcrypt from "bcryptjs";
import supabase from "../supabaseClient.js";

const router = express.Router();

// Get admin profile by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// Create new admin profile
router.post("/", async (req, res) => {
    const { name, position, department, email, phone, avatar_url, password } = req.body;
  
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const { data, error } = await supabase
      .from("admin_profiles")
      .insert({
        name,
        position,
        department,
        email,
        phone,
        avatar_url,
        password: hashedPassword,
        updated_at: new Date()
      })
      .select()
      .single();
  
    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ message: error.message });
    }
    
    res.status(201).json({ message: "Admin profile created", profile: data });
  });

// Update admin profile
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, position, department, email, phone, avatar_url } = req.body;

  const { data, error } = await supabase
    .from("admin_profiles")
    .update({ name, position, department, email, phone, avatar_url, updated_at: new Date() })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });
  res.json({ message: "Profile updated", profile: data });
});

// Change password
router.put("/:id/password", async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  const { data: admin, error: fetchError } = await supabase
    .from("admin_profiles")
    .select("password")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !admin) return res.status(400).json({ message: "Admin not found" });

  const isMatch = await bcrypt.compare(currentPassword, admin.password);
  if (!isMatch) return res.status(401).json({ message: "Incorrect current password" });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const { error: updateError } = await supabase
    .from("admin_profiles")
    .update({ password: hashedPassword })
    .eq("id", id);

  if (updateError) return res.status(500).json({ message: "Failed to update password" });
  res.json({ message: "Password updated successfully" });
});

export default router;
