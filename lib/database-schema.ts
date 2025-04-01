/**
 * KORA E-commerce Platform - Firebase Realtime Database Schema
 *
 * This file documents the database structure for reference.
 * It is not used in the application code but serves as documentation.
 */

export const databaseSchema = {
  // Users collection
  users: {
    $uid: {
      uid: "string", // User ID from Firebase Auth
      email: "string",
      displayName: "string",
      phoneNumber: "string",
      role: "enum(customer, wholesaler, dropshipper, admin)",
      createdAt: "timestamp",
      profileComplete: "boolean",
      profileImage: "string?", // URL to profile image
      address: {
        street: "string?",
        city: "string?",
        state: "string?",
        country: "string?",
        postalCode: "string?",
      },
      settings: {
        notifications: "boolean",
        emailUpdates: "boolean",
      },
    },
  },

  // Stores collection
  stores: {
    $storeId: {
      id: "string",
      name: "string",
      ownerId: "string", // Reference to user ID
      ownerType: "enum(wholesaler, dropshipper)",
      description: "string",
      logo: "string?", // URL to logo image
      bannerImage: "string?", // URL to banner image
      contactEmail: "string",
      contactPhone: "string",
      address: {
        street: "string",
        city: "string",
        state: "string",
        country: "string",
        postalCode: "string",
      },
      socialLinks: {
        website: "string?",
        facebook: "string?",
        instagram: "string?",
        twitter: "string?",
      },
      status: "enum(active, inactive, suspended)",
      rating: "number",
      reviews: "number",
      createdAt: "timestamp",
      updatedAt: "timestamp",
    },
  },

  // Products collection
  products: {
    $productId: {
      id: "string",
      name: "string",
      description: "string",
      longDescription: "string?",
      price: "number",
      salePrice: "number?",
      category: "string",
      subcategory: "string?",
      tags: ["string"],
      images: ["string"], // URLs to product images
      supplier: "string", // Store name
      supplierId: "string", // Reference to store ID
      rating: "number",
      reviews: "number",
      stock: "number",
      colors: ["string?"],
      sizes: ["string?"],
      specifications: [
        {
          name: "string",
          value: "string",
        },
      ],
      features: ["string"],
      status: "enum(active, inactive, out_of_stock)",
      createdAt: "timestamp",
      updatedAt: "timestamp",
    },
  },

  // Partnerships collection
  partnerships: {
    $partnershipId: {
      id: "string",
      wholesalerId: "string", // Reference to user ID
      wholesalerStoreId: "string", // Reference to store ID
      wholesalerName: "string", // Store name
      dropshipperId: "string", // Reference to user ID
      dropshipperStoreId: "string", // Reference to store ID
      dropshipperName: "string", // Store name
      status: "enum(pending, active, rejected, terminated)",
      commission: "number", // Percentage
      products: "number", // Count of products
      terms: "string?", // Partnership terms
      requestMessage: "string?", // Message sent with request
      responseMessage: "string?", // Response message
      since: "timestamp", // When partnership became active
      requestedAt: "timestamp",
      updatedAt: "timestamp",
    },
  },

  // Partnership products (products a dropshipper can sell from a wholesaler)
  partnershipProducts: {
    $partnershipId: {
      $productId: {
        id: "string", // Product ID
        partnershipId: "string", // Reference to partnership ID
        dropshipperPrice: "number", // Price set by dropshipper
        status: "enum(active, inactive)",
        addedAt: "timestamp",
      },
    },
  },

  // Orders collection
  orders: {
    $orderId: {
      id: "string",
      customerId: "string", // Reference to user ID
      customerName: "string",
      customerEmail: "string",
      customerPhone: "string",
      storeId: "string", // Reference to store ID
      storeName: "string",
      items: [
        {
          productId: "string",
          productName: "string",
          quantity: "number",
          price: "number",
          total: "number",
          options: {
            color: "string?",
            size: "string?",
          },
        },
      ],
      subtotal: "number",
      shipping: "number",
      tax: "number",
      total: "number",
      paymentMethod: "string",
      paymentStatus: "enum(pending, paid, failed, refunded)",
      paymentId: "string?", // Reference to payment ID
      shippingAddress: {
        name: "string",
        street: "string",
        city: "string",
        state: "string",
        country: "string",
        postalCode: "string",
        phone: "string",
      },
      status: "enum(pending, processing, shipped, out_for_delivery, delivered, cancelled)",
      notes: "string?",
      trackingNumber: "string?",
      trackingUrl: "string?",
      createdAt: "timestamp",
      updatedAt: "timestamp",
    },
  },

  // User orders (for quick access to a user's orders)
  userOrders: {
    $userId: {
      $orderId: true, // Reference to order ID
    },
  },

  // Store orders (for quick access to a store's orders)
  storeOrders: {
    $storeId: {
      $orderId: true, // Reference to order ID
    },
  },

  // Reviews collection
  reviews: {
    $reviewId: {
      id: "string",
      productId: "string", // Reference to product ID
      userId: "string", // Reference to user ID
      userName: "string",
      rating: "number",
      title: "string?",
      comment: "string",
      images: ["string?"], // URLs to review images
      status: "enum(pending, approved, rejected)",
      createdAt: "timestamp",
      updatedAt: "timestamp",
    },
  },

  // Product reviews (for quick access to a product's reviews)
  productReviews: {
    $productId: {
      $reviewId: true, // Reference to review ID
    },
  },

  // Wishlists collection
  wishlists: {
    $userId: {
      $productId: {
        id: "string", // Product ID
        addedAt: "timestamp",
      },
    },
  },

  // Notifications collection
  notifications: {
    $userId: {
      $notificationId: {
        id: "string",
        type: "enum(order, partnership, system, product)",
        title: "string",
        message: "string",
        read: "boolean",
        data: {
          // Additional data based on notification type
          orderId: "string?",
          partnershipId: "string?",
          productId: "string?",
        },
        createdAt: "timestamp",
      },
    },
  },

  // Categories collection
  categories: {
    $categoryId: {
      id: "string",
      name: "string",
      description: "string?",
      image: "string?", // URL to category image
      parentId: "string?", // For subcategories
      order: "number", // For sorting
      createdAt: "timestamp",
      updatedAt: "timestamp",
    },
  },

  // System settings
  settings: {
    platform: {
      name: "string",
      logo: "string",
      contactEmail: "string",
      contactPhone: "string",
      socialLinks: {
        facebook: "string?",
        instagram: "string?",
        twitter: "string?",
      },
      commissionRate: "number", // Default commission rate
      taxRate: "number",
    },
  },
}

