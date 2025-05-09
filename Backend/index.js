import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
// import authRoutes from './routes/auth'; // ✅ Correct
import { createClient } from '@supabase/supabase-js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js'; 
import facultyRoutes from './routes/faculty.js'; // Import faculty routes
import noticeRoutes from './routes/notices.js'; // Import notice routes
// Load environment variables
dotenv.config();

// Supabase connection
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Check if Supabase is correctly initialized
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase URL or Key is missing. Check your .env file.");
  process.exit(1); // Exit if Supabase is not configured correctly
} else {
  console.log("✅ Supabase client initialized successfully!");
}

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Test route to check if API is working
app.get("/", (req, res) => {
  res.send("API is working! 🚀");
});

// Test Supabase connection route
app.get("/test-supabase", async (req, res) => {
  try {
    const { data, error } = await supabase.from("test_table").select("*");

    if (error) {
      throw error;
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("❌ Supabase connection error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test route for notices - add this in index.js
app.get("/api/notices-test", (req, res) => {
  console.log("GET /api/notices-test endpoint reached");
  res.json({ message: "GET notices test endpoint working" });
});

app.post("/api/notices-test", (req, res) => {
  console.log("POST /api/notices-test endpoint reached");
  console.log("Body received:", req.body);
  res.status(201).json({ 
    message: "POST notices test endpoint working",
    receivedData: req.body
  });
});

// Routes for Authentication (Signup, Login)
app.use("/api/auth", authRoutes);
// Routes for Admin Profile Management
app.use("/api/admin", adminRoutes);
// Routes for Faculty Management
app.use("/api/faculty", facultyRoutes);
// Routes for Notices Management
app.use("/api/notices", noticeRoutes);


// Server configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});