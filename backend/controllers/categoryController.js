import Category from "../models/Category.js";
import Product from "../models/Product.js";
// GET ALL CATEGORIES
export const getCategories = async (req, res) => {
  try {
    const where = {};
    if (req.query.include_inactive !== "true") {
      where.is_active = true;
    }

    const categories = await Category.findAll({
      where,
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Get Categories Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// GET SINGLE CATEGORY
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: {
        category_id: id,
        is_active: true,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get Category Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// CREATE CATEGORY
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const existingCategory = await Category.findOne({
      where: {
        name: name.trim(),
      },
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name: name.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Create Category Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// UPDATE CATEGORY
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, is_active } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category name cannot be empty",
        });
      }

      if (name.trim() !== category.name) {
        const existingCategory = await Category.findOne({
          where: {
            name: name.trim(),
          },
        });

        if (existingCategory) {
          return res.status(409).json({
            success: false,
            message: "Category already exists",
          });
        }

        category.name = name.trim();
      }
    }

    if (is_active !== undefined) {
      category.is_active = is_active;
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Update Category Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// DELETE CATEGORY
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category.is_active = false;

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category deactivated successfully",
    });
  } catch (error) {
    console.error("Delete Category Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// GET PRODUCTS BY CATEGORY
export const getCategoryProducts = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: {
        category_id: id,
        is_active: true,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const products = await category.getProducts({
      where: {
        is_active: true,
      },

      include: [
        {
          model: Category,
          as: "categories",
          attributes: ["category_id", "name"],

          through: {
            attributes: [],
          },
        },
      ],

      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,

      category: {
        category_id: category.category_id,
        name: category.name,
      },

      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get Category Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
