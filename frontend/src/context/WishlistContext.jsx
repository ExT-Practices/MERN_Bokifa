import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getWishlist,
  addToWishlist as addWishlistApi,
  removeFromWishlist as removeWishlistApi,
} from "../api/wishlistApi";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistUpdatingId, setWishlistUpdatingId] = useState(null);

  const loadWishlist = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setWishlist([]);
      return;
    }

    try {
      setWishlistLoading(true);

      const response = await getWishlist();

      if (response?.success) {
        setWishlist(response.data || []);
      } else {
        setWishlist([]);
      }
    } catch (error) {
      console.error("Failed to load wishlist:", error);

      if (error?.response?.status === 401) {
        setWishlist([]);
      }
    } finally {
      setWishlistLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();

    const handleAuthChange = () => {
      loadWishlist();
    };

    window.addEventListener("bokifa-auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("bokifa-auth-changed", handleAuthChange);
    };
  }, [loadWishlist]);

  const isWishlisted = useCallback(
    (productId) => {
      return wishlist.some((item) => {
        const id = item?.product_id ?? item?.product?.product_id;

        return Number(id) === Number(productId);
      });
    },
    [wishlist],
  );

  const addToWishlist = async (productId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/account/login";
      return;
    }

    try {
      setWishlistUpdatingId(productId);

      const response = await addWishlistApi(productId);

      if (response?.success) {
        await loadWishlist();
      }

      return response;
    } catch (error) {
      console.error("Failed to add to wishlist:", error);

      // Product already exists in wishlist
      if (error?.response?.status === 409) {
        await loadWishlist();
      }

      throw error;
    } finally {
      setWishlistUpdatingId(null);
    }
  };

  const removeFromWishlist = async (productId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setWishlist([]);
      return;
    }

    try {
      setWishlistUpdatingId(productId);

      const response = await removeWishlistApi(productId);

      if (response?.success) {
        setWishlist((prev) =>
          prev.filter((item) => {
            const id = item?.product_id ?? item?.product?.product_id;

            return Number(id) !== Number(productId);
          }),
        );
      }

      return response;
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      throw error;
    } finally {
      setWishlistUpdatingId(null);
    }
  };

  const toggleWishlist = async (productId) => {
    if (isWishlisted(productId)) {
      return removeFromWishlist(productId);
    }

    return addToWishlist(productId);
  };

  const value = {
    wishlist,
    wishlistLoading,
    wishlistUpdatingId,

    loadWishlist,
    isWishlisted,

    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }

  return context;
};

export default WishlistContext;
