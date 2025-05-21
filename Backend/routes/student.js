import express from 'express';
import supabase from '../supabaseClient.js';
const router = express.Router();

router.use((req, res, next) => {
  console.log(`Student route accessed: ${req.method} ${req.path}`);
  next();
});

// Helper function to transform camelCase to snake_case
const transformToSnakeCase = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = value;
    return acc;
  }, {});
};

// Helper function to transform snake_case to camelCase
const transformToCamelCase = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    acc[camelKey] = value;
    return acc;
  }, {});
};

// GET student by enrollment number
router.get('/enroll/:enrollmentNumber', async (req, res) => {
    const { enrollmentNumber } = req.params;
  
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('enrollment_number', enrollmentNumber)
      .single();
  
    if (error) return res.status(404).json({ error: 'Student not found' });
    
    // Transform response to camelCase
    const camelData = transformToCamelCase(data);
    res.json(camelData);
  });

// PUT update academic data
router.put('/:id/academic', async (req, res) => {
  const { id } = req.params;
  const { sgpa } = req.body;

  const { data, error } = await supabase
    .from('students')
    .update({ sgpa })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  
  const camelData = transformToCamelCase(data);
  res.json(camelData);
});

  // GET student by ID
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return res.status(404).json({ error: 'Student not found' });
    res.json(data);
  });

  // POST endpoint to create new student profile
  router.post('/', async (req, res) => {
    const {
      enrollmentNumber,
      name,
      grNumber,
      program,
      batch,
      email,
      phone
    } = req.body;
  
    const { data, error } = await supabase
      .from('students')
      .insert([
        {
          enrollment_number: enrollmentNumber,
          name,
          gr_number: grNumber,
          program,
          batch,
          email,
          phone,
          sgpa: [],                      // initialize SGPA array
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
  
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ message: 'Profile created successfully', data });
  });
  
  // PUT endpoint to update personal profile
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = {
      ...req.body,
      updated_at: new Date().toISOString()
    };
  
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Profile updated successfully', data });
  });
  
  // PUT endpoint to update academic data (SGPA)
  router.put('/:id/academic', async (req, res) => {
    const { id } = req.params;
    const { sgpa } = req.body;
  
    const { data, error } = await supabase
      .from('students')
      .update({
        sgpa,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
  
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Academic data updated successfully', data });
  });
  

export default router;
