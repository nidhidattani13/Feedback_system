import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const AssessmentVerification = sequelize.define('AssessmentVerification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  assessmentPlanId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'assessment_plans',
      key: 'id'
    }
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'students',
      key: 'enrollmentNumber'
    }
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  verificationDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
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
  tableName: 'assessment_verifications',
  timestamps: true,
  indexes: [
    {
      fields: ['assessmentPlanId', 'studentId'],
      unique: true
    }
  ]
});

export default AssessmentVerification; 