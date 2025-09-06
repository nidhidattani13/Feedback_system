import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const DailyFeedback = sequelize.define('DailyFeedback', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'students',
      key: 'enrollmentNumber'
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
  facultyId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'faculty',
      key: 'email'
    }
  },
  lectureDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  lectureRating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  facultyRating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  lectureComments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  facultyComments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isEditable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  tableName: 'daily_feedback',
  timestamps: true,
  indexes: [
    {
      fields: ['studentId', 'lectureDate', 'subjectId'],
      unique: true
    },
    {
      fields: ['facultyId', 'lectureDate']
    }
  ]
});

export default DailyFeedback; 