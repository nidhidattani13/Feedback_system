# Academic Observation Module - Feedback System

A comprehensive feedback system designed to enhance transparency and accountability in educational institutions by enabling structured feedback and verification processes.

## 🎯 Project Overview

The Academic Observation Module involves:
- **Students** providing daily feedback on lectures and faculty
- **Faculty** reporting weekly assessment plans for student verification
- **Students** confirming the execution of planned academic events
- **HODs** receiving comprehensive monthly reports for decision-making

## ✨ Key Features Implemented

### 1. Student Daily Feedback System
- **Daily Feedback Submission**: Students can submit feedback on lectures and faculty performance
- **Rating System**: 1-5 scale ratings for both lecture quality and faculty performance
- **Comment System**: Optional text feedback for detailed insights
- **24-Hour Edit Window**: Students can edit feedback within 24 hours of submission
- **Subject-Specific Feedback**: Organized by subject and faculty member
- **Duplicate Prevention**: One feedback per subject per day per student

### 2. Faculty Assessment Planning
- **Weekly Assessment Plans**: Faculty can create detailed assessment schedules
- **Assessment Types**: Quiz, assignment, presentation, exam, project, and other
- **Date Management**: Week-based planning with specific execution dates
- **Status Tracking**: Planned, completed, or cancelled status updates
- **Topic & Description**: Detailed information about each assessment

### 3. Student Assessment Verification
- **Assessment Verification**: Students verify whether planned assessments were conducted
- **Completion Status**: Yes/No verification with optional comments
- **Verification History**: Track all verification activities
- **Completion Rate Analytics**: Calculate and display completion percentages

### 4. Academic Event Management
- **Event Scheduling**: Plan academic events like industrial visits, workshops, seminars
- **Event Types**: Industrial visits, workshops, seminars, conferences, field trips
- **Student Verification**: Students verify event completion
- **Status Tracking**: Scheduled, completed, or cancelled status

### 5. Comprehensive Reporting System
- **Monthly Reports**: Generate detailed monthly summaries for HODs
- **Performance Analytics**: Faculty performance metrics and trends
- **Completion Rates**: Assessment and event completion statistics
- **Trend Analysis**: Daily feedback trends and insights
- **Automated Insights**: AI-generated recommendations for improvement

### 6. Email Notification System
- **Monthly Report Emails**: Automated emails to HODs with comprehensive reports
- **Feedback Reminders**: Notify students about pending feedback submissions
- **Assessment Updates**: Inform faculty about assessment plan changes
- **Professional Templates**: Beautiful HTML email templates

### 7. Role-Based Access Control (RBAC)
- **Student Access**: Submit feedback, verify assessments and events
- **Faculty Access**: Create assessment plans, manage academic events
- **Admin Access**: System management, user administration
- **HOD Access**: View reports, analytics, and performance metrics

## 🏗️ System Architecture

### Backend Technologies
- **Node.js** with Express.js framework
- **Supabase** for database and authentication
- **Sequelize** ORM for database operations
- **Nodemailer** for email services
- **JWT** for authentication and authorization

### Frontend Technologies
- **React.js** with modern hooks
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Axios** for API communication
- **Chart.js** for data visualization

### Database Schema
- **Daily Feedback**: Student feedback on lectures and faculty
- **Assessment Plans**: Faculty weekly assessment schedules
- **Assessment Verifications**: Student verification of assessments
- **Academic Events**: Scheduled academic activities
- **Event Verifications**: Student verification of events
- **Users**: Students, faculty, and administrators
- **Subjects**: Course information and management

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL database
- Supabase account
- Email service credentials (Gmail, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Feedback_system
   ```

2. **Install backend dependencies**
   ```bash
   cd Backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../Frontend/frontend
   npm install
   ```

4. **Environment Configuration**
   Create `.env` file in the Backend directory:
   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=feedback_system
   DB_PORT=3306
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```

5. **Database Setup**
   ```bash
   # The system will automatically create tables on first run
   # Ensure your MySQL server is running
   ```

6. **Start the application**
   ```bash
   # Start backend
   cd Backend
   npm run dev
   
   # Start frontend (in new terminal)
   cd Frontend/frontend
   npm run dev
   ```

## 📊 API Endpoints

### Daily Feedback
- `POST /api/daily-feedback/submit` - Submit daily feedback
- `PUT /api/daily-feedback/edit/:id` - Edit feedback (within 24 hours)
- `GET /api/daily-feedback/student/:studentId` - Get student feedback history
- `GET /api/daily-feedback/faculty/:facultyId` - Get faculty feedback summary
- `GET /api/daily-feedback/subject/:subjectId` - Get subject feedback summary

### Assessment Plans
- `POST /api/assessment-plan/create` - Create weekly assessment plan
- `GET /api/assessment-plan/faculty/:facultyId` - Get faculty assessment plans
- `GET /api/assessment-plan/subject/:subjectId` - Get subject assessment plans
- `PUT /api/assessment-plan/:id/status` - Update assessment status
- `DELETE /api/assessment-plan/:id` - Delete assessment plan

### Assessment Verification
- `POST /api/assessment-verification/verify` - Verify assessment completion
- `GET /api/assessment-verification/assessment/:assessmentPlanId` - Get verification status
- `GET /api/assessment-verification/student/:studentId` - Get student verification history
- `GET /api/assessment-verification/faculty/:facultyId` - Get faculty verification summary

### Reports
- `GET /api/reports/monthly/:subjectId` - Generate monthly report
- `POST /api/reports/send-monthly/:subjectId` - Send monthly report to HOD
- `GET /api/reports/dashboard/:subjectId` - Get comprehensive dashboard data

## 🔐 Authentication & Security

- **JWT-based authentication** for secure API access
- **Role-based access control** for different user types
- **Input validation** and sanitization
- **Rate limiting** to prevent abuse
- **Secure password hashing** with bcrypt

## 📧 Email Notifications

The system automatically sends:
- **Monthly reports** to HODs with comprehensive analytics
- **Feedback reminders** to students with pending submissions
- **Assessment updates** to faculty about plan changes
- **Professional HTML templates** for all communications

## 📱 User Interface

### Student Dashboard
- Daily feedback submission form
- Assessment verification interface
- Event verification system
- Feedback history and editing

### Faculty Dashboard
- Assessment plan creation and management
- Academic event scheduling
- Performance analytics and insights
- Student verification tracking

### HOD Dashboard
- Comprehensive monthly reports
- Performance analytics and trends
- Faculty performance metrics
- Automated insights and recommendations

## 🔄 Data Flow

1. **Daily Operations**
   - Students submit daily feedback after lectures
   - Faculty create and update assessment plans
   - Students verify assessment completion

2. **Weekly Processing**
   - Assessment plan execution tracking
   - Verification completion monitoring
   - Performance trend analysis

3. **Monthly Reporting**
   - Comprehensive data aggregation
   - Performance analytics generation
   - Automated email reports to HODs
   - Trend analysis and insights

## 🎨 Customization

### Adding New Assessment Types
- Extend the `assessmentType` enum in the database
- Update frontend selection options
- Modify validation rules as needed

### Custom Email Templates
- Edit HTML templates in `emailService.js`
- Modify styling and content
- Add new notification types

### Additional Report Metrics
- Extend the reporting functions
- Add new calculation methods
- Integrate with external analytics tools

## 🧪 Testing

### Backend Testing
```bash
cd Backend
npm test
```

### Frontend Testing
```bash
cd Frontend/frontend
npm test
```

### API Testing
Use tools like Postman or Insomnia to test API endpoints:
- Test authentication flows
- Verify data validation
- Check error handling
- Test email functionality

## 🚀 Deployment

### Production Environment
1. Set `NODE_ENV=production`
2. Configure production database
3. Set up email service credentials
4. Configure CORS for production domain
5. Set up SSL certificates

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up -d
```

## 📈 Performance Optimization

- **Database indexing** on frequently queried fields
- **Connection pooling** for database connections
- **Caching** for frequently accessed data
- **Pagination** for large datasets
- **Optimized queries** with proper joins

## 🔍 Monitoring & Logging

- **Request logging** for API calls
- **Error tracking** and monitoring
- **Performance metrics** collection
- **User activity** analytics
- **System health** monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- **Mobile app** development
- **Real-time notifications** with WebSockets
- **Advanced analytics** and machine learning insights
- **Integration** with existing LMS systems
- **Multi-language** support
- **Advanced reporting** with custom dashboards

---

**Note**: This system is designed to be scalable and maintainable. All code follows best practices and includes comprehensive error handling and validation.