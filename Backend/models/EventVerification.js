import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const EventVerification = sequelize.define('EventVerification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'academic_events',
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
  tableName: 'event_verifications',
  timestamps: true,
  indexes: [
    {
      fields: ['eventId', 'studentId'],
      unique: true
    }
  ]
});

export default EventVerification; 