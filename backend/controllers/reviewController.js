import { Op } from "sequelize";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// ============================================================================
// ADMIN CONTROLLERS
// ============================================================================

// Admin: Get all reviews with search, filter, and pagination
export const getAllReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      rating,
      product_id,
      user_id,
    } = req.query;

    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const offset = (currentPage - 1) * perPage;

    const where = {};

    // Status filter
    if (
      status &&
      ["pending", "approved", "rejected"].includes(status.toLowerCase())
    ) {
      where.status = status.toLowerCase();
    }

    // Rating filter
    if (rating && !isNaN(parseInt(rating, 10))) {
      where.rating = parseInt(rating, 10);
    }

    // Product filter
    if (product_id) {
      where.product_id = product_id;
    }

    // User filter
    if (user_id) {
      where.user_id = user_id;
    }

    // Search filter across title, comment, customer name/email, product title
    if (search && search.trim()) {
      const searchValue = `%${search.trim()}%`;
      where[Op.or] = [
        { title: { [Op.like]: searchValue } },
        { comment: { [Op.like]: searchValue } },
        { "$user.name$": { [Op.like]: searchValue } },
        { "$user.email$": { [Op.like]: searchValue } },
        { "$product.title$": { [Op.like]: searchValue } },
      ];
    }

    const { count, rows } = await Review.findAndCountAll({
      where,
      subQuery: false,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
          required: false,
        },
        {
          model: Product,
          as: "product",
          attributes: ["product_id", "title", "image", "price"],
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
      limit: perPage,
      offset,
      distinct: true,
      col: "review_id",
    });

    const totalPages = Math.ceil(count / perPage) || 1;

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        totalReviews: count,
        totalPages,
        currentPage,
        limit: perPage,
      },
    });
  } catch (error) {
    console.error("Admin Get All Reviews Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

// Admin: Get single review by ID
export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: Product,
          as: "product",
          attributes: ["product_id", "title", "image", "price"],
        },
      ],
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Admin Get Review By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch review details",
      error: error.message,
    });
  }
};

// Admin: Update review moderation status
export const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (
      !status ||
      !["pending", "approved", "rejected"].includes(status.toLowerCase())
    ) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'pending', 'approved', or 'rejected'",
      });
    }

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.status = status.toLowerCase();
    await review.save();

    return res.status(200).json({
      success: true,
      message: `Review status updated to ${review.status}`,
      data: review,
    });
  } catch (error) {
    console.error("Admin Update Review Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update review status",
      error: error.message,
    });
  }
};

// Admin: Delete review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    await review.destroy();

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Admin Delete Review Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message,
    });
  }
};

// ============================================================================
// CUSTOMER / PUBLIC CONTROLLERS
// ============================================================================

// Customer: Submit a new product review
export const createCustomerReview = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    // Validate product existence
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Duplicate review protection: Check if user has already submitted a review for this product
    const existingReview = await Review.findOne({
      where: {
        user_id,
        product_id: productId,
      },
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product.",
      });
    }

    // Validate rating
    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    // Validate title
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Review title is required",
      });
    }

    // Validate comment
    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Review comment is required",
      });
    }

    const review = await Review.create({
      user_id,
      product_id: productId,
      rating: parsedRating,
      title: title.trim(),
      comment: comment.trim(),
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully and is awaiting approval.",
      data: review,
    });
  } catch (error) {
    console.error("Create Customer Review Error:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to submit review",
      error: error.message,
    });
  }
};

// Customer: Check if authenticated user has submitted a review for this product
export const getMyProductReview = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { productId } = req.params;

    const review = await Review.findOne({
      where: {
        user_id,
        product_id: productId,
      },
    });

    return res.status(200).json({
      success: true,
      hasReviewed: !!review,
      review: review || null,
    });
  } catch (error) {
    console.error("Get My Product Review Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer review status",
      error: error.message,
    });
  }
};

// Public: Get all approved reviews for a product
export const getProductApprovedReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    const offset = (currentPage - 1) * perPage;

    const { count, rows } = await Review.findAndCountAll({
      where: {
        product_id: productId,
        status: "approved",
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: perPage,
      offset,
    });

    // Calculate rating distribution & average from all approved reviews
    const allApproved = await Review.findAll({
      where: {
        product_id: productId,
        status: "approved",
      },
      attributes: ["rating"],
      raw: true,
    });

    const totalApproved = allApproved.length;
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    allApproved.forEach((r) => {
      if (ratingCounts[r.rating] !== undefined) {
        ratingCounts[r.rating]++;
      }
      sum += r.rating;
    });

    const averageRating =
      totalApproved > 0 ? (sum / totalApproved).toFixed(1) : 0;

    const ratingPercentages = {
      5:
        totalApproved > 0
          ? Math.round((ratingCounts[5] / totalApproved) * 100)
          : 0,
      4:
        totalApproved > 0
          ? Math.round((ratingCounts[4] / totalApproved) * 100)
          : 0,
      3:
        totalApproved > 0
          ? Math.round((ratingCounts[3] / totalApproved) * 100)
          : 0,
      2:
        totalApproved > 0
          ? Math.round((ratingCounts[2] / totalApproved) * 100)
          : 0,
      1:
        totalApproved > 0
          ? Math.round((ratingCounts[1] / totalApproved) * 100)
          : 0,
    };

    return res.status(200).json({
      success: true,
      data: rows,
      meta: {
        averageRating: parseFloat(averageRating),
        totalReviews: totalApproved,
        ratingCounts,
        ratingPercentages,
        totalPages: Math.ceil(count / perPage) || 1,
        currentPage,
      },
    });
  } catch (error) {
    console.error("Get Product Approved Reviews Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product reviews",
      error: error.message,
    });
  }
};
