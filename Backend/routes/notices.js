import express from "express";
import supabase from "../supabaseClient.js";

const router = express.Router();

// Get notices with filtering options
router.get("/", async (req, res) => {
  const { audience, limit = 10, before_date } = req.query;
  
  let query = supabase
    .from("notices")
    .select("*, created_by(name, position)")
    .order("created_at", { ascending: false });
  
  // Filter by audience if specified
  if (audience) {
    query = query.contains('audience', [audience]);
  }
  
  // Only show non-expired notices or those without expiration
  query = query.or(`expires_at.gt.${new Date().toISOString()},expires_at.is.null`);
  
  // Pagination support
  if (before_date) {
    query = query.lt('created_at', before_date);
  }
  
  // Limit the number of results
  query = query.limit(limit);

  const { data, error } = await query;

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// Get a single notice by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from("notices")
    .select("*, created_by(name, position)")
    .eq("id", id)
    .single();

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// Create a new notice
router.post("/", async (req, res) => {
  const { title, content, audience = ['all'], priority = 'normal', expires_at, created_by } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  const { data, error } = await supabase
    .from("notices")
    .insert({ 
      title, 
      content, 
      audience, 
      priority, 
      expires_at, 
      created_by 
    })
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });
  res.status(201).json(data);
});

// Update a notice
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content, audience, priority, expires_at } = req.body;

  const { data, error } = await supabase
    .from("notices")
    .update({ 
      title, 
      content, 
      audience, 
      priority, 
      expires_at,
      updated_at: new Date() 
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// Delete a notice
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("notices")
    .delete()
    .eq("id", id);

  if (error) return res.status(500).json({ message: error.message });
  res.json({ message: "Notice deleted successfully" });
});

export default router;