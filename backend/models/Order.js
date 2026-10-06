import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Order = sequelize.define(
  "Order",
  {
    order_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    order_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ),
      defaultValue: "pending",
      allowNull: false,
    },

    payment_status: {
      type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
      defaultValue: "pending",
      allowNull: false,
    },

    payment_method: {
      type: DataTypes.ENUM("cod", "online"),
      allowNull: false,
    },
    razorpay_order_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },

    razorpay_payment_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    razorpay_signature: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    shipping_charge: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    shipping_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    shipping_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    shipping_address_line1: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    shipping_address_line2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    shipping_city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    shipping_state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    shipping_postal_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    shipping_country: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "India",
    },
  },
  {
    tableName: "orders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Order;
