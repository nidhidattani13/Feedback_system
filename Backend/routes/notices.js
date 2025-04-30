import express from "express";
import supabase from "../supabaseClient.js";

const router = express.Router();

// GET: All notices with filtering
// GET: All notices with filtering
router.get("/", async (req, res) => {
  const { audience, limit = 10, before_date } = req.query;

  let query = supabase
    .from("notices")
    .select("*")
    .order("created_at", { ascending: false });

  // Use the contains operator for array fields
  if (audience) {
    query = query.contains("audience", [audience]);
  }
  
  if (before_date) {
    query = query.lt("created_at", before_date);
  }

  query = query.limit(Number(limit));

  const { data, error } = await query;

  if (error) {
    console.error("Supabase fetch error:", error);
    return res.status(500).json({ message: error.message });
  }

  const formattedData = data.map(notice => ({
    id: notice.id,
    title: notice.title,
    text: notice.text,
    date: notice.date,
    audience: notice.audience,
    created_by: notice.created_by,
  }));

  res.json(formattedData);
});


// POST: Create new notice
router.post("/", async (req, res) => {
  try {
    const {
      title,
      content, // This comes as 'content' from frontend
      audience = ["all"],
      created_by = "Admin User",
      // Remove any reference to priority
    } = req.body;

    console.log("Received notice data:", { title, content, audience, created_by });

    if (!title || !content) {
      console.log("Missing required fields");
      return res.status(400).json({ message: "Title and content are required." });
    }

    // Format date as your frontend expects it
    const formattedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Match exactly with your database schema fields - NO PRIORITY
    const noticeData = {
      title,
      text: content, // Map content to text
      date: formattedDate,
      audience,
      created_by,
      // created_at is automatically handled by Supabase
    };

    console.log("Attempting to insert into Supabase:", noticeData);

    const { data, error } = await supabase
      .from("notices")
      .insert(noticeData)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ message: error.message });
    }

    console.log("Successfully inserted notice:", data);
    res.status(201).json(data);
  } catch (err) {
    console.error("Exception in notice POST route:", err);
    res.status(500).json({ message: err.message });
  }
});

// PUT: Update a notice
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content, audience } = req.body;

  const { data, error } = await supabase
    .from("notices")
    .update({
      title,
      text: content,
      audience,
      // Remove priority field here
      // updated_at is handled by Supabase automatically
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});
// DELETE: Remove notice
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("notices").delete().eq("id", id);
  if (error) return res.status(500).json({ message: error.message });

  res.json({ message: "Notice deleted successfully" });
});

export default router;
