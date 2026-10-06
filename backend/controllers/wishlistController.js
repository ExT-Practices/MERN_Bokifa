import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

// Add product to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.params;
    const user_id = req.user.id;

    // Check product exists and is active
    const product = await Product.findOne({
      where: {
        product_id,
        is_active: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if already in wishlist
    const existingWishlist = await Wishlist.findOne({
      where: {
        user_id,
        product_id,
      },
    });

    if (existingWishlist) {
      return res.status(409).json({
        success: false,
        message: "Product already exists in wishlist",
      });
    }

    // Add to wishlist
    const wishlist = await Wishlist.create({
      user_id,
      product_id,
    });

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      data: wishlist,
    });
  } catch (error) {
    console.error("Add Wishlist Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Get logged-in user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const user_id = req.user.id;

    const wishlist = await Wishlist.findAll({
      where: {
        user_id,
      },

      include: [
        {
          model: Product,
          as: "product",
          where: {
            is_active: true,
          },
        },
      ],

      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: wishlist.length,
      data: wishlist,
    });
  } catch (error) {
    console.error("Get Wishlist Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { product_id } = req.params;
    const user_id = req.user.id;

    const wishlist = await Wishlist.findOne({
      where: {
        user_id,
        product_id,
      },
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Product is not in wishlist",
      });
    }

    await wishlist.destroy();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("Remove Wishlist Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
