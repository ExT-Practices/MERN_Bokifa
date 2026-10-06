import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const PushSubscription = sequelize.define(
  "PushSubscription",
  {
    push_subscription_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    endpoint: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    p256dh: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    auth: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "push_subscriptions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default PushSubscription;