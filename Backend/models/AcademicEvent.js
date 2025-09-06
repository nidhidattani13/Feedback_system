import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const AcademicEvent = sequelize.define('AcademicEvent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  eventType: {
    type: DataTypes.ENUM('industrial_visit', 'workshop', 'seminar', 'conference', 'field_trip', 'other'),
    allowNull: false
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
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
    defaultValue: 'scheduled'
  },
  maxParticipants: {
    type: DataTypes.INTEGER,
    allowNull: true
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
  tableName: 'academic_events',
  timestamps: true,
  indexes: [
    {
      fields: ['subjectId', 'scheduledDate']
    },
    {
      fields: ['facultyId', 'scheduledDate']
    }
  ]
});

export default AcademicEvent; 