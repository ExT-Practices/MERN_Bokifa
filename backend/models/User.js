import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reset_password_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

  reset_password_expires: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  role: {
    type: DataTypes.ENUM("user", "admin"),
    defaultValue: "user",
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  email_news: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },

  order_notifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },

  sms_alerts: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
});

export default User;
