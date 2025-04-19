import express from "express";
import supabase from "../supabaseClient.js";

const router = express.Router();

// Get all faculty
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("faculty")
    .select("*")
    .order("name");

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// Create new faculty
router.post("/", async (req, res) => {
  const { name, department, info } = req.body;

  if (!name || !department) {
    return res.status(400).json({ message: "Name and department are required" });
  }

  const { data, error } = await supabase
    .from("faculty")
    .insert({ name, department, info })
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });
  res.status(201).json(data);
});

// Update faculty
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, department, info, is_active } = req.body;

  const { data, error } = await supabase
    .from("faculty")
    .update({ 
      name, 
      department, 
      info, 
      is_active,
      updated_at: new Date()
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// Delete faculty
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("faculty")
    .delete()
    .eq("id", id);

  if (error) return res.status(500).json({ message: error.message });
  res.json({ message: "Faculty deleted successfully" });
});

export default router;