/**
 * KORA E-commerce Platform - Firebase Realtime Database Security Rules
 *
 * This file documents the security rules for reference.
 * To apply these rules, copy them to the Firebase Console > Realtime Database > Rules.
 */

export const firebaseRules = `
{
  "rules": {
    // Default deny all
    ".read": false,
    ".write": false,
    
    // Users
    "users": {
      // Users can read their own profile
      "$userId": {
        ".read": "auth !== null && auth.uid === $userId",
        // Users can update their own profile, but not change their role
        ".write": "auth !== null && auth.uid === $userId && (!data.exists() || !newData.child('role').exists() || data.child('role').val() === newData.child('role').val())"
      },
      // Admins can read all users
      ".read": "auth !== null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
    },
    
    // Stores
    "stores": {
      // Anyone can read store data
      ".read": true,
      "$storeId": {
        // Only store owner or admin can write
        ".write": "auth !== null && (data.child('ownerId').val() === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin')"
      }
    },
    
    // Products
    "products": {
      // Anyone can read product data
      ".read": true,
      "$productId": {
        // Only store owner or admin can write
        ".write": "auth !== null && (data.child('supplierId').val() === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin')"
      }
    },
    
    // Partnerships
    "partnerships": {
      "$partnershipId": {
        // Only involved parties or admin can read
        ".read": "auth !== null && (data.child('wholesalerId').val() === auth.uid || data.child('dropshipperId').val() === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin')",
        // Only involved parties or admin can write
        ".write": "auth !== null && (data.child('wholesalerId').val() === auth.uid || data.child('dropshipperId').val() === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin')"
      }
    },
    
    // Orders
    "orders": {
      "$orderId": {
        // Customer, store owner, or admin can read
        ".read": "auth !== null && (data.child('customerId').val() === auth.uid || data.child('storeId').val() === root.child('stores').child(data.child('storeId').val()).child('ownerId').val() || root.child('users').child(auth.uid).child('role').val() === 'admin')",
        // Customer can create, store owner can update status, admin can do anything
        ".write": "auth !== null && ((!data.exists() && newData.child('customerId').val() === auth.uid) || (data.exists() && data.child('storeId').val() === root.child('stores').child(data.child('storeId').val()).child('ownerId').val()) || root.child('users').child(auth.uid).child('role').val() === 'admin')"
      }
    },
    
    // Reviews
    "reviews": {
      // Anyone can read reviews
      ".read": true,
      "$reviewId": {
        // Only the reviewer or admin can write
        ".write": "auth !== null && (data.child('userId').val() === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin')"
      }
    },
    
    // Wishlists
    "wishlists": {
      "$userId": {
        // Only the user can read and write their wishlist
        ".read": "auth !== null && auth.uid === $userId",
        ".write": "auth !== null && auth.uid === $userId"
      }
    },
    
    // Carts
    "carts": {
      "$userId": {
        // Only the user can read and write their cart
        ".read": "auth !== null && auth.uid === $userId",
        ".write": "auth !== null && auth.uid === $userId"
      }
    },
    
    // Notifications
    "notifications": {
      "$userId": {
        // Only the user can read and write their notifications
        ".read": "auth !== null && auth.uid === $userId",
        ".write": "auth !== null && auth.uid === $userId"
      }
    },
    
    // Categories
    "categories": {
      // Anyone can read categories
      ".read": true,
      // Only admin can write
      ".write": "auth !== null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
    },
    
    // References
    "userStores": {
      "$userId": {
        ".read": "auth !== null && auth.uid === $userId",
        ".write": "auth !== null && auth.uid === $userId"
      }
    },
    "userPartnerships": {
      "$userId": {
        ".read": "auth !== null && auth.uid === $userId",
        ".write": "auth !== null && auth.uid === $userId"
      }
    },
    "userOrders": {
      "$userId": {
        ".read": "auth !== null && auth.uid === $userId",
        ".write": "auth !== null && auth.uid === $userId"
      }
    },
    "storeOrders": {
      "$storeId": {
        ".read": "auth !== null && root.child('stores').child($storeId).child('ownerId').val() === auth.uid",
        ".write": "auth !== null && root.child('stores').child($storeId).child('ownerId').val() === auth.uid"
      }
    },
    "storeProducts": {
      "$storeId": {
        ".read": true,
        ".write": "auth !== null && root.child('stores').child($storeId).child('ownerId').val() === auth.uid"
      }
    },
    "categoryProducts": {
      ".read": true,
      "$categoryId": {
        ".write": "auth !== null && (root.child('users').child(auth.uid).child('role').val() === 'wholesaler' || root.child('users').child(auth.uid).child('role').val() === 'admin')"
      }
    },
    "productReviews": {
      ".read": true,
      "$productId": {
        ".write": "auth !== null"
      }
    },
    "partnershipProducts": {
      "$partnershipId": {
        ".read": "auth !== null && (root.child('partnerships').child($partnershipId).child('wholesalerId').val() === auth.uid || root.child('partnerships').child($partnershipId).child('dropshipperId').val() === auth.uid)",
        ".write": "auth !== null && (root.child('partnerships').child($partnershipId).child('wholesalerId').val() === auth.uid || root.child('partnerships').child($partnershipId).child('dropshipperId').val() === auth.uid)"
      }
    },
    
    // Settings
    "settings": {
      // Anyone can read settings
      ".read": true,
      // Only admin can write
      ".write": "auth !== null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
    }
  }
}
`

