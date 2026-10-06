import React, { useEffect, useState } from "react";
import CheckoutHeader from "../components/checkout/CheckoutHeader";
import ContactSection from "../components/checkout/ContactSection";
import DeliverySection from "../components/checkout/DeliverySection";
import ShippingMethod from "../components/checkout/ShippingMethod";
import PaymentSection from "../components/checkout/PaymentSection";
import OrderSummary from "../components/checkout/OrderSummary";
import { useCart } from "../context/CartContext";
import { createAddress } from "../api/addressApi";
import { getProfile } from "../api/authApi";
import api from "../api/axios";

const CheckoutPage = () => {
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    emailNews: false,
    phone: "",
    country: "Australia",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    suburb: "",
    state: "",
    postcode: "",
    saveInfo: false,
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
    useShippingAsBilling: true,
  });

  const { cart, cartLoading, loadCart } = useCart();

  const [errors, setErrors] = useState({});
  const [discountApplied, setDiscountApplied] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  /*
   * Load logged-in user's profile
   *
   * Phone number is required by the address API,
   * but the existing checkout UI does not have a phone field.
   * So we take the phone number from the user's profile.
   */
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await getProfile();

        const profile = response?.data || response?.user || response;

        if (profile) {
          setFormData((prev) => ({
            ...prev,
            emailOrPhone: profile.email || prev.emailOrPhone,
            phone: profile.phone || prev.phone,
          }));
        }
      } catch (error) {
        console.error("Load checkout profile error:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = "Enter an email or mobile phone number";
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Enter a first name";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is missing from your profile";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Enter a last name";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Enter an address";
    }

    if (!formData.suburb.trim()) {
      newErrors.suburb = "Enter a suburb";
    }

    if (!formData.state) {
      newErrors.state = "Select a state / territory";
    }

    if (!formData.postcode.trim()) {
      newErrors.postcode = "Enter a postcode";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handlePayNow = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!cart?.items?.length) {
      alert("Your cart is empty.");
      return;
    }

    try {
      /*
       * 1. Create / save shipping address
       */

      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      let orderPayload;

      const shippingAddress = {
        full_name:
          `${formData.firstName || ""} ${formData.lastName || ""}`.trim(),
        phone: formData.phone,
        address_line1: formData.address,
        address_line2: formData.apartment || null,
        city: formData.suburb,
        state: formData.state,
        postal_code: formData.postcode,
        country: formData.country || "India",
      };

      // ---------------------------------------------
      // Save address ONLY when checkbox is checked
      // ---------------------------------------------
      if (formData.saveInfo) {
        const addressResponse = await createAddress({
          ...shippingAddress,
          address_type: "home",
          is_default: true,
        });

        const addressId =
          addressResponse?.data?.address_id || addressResponse?.address_id;

        if (!addressId) {
          throw new Error("Failed to save shipping address");
        }

        orderPayload = {
          address_id: addressId,
        };
      } else {
        // ---------------------------------------------
        // Do NOT save address in user's account
        // ---------------------------------------------
        orderPayload = {
          shipping_address: shippingAddress,
        };
      }

      const response = await api.post("/payments/create-order", orderPayload);

      const paymentData = response?.data?.data;

      if (!paymentData?.razorpay_order_id) {
        alert("Unable to create payment order.");
        return;
      }

      console.log("Razorpay Order:", paymentData.razorpay_order_id);

      /*
       * 3. Check Razorpay Checkout
       */

      if (!window.Razorpay) {
        alert("Razorpay Checkout failed to load. Please refresh the page.");

        return;
      }

      /*
       * 4. Open Razorpay
       */

      const options = {
        key: paymentData.razorpay_key_id,

        amount: paymentData.amount,

        currency: paymentData.currency,

        name: "Bokifa",

        description: `Order ${paymentData.order_number}`,

        order_id: paymentData.razorpay_order_id,

        handler: async function (paymentResponse) {
          try {
            console.log("Razorpay Payment Response:", paymentResponse);

            /*
             * 5. Verify payment on backend
             */

            const verifyResponse = await api.post("/payments/verify", {
              razorpay_payment_id: paymentResponse.razorpay_payment_id,

              razorpay_order_id: paymentResponse.razorpay_order_id,

              razorpay_signature: paymentResponse.razorpay_signature,
            });

            if (verifyResponse?.data?.success) {
              /*
               * Backend has already:
               * - marked payment as paid
               * - confirmed order
               * - reduced product stock
               * - removed ordered items from cart
               *
               * Refresh frontend cart as well.
               */

              await loadCart();

              setPaymentSuccess(true);

              console.log("Payment verified successfully.");
            } else {
              alert(
                verifyResponse?.data?.message || "Payment verification failed.",
              );
            }
          } catch (error) {
            console.error("Payment verification error:", error);

            alert(
              error?.response?.data?.message || "Payment verification failed.",
            );
          }
        },

        prefill: {
          name: fullName,

          email: formData.emailOrPhone,

          contact: formData.phone,
        },

        theme: {
          color: "#000000",
        },

        modal: {
          ondismiss: function () {
            console.log("Razorpay checkout closed");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("Payment failed:", response?.error);

        alert(
          response?.error?.description || "Payment failed. Please try again.",
        );
      });

      razorpay.open();
    } catch (error) {
      console.error("Create payment order error:", error);

      alert(error?.response?.data?.message || "Unable to start payment.");
    }
  };

  return (
    <div className="checkout-page-wrapper">
      <CheckoutHeader />

      <main className="checkout-main-content">
        {/* Left Column: Form Sections */}

        <div className="checkout-left-column">
          <div className="checkout-form-container">
            {paymentSuccess ? (
              <div
                style={{
                  padding: "30px",
                  backgroundColor: "#e8f5e9",
                  border: "1px solid #a5d6a7",
                  borderRadius: "8px",
                  textAlign: "center",
                  margin: "40px 0",
                }}
              >
                <h2
                  style={{
                    color: "#2e7d32",
                    marginBottom: "12px",
                  }}
                >
                  Thank you for your order!
                </h2>

                <p
                  style={{
                    color: "#424242",
                    fontSize: "15px",
                  }}
                >
                  Your order has been placed successfully. A confirmation email
                  will be sent shortly.
                </p>

                <button
                  type="button"
                  className="pay-now-btn"
                  style={{
                    width: "200px",
                    marginTop: "20px",
                  }}
                  onClick={() => setPaymentSuccess(false)}
                >
                  Back to Checkout
                </button>
              </div>
            ) : (
              <form onSubmit={handlePayNow} noValidate>
                <ContactSection
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                />

                <DeliverySection
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                />

                <ShippingMethod />

                <PaymentSection
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                />

                <button
                  type="submit"
                  className="pay-now-btn"
                  disabled={cartLoading || profileLoading}
                >
                  {cartLoading || profileLoading ? "Loading..." : "Pay now"}
                </button>
              </form>
            )}

            <footer className="checkout-footer">
              <a
                href="#privacy"
                className="checkout-link"
                onClick={(e) => e.preventDefault()}
              >
                Privacy policy
              </a>
            </footer>
          </div>
        </div>

        {/* Right Column: Order Summary */}

        <div className="checkout-right-column">
          <OrderSummary
            discountApplied={discountApplied}
            setDiscountApplied={setDiscountApplied}
          />
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
