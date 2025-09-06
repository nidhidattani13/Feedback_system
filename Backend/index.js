import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js'; 
import facultyRoutes from './routes/facultyRoutes.js';
import noticeRoutes from './routes/notices.js';
import subjectsRoutes from './routes/subjects.js';
import groupRoutes from './routes/groups.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import studentRoutes from './routes/student.js';
import dailyFeedbackRoutes from './routes/dailyFeedbackRoutes.js';
import assessmentPlanRoutes from './routes/assessmentPlanRoutes.js';
import assessmentVerificationRoutes from './routes/assessmentVerificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import studentGroupRoutes from './routes/studentGroupRoutes.js';
dotenv.config();

// Supabase connection
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase URL or Key is missing. Check your .env file.");
  process.exit(1);
} else {
  console.log("✅ Supabase client initialized successfully!");
}

const app = express();

// ✅ FIXED: Proper CORS setup to support credentials
const corsOptions = {
  origin: ['http://localhost:5173'], // match your frontend origin
  credentials: true,
};

// Middleware setup
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/notice', noticeRoutes);
app.use('/api/subject', subjectsRoutes);
app.use('/api/group', groupRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/daily-feedback', dailyFeedbackRoutes);
app.use('/api/assessment-plan', assessmentPlanRoutes);
app.use('/api/assessment-verification', assessmentVerificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/student-groups', studentGroupRoutes);

// Root test route
app.get("/", (req, res) => {
  res.send("API is working! 🚀");
});

// Supabase connection test route
app.get("/test-supabase", async (req, res) => {
  try {
    const { data, error } = await supabase.from("test_table").select("*");
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("❌ Supabase connection error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Notice test routes
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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/faculty", facultyRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/groups', groupRoutes);

// Server start
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
