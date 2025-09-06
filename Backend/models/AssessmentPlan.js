import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const AssessmentPlan = sequelize.define('AssessmentPlan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  facultyId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'faculty',
      key: 'email'
    }
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subjects',
      key: 'id'
    }
  },
  weekStartDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  weekEndDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  assessmentType: {
    type: DataTypes.ENUM('quiz', 'assignment', 'presentation', 'exam', 'project', 'other'),
    allowNull: false
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  plannedDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('planned', 'completed', 'cancelled'),
    defaultValue: 'planned'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'assessment_plans',
  timestamps: true,
  indexes: [
    {
      fields: ['facultyId', 'weekStartDate']
    },
    {
      fields: ['subjectId', 'plannedDate']
    }
  ]
});

export default AssessmentPlan; 