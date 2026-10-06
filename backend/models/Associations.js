import Category from "./Category.js";
import Product from "./Product.js";
import ProductCategory from "./ProductCategory.js";
import Wishlist from "./Wishlist.js";
import User from "./User.js";
import Cart from "./Cart.js";
import CartItem from "./CartItem.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";
import Address from "./Address.js";
// Category ↔ Product
Category.belongsToMany(Product, {
  through: ProductCategory,
  foreignKey: "category_id",
  otherKey: "product_id",
  as: "products",
});

Product.belongsToMany(Category, {
  through: ProductCategory,
  foreignKey: "product_id",
  otherKey: "category_id",
  as: "categories",
});

// Direct junction relationships
ProductCategory.belongsTo(Product, {
  foreignKey: "product_id",
});

ProductCategory.belongsTo(Category, {
  foreignKey: "category_id",
});

Product.hasMany(ProductCategory, {
  foreignKey: "product_id",
});

Category.hasMany(ProductCategory, {
  foreignKey: "category_id",
});

User.hasMany(Wishlist, {
  foreignKey: "user_id",
  as: "wishlist",
});

Wishlist.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

Product.hasMany(Wishlist, {
  foreignKey: "product_id",
  as: "wishlistItems",
});

Wishlist.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});
User.hasOne(Cart, {
  foreignKey: "user_id",
  as: "cart",
});

Cart.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

Cart.hasMany(CartItem, {
  foreignKey: "cart_id",
  as: "items",
  onDelete: "CASCADE",
});

CartItem.belongsTo(Cart, {
  foreignKey: "cart_id",
  as: "cart",
});

Product.hasMany(CartItem, {
  foreignKey: "product_id",
  as: "cartItems",
});

CartItem.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

User.hasMany(Order, {
  foreignKey: "user_id",
  as: "orders",
});

Order.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

Order.hasMany(OrderItem, {
  foreignKey: "order_id",
  as: "items",
  onDelete: "CASCADE",
});

OrderItem.belongsTo(Order, {
  foreignKey: "order_id",
  as: "order",
});

Product.hasMany(OrderItem, {
  foreignKey: "product_id",
  as: "orderItems",
});

OrderItem.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});
User.hasMany(Address, {
  foreignKey: "user_id",
  as: "addresses",
});

Address.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

export {
  Category,
  Product,
  ProductCategory,
  Address,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Wishlist,
  User,
};
