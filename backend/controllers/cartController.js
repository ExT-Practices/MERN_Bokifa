import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";

// Add product to cart
export const addToCart = async (req, res) => {
  try {
    const { product_id } = req.params;
    const user_id = req.user.id;

    // Optional quantity from request body
    const requestedQuantity = parseInt(req.body.quantity) || 1;

    if (requestedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Check product
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

    // Check stock
    if (product.stock_quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    // Find or create active cart
    let cart = await Cart.findOne({
      where: {
        user_id,
      },
    });

    if (!cart) {
      cart = await Cart.create({
        user_id,
        status: "active",
      });
    } else if (cart.status !== "active") {
      cart.status = "active";
      await cart.save();
    }

    // Check if product already exists in cart
    let cartItem = await CartItem.findOne({
      where: {
        cart_id: cart.cart_id,
        product_id,
      },
    });

    if (cartItem) {
      const newQuantity = cartItem.quantity + requestedQuantity;

      // Prevent quantity from exceeding stock
      if (newQuantity > product.stock_quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock_quantity} items available in stock`,
        });
      }

      cartItem.quantity = newQuantity;

      await cartItem.save();
    } else {
      // Prevent requested quantity from exceeding stock
      if (requestedQuantity > product.stock_quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock_quantity} items available in stock`,
        });
      }

      cartItem = await CartItem.create({
        cart_id: cart.cart_id,
        product_id,
        quantity: requestedQuantity,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      data: {
        cart_id: cart.cart_id,
        cart_item_id: cartItem.cart_item_id,
        product_id: cartItem.product_id,
        quantity: cartItem.quantity,
      },
    });
  } catch (error) {
    console.error("Add To Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Get logged-in user's cart
export const getCart = async (req, res) => {
  try {
    const user_id = req.user.id;

    // Find active cart
    const cart = await Cart.findOne({
      where: {
        user_id,
        status: "active",
      },
    });

    // Cart doesn't exist
    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        data: {
          cart_id: null,
          items: [],
          totalItems: 0,
          totalAmount: 0,
        },
      });
    }

    // Get cart items with product details
    const cartItems = await CartItem.findAll({
      where: {
        cart_id: cart.cart_id,
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

    let totalItems = 0;
    let totalAmount = 0;

    const items = cartItems.map((item) => {
      const quantity = item.quantity;
      const price = Number(item.product.price);

      const subtotal = price * quantity;

      totalItems += quantity;
      totalAmount += subtotal;

      return {
        cart_item_id: item.cart_item_id,
        product_id: item.product_id,
        quantity,
        price,
        subtotal,
        product: item.product,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        cart_id: cart.cart_id,
        items,
        totalItems,
        totalAmount: Number(totalAmount.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Get Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { product_id } = req.params;
    const user_id = req.user.id;

    const quantity = parseInt(req.body.quantity);

    // Validate quantity
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Find user's active cart
    const cart = await Cart.findOne({
      where: {
        user_id,
        status: "active",
      },
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find product
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

    // Check stock
    if (quantity > product.stock_quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock_quantity} items available in stock`,
      });
    }

    // Find cart item
    const cartItem = await CartItem.findOne({
      where: {
        cart_id: cart.cart_id,
        product_id,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product is not in cart",
      });
    }

    // Update quantity
    cartItem.quantity = quantity;

    await cartItem.save();

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully",
      data: {
        cart_item_id: cartItem.cart_item_id,
        product_id: cartItem.product_id,
        quantity: cartItem.quantity,
      },
    });
  } catch (error) {
    console.error("Update Cart Item Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Remove product from cart
export const removeFromCart = async (req, res) => {
  try {
    const { product_id } = req.params;
    const user_id = req.user.id;

    // Find user's active cart
    const cart = await Cart.findOne({
      where: {
        user_id,
        status: "active",
      },
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find cart item
    const cartItem = await CartItem.findOne({
      where: {
        cart_id: cart.cart_id,
        product_id,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product is not in cart",
      });
    }

    // Remove cart item
    await cartItem.destroy();

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
    });
  } catch (error) {
    console.error("Remove From Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
