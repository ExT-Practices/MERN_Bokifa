import Product from "../models/Product.js";
import Category from "../models/Category.js";
import ProductCategory from "../models/ProductCategory.js";
import { Op } from "sequelize";
import Wishlist from "../models/Wishlist.js";
// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const {
      category_ids,
      title,
      slug,
      author,
      description,
      price,
      compare_price,
      sku,
      stock_quantity,
    } = req.body;

    // VALIDATE CATEGORY IDS

    if (!category_ids) {
      return res.status(400).json({
        success: false,
        message: "category_ids is required",
      });
    }

    let parsedCategoryIds;

    try {
      parsedCategoryIds = JSON.parse(category_ids);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "category_ids must be a valid JSON array",
      });
    }

    if (!Array.isArray(parsedCategoryIds) || parsedCategoryIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one category is required",
      });
    }

    // Remove duplicate category IDs
    parsedCategoryIds = [...new Set(parsedCategoryIds.map((id) => Number(id)))];

    // CHECK CATEGORIES

    const categories = await Category.findAll({
      where: {
        category_id: parsedCategoryIds,
        is_active: true,
      },
    });

    if (categories.length !== parsedCategoryIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more categories not found",
      });
    }

    // CHECK SKU

    const existingProduct = await Product.findOne({
      where: {
        sku,
      },
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Product with this SKU already exists",
      });
    }

    // HANDLE IMAGES

    const mainImage = req.files?.image?.[0] || null;

    const additionalImages = req.files?.images || [];

    // CREATE PRODUCT

    const product = await Product.create({
      // Temporary legacy category_id
      category_id: parsedCategoryIds[0],

      title,
      slug,
      author,
      description,
      price,
      compare_price,
      sku,
      stock_quantity: stock_quantity || 0,

      image: mainImage ? `/uploads/products/${mainImage.filename}` : null,

      images: additionalImages.map(
        (file) => `/uploads/products/${file.filename}`,
      ),
    });

    // CREATE PRODUCT CATEGORIES
    await ProductCategory.bulkCreate(
      parsedCategoryIds.map((category_id) => ({
        product_id: product.product_id,
        category_id,
      })),
    );

    // GET CREATED PRODUCT

    const createdProduct = await Product.findOne({
      where: {
        product_id: product.product_id,
      },

      include: [
        {
          model: Category,
          as: "categories",

          attributes: ["category_id", "name", "is_active"],

          through: {
            attributes: [],
          },
        },
      ],
    });

    // RESPONSE

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: createdProduct,
    });
  } catch (error) {
    console.error("Create Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// GET ALL PRODUCTS
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = "",
      category_id,
      sort = "newest",
    } = req.query;

    // Pagination
    const currentPage = Math.max(parseInt(page) || 1, 1);
    const productsPerPage = Math.min(Math.max(parseInt(limit) || 12, 1), 100);

    const offset = (currentPage - 1) * productsPerPage;

    // Product filters
    const whereCondition = {};

    if (req.query.include_inactive !== "true") {
      whereCondition.is_active = true;
    }

    // Search by title or author
    if (search.trim()) {
      whereCondition[Op.or] = [
        {
          title: {
            [Op.like]: `%${search.trim()}%`,
          },
        },
        {
          author: {
            [Op.like]: `%${search.trim()}%`,
          },
        },
      ];
    }

    // Category filter
    const categoryFilter = {};

    if (category_id) {
      categoryFilter.category_id = category_id;
    }

    // Sorting
    let order = [["created_at", "DESC"]];

    switch (sort) {
      case "oldest":
        order = [["created_at", "ASC"]];
        break;

      case "price_asc":
        order = [["price", "ASC"]];
        break;

      case "price_desc":
        order = [["price", "DESC"]];
        break;

      case "name_asc":
        order = [["title", "ASC"]];
        break;

      case "name_desc":
        order = [["title", "DESC"]];
        break;

      case "newest":
      default:
        order = [["created_at", "DESC"]];
        break;
    }

    const { count, rows } = await Product.findAndCountAll({
      where: whereCondition,

      include: [
        {
          model: Category,
          as: "categories",
          attributes: ["category_id", "name", "is_active"],
          through: {
            attributes: [],
          },
          where:
            Object.keys(categoryFilter).length > 0 ? categoryFilter : undefined,
          required: Object.keys(categoryFilter).length > 0,
        },
      ],

      distinct: true,

      order,

      limit: productsPerPage,
      offset,
    });

    let wishlistProductIds = new Set();

    if (req.user) {
      const wishlistItems = await Wishlist.findAll({
        where: {
          user_id: req.user.id,
        },
        attributes: ["product_id"],
      });

      wishlistProductIds = new Set(
        wishlistItems.map((item) => item.product_id),
      );
    }

    const productsWithWishlistStatus = rows.map((product) => {
      const productData = product.toJSON();

      return {
        ...productData,
        isWishlisted: wishlistProductIds.has(product.product_id),
      };
    });

    const totalPages = Math.ceil(count / productsPerPage);

    return res.status(200).json({
      success: true,

      pagination: {
        currentPage,
        limit: productsPerPage,
        totalProducts: count,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },

      data: productsWithWishlistStatus,
    });
  } catch (error) {
    console.error("Get Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// GET SINGLE PRODUCT
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      where: {
        product_id: id,
        is_active: true,
      },

      include: [
        {
          model: Category,
          as: "categories",
          attributes: ["category_id", "name", "is_active"],

          through: {
            attributes: [],
          },

          where: {
            is_active: true,
          },

          required: false,
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  const transaction = await Product.sequelize.transaction();

  try {
    const { id } = req.params;

    const {
      category_ids,
      title,
      slug,
      author,
      description,
      price,
      compare_price,
      sku,
      stock_quantity,
      is_active,
    } = req.body;

    // FIND PRODUCT

    const product = await Product.findByPk(id);

    if (!product) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // CHECK SKU

    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({
        where: {
          sku,
          product_id: {
            [Op.ne]: id,
          },
        },
      });

      if (existingProduct) {
        await transaction.rollback();

        return res.status(409).json({
          success: false,
          message: "Product with this SKU already exists",
        });
      }
    }

    // CATEGORY UPDATE

    let parsedCategoryIds = null;

    if (category_ids !== undefined) {
      try {
        parsedCategoryIds = JSON.parse(category_ids);
      } catch (error) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: "category_ids must be a valid JSON array",
        });
      }

      if (!Array.isArray(parsedCategoryIds) || parsedCategoryIds.length === 0) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: "At least one category is required",
        });
      }

      parsedCategoryIds = [
        ...new Set(parsedCategoryIds.map((categoryId) => Number(categoryId))),
      ];

      const categories = await Category.findAll({
        where: {
          category_id: parsedCategoryIds,
          is_active: true,
        },
      });

      if (categories.length !== parsedCategoryIds.length) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: "One or more categories not found",
        });
      }

      // Keep old category_id temporarily
      product.category_id = parsedCategoryIds[0];
    }

    // UPDATE PRODUCT DETAILS

    if (title !== undefined) {
      product.title = title;
    }

    if (slug !== undefined) {
      product.slug = slug;
    }

    if (author !== undefined) {
      product.author = author;
    }

    if (description !== undefined) {
      product.description = description;
    }

    if (price !== undefined) {
      product.price = price;
    }

    if (compare_price !== undefined) {
      product.compare_price = compare_price;
    }

    if (sku !== undefined) {
      product.sku = sku;
    }

    if (stock_quantity !== undefined) {
      product.stock_quantity = stock_quantity;
    }

    if (is_active !== undefined) {
      product.is_active = is_active;
    }

    // UPDATE MAIN IMAGE

    const mainImage = req.files?.image?.[0];

    if (mainImage) {
      product.image = `/uploads/products/${mainImage.filename}`;
    }

    // UPDATE ADDITIONAL IMAGES

    const additionalImages = req.files?.images || [];

    if (additionalImages.length > 0) {
      product.images = additionalImages.map(
        (file) => `/uploads/products/${file.filename}`,
      );
    }

    // SAVE PRODUCT

    await product.save({
      transaction,
    });

    // UPDATE CATEGORIES

    if (parsedCategoryIds !== null) {
      await ProductCategory.destroy({
        where: {
          product_id: product.product_id,
        },
        transaction,
      });

      await ProductCategory.bulkCreate(
        parsedCategoryIds.map((category_id) => ({
          product_id: product.product_id,
          category_id,
        })),
        {
          transaction,
        },
      );
    }

    // GET UPDATED PRODUCT

    const updatedProduct = await Product.findOne({
      where: {
        product_id: product.product_id,
      },

      include: [
        {
          model: Category,
          as: "categories",

          attributes: ["category_id", "name", "is_active"],

          through: {
            attributes: [],
          },
        },
      ],

      transaction,
    });

    await transaction.commit();

    // RESPONSE

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Update Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  const transaction = await Product.sequelize.transaction();

  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Remove category relationships
    await ProductCategory.destroy({
      where: {
        product_id: product.product_id,
      },
      transaction,
    });

    // Soft delete product
    product.is_active = false;

    await product.save({
      transaction,
    });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Delete Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
