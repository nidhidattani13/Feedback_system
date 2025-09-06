import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// JWT secret for token verification
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // First try to verify as JWT token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (jwtError) {
      // If JWT verification fails, try Supabase token
      console.log('JWT verification failed, trying Supabase token...');
    }

    // Try to verify with Supabase
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return res.status(401).json({ 
          error: 'Invalid token or token expired.' 
        });
      }

      // Get user details from database
      let userDetails = null;
      
      // Check if user is a student
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('email', user.email)
        .single();

      if (student && !studentError) {
        userDetails = {
          id: student.enrollmentNumber,
          email: student.email,
          name: student.name,
          role: 'student',
          ...student
        };
      } else {
        // Check if user is faculty
        const { data: faculty, error: facultyError } = await supabase
          .from('faculty')
          .select('*')
          .eq('email', user.email)
          .single();

        if (faculty && !facultyError) {
          userDetails = {
            id: faculty.email,
            email: faculty.email,
            name: faculty.name,
            role: 'faculty',
            ...faculty
          };
        } else {
          // Check if user is admin
          const { data: admin, error: adminError } = await supabase
            .from('admin')
            .select('*')
            .eq('email', user.email)
            .single();

          if (admin && !adminError) {
            userDetails = {
              id: admin.email,
              email: admin.email,
              name: admin.name,
              role: 'admin',
              ...admin
            };
          }
        }
      }

      if (!userDetails) {
        return res.status(401).json({ 
          error: 'User not found in system.' 
        });
      }

      req.user = userDetails;
      next();
    } catch (supabaseError) {
      console.error('Supabase token verification error:', supabaseError);
      return res.status(401).json({ 
        error: 'Token verification failed.' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal server error during authentication.' 
    });
  }
};

// Role-based access control middleware
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};

// Student-only access
export const requireStudent = requireRole(['student']);

// Faculty-only access
export const requireFaculty = requireRole(['faculty']);

// Admin-only access
export const requireAdmin = requireRole(['admin']);

// HOD access (can be faculty or admin)
export const requireHOD = requireRole(['faculty', 'admin']);

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);

    // Try JWT first
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (jwtError) {
      // Continue to Supabase verification
    }

    // Try Supabase
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        req.user = null;
        return next();
      }

      // Get user details (similar to main middleware)
      let userDetails = null;
      
      const { data: student } = await supabase
        .from('students')
        .select('*')
        .eq('email', user.email)
        .single();

      if (student) {
        userDetails = {
          id: student.enrollmentNumber,
          email: student.email,
          name: student.name,
          role: 'student',
          ...student
        };
      } else {
        const { data: faculty } = await supabase
          .from('faculty')
          .select('*')
          .eq('email', user.email)
          .single();

        if (faculty) {
          userDetails = {
            id: faculty.email,
            email: faculty.email,
            name: faculty.name,
            role: 'faculty',
            ...faculty
          };
        } else {
          const { data: admin } = await supabase
            .from('admin')
            .select('*')
            .eq('email', user.email)
            .single();

          if (admin) {
            userDetails = {
              id: admin.email,
              email: admin.email,
              name: admin.name,
              role: 'admin',
              ...admin
            };
          }
        }
      }

      req.user = userDetails;
      next();
    } catch (error) {
      req.user = null;
      next();
    }
  } catch (error) {
    req.user = null;
    next();
  }
};

export default {
  authMiddleware,
  requireRole,
  requireStudent,
  requireFaculty,
  requireAdmin,
  requireHOD,
  optionalAuth
};
