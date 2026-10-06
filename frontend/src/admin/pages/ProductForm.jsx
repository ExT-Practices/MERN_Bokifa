import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getProductById, createProduct, updateProduct } from "../../api/productApi";
import { getCategories } from "../../api/categoryApi";
import ToastContainer from "../components/ToastContainer";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toasts, setToasts] = useState([]);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [sku, setSku] = useState("");
  const [stockQuantity, setStockQuantity] = useState("10");
  const [isActive, setIsActive] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Image Upload States
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);

  const addToast = (message, type = "success") => {
    const toastId = Date.now();
    setToasts((prev) => [...prev, { id: toastId, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 4000);
  };

  const removeToast = (toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  // Auto-generate slug from title
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEditMode) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

  // Fetch initial data
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      setError("");

      // Fetch Categories
      try {
        const catRes = await getCategories({ include_inactive: true });
        if (catRes.success) {
          setCategories(catRes.data || []);
        }
      } catch (err) {
        console.error("Fetch categories error:", err);
      }

      // Fetch Product if edit mode
      if (isEditMode) {
        try {
          const prodRes = await getProductById(id);
          if (prodRes.success && prodRes.data) {
            const p = prodRes.data;
            setTitle(p.title || "");
            setSlug(p.slug || "");
            setAuthor(p.author || "");
            setDescription(p.description || "");
            setPrice(p.price || "");
            setComparePrice(p.compare_price || "");
            setSku(p.sku || "");
            setStockQuantity(p.stock_quantity !== undefined ? p.stock_quantity : 0);
            setIsActive(p.is_active !== undefined ? p.is_active : true);

            if (p.categories && Array.isArray(p.categories)) {
              setSelectedCategories(p.categories.map((c) => c.category_id));
            } else if (p.category_id) {
              setSelectedCategories([p.category_id]);
            }

            if (p.image) {
              setMainImagePreview(p.image.startsWith("http") ? p.image : `http://localhost:5000${p.image}`);
            }

            if (p.images && Array.isArray(p.images)) {
              setAdditionalPreviews(
                p.images.map((img) => (img.startsWith("http") ? img : `http://localhost:5000${img}`))
              );
            }
          } else {
            setError("Product not found.");
          }
        } catch (err) {
          console.error("Fetch product error:", err);
          setError("Failed to fetch product details.");
        }
      }

      setLoading(false);
    };

    initData();
  }, [id, isEditMode]);

  // Handle Main Image change
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle Additional Images change
  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setAdditionalFiles(files);
      const previews = files.map((file) => URL.createObjectURL(file));
      setAdditionalPreviews(previews);
    }
  };

  // Category toggle
  const handleCategoryToggle = (catId) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Product Title is required.");
      return;
    }
    if (!price || Number(price) <= 0) {
      setError("Valid Product Price is required.");
      return;
    }
    if (!sku.trim()) {
      setError("SKU is required.");
      return;
    }
    if (selectedCategories.length === 0) {
      setError("Please select at least one category.");
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("slug", slug.trim() || title.toLowerCase().replace(/\s+/g, "-"));
    formData.append("author", author.trim());
    formData.append("description", description.trim());
    formData.append("price", price);
    formData.append("compare_price", comparePrice || 0);
    formData.append("sku", sku.trim());
    formData.append("stock_quantity", stockQuantity || 0);
    formData.append("is_active", isActive);
    formData.append("category_ids", JSON.stringify(selectedCategories));

    if (mainImageFile) {
      formData.append("image", mainImageFile);
    }

    if (additionalFiles.length > 0) {
      additionalFiles.forEach((file) => {
        formData.append("images", file);
      });
    }

    try {
      let res;
      if (isEditMode) {
        res = await updateProduct(id, formData);
      } else {
        res = await createProduct(formData);
      }

      if (res.success) {
        addToast(
          `Product "${title}" ${isEditMode ? "updated" : "created"} successfully!`,
          "success"
        );
        setTimeout(() => {
          navigate("/admin/products");
        }, 1200);
      } else {
        setError(res.message || "Failed to save product.");
      }
    } catch (err) {
      console.error("Save product error:", err);
      setError(
        err.response?.data?.message || "Failed to save product. Check network or parameters."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading product details...</p>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            {isEditMode ? `Edit Product #${id}` : "Create New Product"}
          </h1>
          <p className="admin-page-subtitle">
            {isEditMode
              ? "Update product pricing, stock, description, and images"
              : "Add a new book/item to the Bokifa online store catalog"}
          </p>
        </div>
        <div>
          <Link to="/admin/products" className="btn btn-outline-secondary">
            <i className="fa-solid fa-arrow-left me-1"></i> Back to Products
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          <i className="fa-solid fa-triangle-exclamation me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError("")}></button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Main Product Info Form */}
          <div className="col-12 col-lg-8">
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">General Information</h2>
              </div>
              <div className="admin-card-body">
                <div className="mb-3">
                  <label className="form-label font-weight-bold text-dark">
                    Product Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. The Great Gatsby"
                    value={title}
                    onChange={handleTitleChange}
                    required
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label font-weight-bold text-dark">Slug</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="the-great-gatsby"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label font-weight-bold text-dark">Author Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. F. Scott Fitzgerald"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label font-weight-bold text-dark">Description</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Enter book description, summary, or highlights..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">Pricing & Inventory</h2>
              </div>
              <div className="admin-card-body">
                <div className="row g-3">
                  <div className="col-12 col-md-4">
                    <label className="form-label font-weight-bold text-dark">
                      Regular Price (₹) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      placeholder="499.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label font-weight-bold text-dark">
                      Compare Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      placeholder="699.00"
                      value={comparePrice}
                      onChange={(e) => setComparePrice(e.target.value)}
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label font-weight-bold text-dark">
                      SKU Code <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="BK-GATSBY-01"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label font-weight-bold text-dark">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      placeholder="50"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                    />
                  </div>

                  <div className="col-12 col-md-6 d-flex align-items-center pt-4">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="activeSwitch"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                      />
                      <label className="form-check-label font-weight-bold text-dark ms-2" htmlFor="activeSwitch">
                        Active in Catalog
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Categories & Images */}
          <div className="col-12 col-lg-4">
            {/* Category Selector */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">
                  Categories <span className="text-danger">*</span>
                </h2>
              </div>
              <div className="admin-card-body">
                {categories.length === 0 ? (
                  <p className="text-muted small m-0">No categories found.</p>
                ) : (
                  <div className="d-flex flex-column gap-2" style={{ maxHeight: "220px", overflowY: "auto" }}>
                    {categories.map((cat) => (
                      <div key={cat.category_id} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`cat-${cat.category_id}`}
                          checked={selectedCategories.includes(cat.category_id)}
                          onChange={() => handleCategoryToggle(cat.category_id)}
                        />
                        <label className="form-check-label text-dark" htmlFor={`cat-${cat.category_id}`}>
                          {cat.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main Cover Image Upload */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">Main Cover Image</h2>
              </div>
              <div className="admin-card-body text-center">
                {mainImagePreview ? (
                  <div className="mb-3 position-relative d-inline-block">
                    <img
                      src={mainImagePreview}
                      alt="Cover Preview"
                      className="rounded border shadow-sm object-fit-cover"
                      style={{ width: "140px", height: "180px" }}
                    />
                  </div>
                ) : (
                  <div className="p-4 border border-dashed rounded bg-light mb-3 text-muted">
                    <i className="fa-solid fa-cloud-arrow-up fs-2 mb-2 text-secondary"></i>
                    <div className="small">No image selected</div>
                  </div>
                )}

                <div>
                  <input
                    type="file"
                    className="form-control form-control-sm"
                    accept="image/*"
                    onChange={handleMainImageChange}
                  />
                  <small className="text-muted d-block mt-1">Recommended format: JPG/PNG</small>
                </div>
              </div>
            </div>

            {/* Additional Images Upload */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">Additional Gallery Images</h2>
              </div>
              <div className="admin-card-body">
                {additionalPreviews.length > 0 && (
                  <div className="d-flex gap-2 flex-wrap mb-3">
                    {additionalPreviews.map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        alt={`Gallery ${idx}`}
                        className="rounded border object-fit-cover"
                        style={{ width: "60px", height: "75px" }}
                      />
                    ))}
                  </div>
                )}

                <input
                  type="file"
                  className="form-control form-control-sm"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImagesChange}
                />
                <small className="text-muted d-block mt-1">Select up to 5 secondary images</small>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-grid gap-2">
              <button
                type="submit"
                className="btn btn-primary py-2.5 font-weight-bold shadow-sm"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Saving Product...
                  </>
                ) : isEditMode ? (
                  "Update Product"
                ) : (
                  "Create Product"
                )}
              </button>

              <Link to="/admin/products" className="btn btn-light border text-dark">
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
