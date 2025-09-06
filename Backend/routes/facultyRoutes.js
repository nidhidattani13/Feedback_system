import express from 'express';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';

dotenv.config();

const router = express.Router();


// Verify Supabase configuration and connection
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase configuration is missing! Check your .env file");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Debug route to test if facultyRoutes is working correctly
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Faculty routes are working correctly!' });
});

// GET faculty profile by email
router.get('/profile/:email', async (req, res) => {
  const { email } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('faculty_profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching faculty profile:', error);
      return res.status(404).json({ error: 'Faculty profile not found' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Faculty profile not found' });
    }

    res.json(data);
  } catch (err) {
    console.error('Unexpected error fetching faculty profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/save', async (req, res) => {
  const profileData = req.body;
  console.log("📤 Incoming profileData:", profileData);

  // Validate required fields
  if (!profileData.email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // First check if Supabase connection is working
    const { data: testData, error: testError } = await supabase
      .from('faculty_profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error("❌ Supabase connection test failed:", testError);
      return res.status(500).json({ 
        error: 'Database connection error', 
        details: testError.message 
      });
    }

    // Now try to save the profile
    const { data, error } = await supabase
      .from('faculty_profiles')
      .upsert(profileData, { 
        onConflict: 'email',
        returning: 'representation'  // Return the full record
      });

    if (error) {
      console.error("❌ Supabase error:", error);
      return res.status(500).json({ 
        error: 'Failed to save profile',
        details: error.message 
      });
    }

    console.log("✅ Profile saved successfully:", data);
    res.status(200).json({ 
      message: 'Faculty profile saved successfully', 
      data 
    });
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message
    });
  }
});

export default router;