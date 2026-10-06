import dotenv from "dotenv";
import sequelize from "./config/db.js";
import Product from "./models/Product.js";

import { Books } from "./data/books.js";

dotenv.config();

const seedProducts = async () => {
  try {
    await sequelize.authenticate();

    console.log("Database Connected");

    for (const book of Books) {
      const stockQuantity = book.stock === "in" ? 10 : 0;

      // MAIN IMAGE PATH
      const mainImage = book.image
        ? `/uploads/products/${book.image.split("/").pop()}`
        : null;

      // ADDITIONAL IMAGE PATHS
      const additionalImages = [book.image, book.secondaryImage]
        .filter(Boolean)
        .map((image) => `/uploads/products/${image.split("/").pop()}`);

      const sku = `BOOK-${String(book.id).padStart(3, "0")}`;

      const [product, created] = await Product.findOrCreate({
        where: {
          sku,
        },

        defaults: {
          category_id: 1,

          title: book.title,

          slug: `${book.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")}-${book.id}`,

          author: book.author,

          description: `${book.title} by ${book.author}`,

          price: book.price,

          compare_price: null,

          sku,

          stock_quantity: stockQuantity,

          is_active: true,

          image: mainImage,

          images: additionalImages,
        },
      });

      // UPDATE EXISTING PRODUCTS
      // This fixes image paths for products already in database.
      if (!created) {
        await product.update({
          image: mainImage,
          images: additionalImages,
          stock_quantity: stockQuantity,
        });
      }

      console.log(`${created ? "Created" : "Updated"}: ${product.title}`);
    }

    console.log("Products Seeded Successfully");

    await sequelize.close();

    process.exit(0);
  } catch (error) {
    console.error("Product Seeder Error:", error);

    await sequelize.close();

    process.exit(1);
  }
};

seedProducts();
