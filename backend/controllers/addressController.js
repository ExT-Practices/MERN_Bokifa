import Address from "../models/Address.js";

// Add new address
export const createAddress = async (req, res) => {
  try {
    const user_id = req.user.id;

    const {
      full_name,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country = "India",
      address_type = "home",
      is_default = false,
    } = req.body;

    // Required fields validation
    if (
      !full_name ||
      !phone ||
      !address_line1 ||
      !city ||
      !state ||
      !postal_code
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required address fields",
      });
    }

    // Validate address type
    if (!["home", "work", "other"].includes(address_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address type",
      });
    }

    // Check whether user already has addresses
    const existingAddress = await Address.findOne({
      where: {
        user_id,
      },
    });

    // First address should automatically become default
    const makeDefault = existingAddress ? Boolean(is_default) : true;

    // If this address should be default,
    // remove default from existing addresses
    if (makeDefault) {
      await Address.update(
        {
          is_default: false,
        },
        {
          where: {
            user_id,
            is_default: true,
          },
        },
      );
    }

    const address = await Address.create({
      user_id,
      full_name,
      phone,
      address_line1,
      address_line2: address_line2 || null,
      city,
      state,
      postal_code,
      country,
      address_type,
      is_default: makeDefault,
    });

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: address,
    });
  } catch (error) {
    console.error("Create Address Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Get all addresses of logged-in user
export const getAddresses = async (req, res) => {
  try {
    const user_id = req.user.id;

    const addresses = await Address.findAll({
      where: {
        user_id,
      },
      order: [
        ["is_default", "DESC"],
        ["created_at", "DESC"],
      ],
    });

    return res.status(200).json({
      success: true,
      count: addresses.length,
      data: addresses,
    });
  } catch (error) {
    console.error("Get Addresses Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Get single address
export const getAddressById = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    const address = await Address.findOne({
      where: {
        address_id: id,
        user_id,
      },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    console.error("Get Address Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Update address
export const updateAddress = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    const address = await Address.findOne({
      where: {
        address_id: id,
        user_id,
      },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const {
      full_name,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      address_type,
      is_default,
    } = req.body;

    // Validate address type if provided
    if (
      address_type !== undefined &&
      !["home", "work", "other"].includes(address_type)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid address type",
      });
    }

    // If making this address default
    if (is_default === true) {
      await Address.update(
        {
          is_default: false,
        },
        {
          where: {
            user_id,
            is_default: true,
          },
        },
      );
    }

    // Update only provided fields
    if (full_name !== undefined) address.full_name = full_name;
    if (phone !== undefined) address.phone = phone;
    if (address_line1 !== undefined) address.address_line1 = address_line1;
    if (address_line2 !== undefined) address.address_line2 = address_line2;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (postal_code !== undefined) address.postal_code = postal_code;
    if (country !== undefined) address.country = country;
    if (address_type !== undefined) address.address_type = address_type;
    if (is_default !== undefined) address.is_default = Boolean(is_default);

    await address.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: address,
    });
  } catch (error) {
    console.error("Update Address Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Delete address
export const deleteAddress = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    const address = await Address.findOne({
      where: {
        address_id: id,
        user_id,
      },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const wasDefault = address.is_default;

    await address.destroy();

    // If deleted address was default,
    // make the newest remaining address default
    if (wasDefault) {
      const nextAddress = await Address.findOne({
        where: {
          user_id,
        },
        order: [["created_at", "DESC"]],
      });

      if (nextAddress) {
        nextAddress.is_default = true;
        await nextAddress.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete Address Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
