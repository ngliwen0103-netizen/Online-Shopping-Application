// ============================================
// SERVER INITIALIZATION
// This section sets up the Express server,
// middleware, and database connection
// ============================================

console.log("THIS IS THE CORRECT SERVER FILE");

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5001;
const DB_NAME = 'gamegear_server.db';

app.use(cors());
app.use(bodyParser.json());

// ============================================
// DATABASE CONNECTION
// Connect to SQLite database (auto-create if not exist)
// ============================================
const db = new sqlite3.Database(DB_NAME);

// ============================================
// DATABASE TABLE CREATION
// This section creates all required tables
// for the system (Users, Cart, Orders, etc.)
// ============================================

db.serialize(() => {
  // USERS TABLE
  // Stores user account information (login, profile)
  db.run(`
    CREATE TABLE IF NOT EXISTS Users (
      user_id TEXT PRIMARY KEY NOT NULL,
      username TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      phone TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // CART TABLE
  // Stores items added by user before checkout
  db.run(`
    CREATE TABLE IF NOT EXISTS Cart (
      cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      product_color_id TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ORDERS TABLE
  // Stores order summary after checkout
  // Includes order_date (placed time)
  // and received_date (when user confirms delivery)  
  db.run(`
    CREATE TABLE IF NOT EXISTS Orders (
  order_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  total_amount REAL NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'To Receive',
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP
)
  `);

  db.run(`ALTER TABLE Orders ADD COLUMN status TEXT DEFAULT 'To Receive'`, () => {});
  db.run(`ALTER TABLE Orders ADD COLUMN received_date DATETIME`, () => {});
  
  // ORDER ITEMS TABLE
  // Stores individual items inside each order
  db.run(`
    CREATE TABLE IF NOT EXISTS OrderItems (
      order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_color_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price_each REAL NOT NULL,
      subtotal REAL NOT NULL
    )
  `);

  // ADDRESSES TABLE
  // Stores delivery addresses for users
  db.run(`
  CREATE TABLE IF NOT EXISTS Addresses (
    address_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postcode TEXT NOT NULL,
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

  // REVIEWS TABLE
  // Stores user reviews and ratings for products
  db.run(`
  CREATE TABLE IF NOT EXISTS Reviews (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    order_id INTEGER,
    rating INTEGER NOT NULL,
    comment TEXT,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

  db.run(`ALTER TABLE Reviews ADD COLUMN product_color_id TEXT`, () => { });

});

// ============================================
// USER REGISTRATION API
// Registers new user and prevents duplicate email
//  ============================================
app.post('/api/users/register', (req, res) => {
  const { user_id, username, email, password, phone } = req.body;

  db.get('SELECT * FROM Users WHERE email = ?', [email], (err, existingUser) => {
    if (err) return res.status(500).json({ error: err.message });

    if (existingUser) {
      return res.status(409).json({ message: 'Account already exists' });
    }

    db.run(
      `INSERT INTO Users (user_id, username, email, password, phone)
   VALUES (?, ?, ?, ?, ?)`,
      [user_id, username, email, password, phone],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({
          message: 'User registered successfully',
          user_id,
        });
      }
    );
  });
});

// USER LOGIN API
// Authenticates user credentials
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;

  db.get(
    'SELECT * FROM Users WHERE email = ? AND password = ?',
    [email, password],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });

      if (!user) {
        return res.status(404).json({ message: 'Account not found' });
      }

      res.json(user);
    }
  );
});

// ADD TO CART API
//  Adds item to cart or updates quantity if already exists
app.post('/api/cart', (req, res) => {
  const { user_id, product_color_id, quantity } = req.body;

  db.get(
    `SELECT * FROM Cart WHERE user_id = ? AND product_color_id = ?`,
    [user_id, product_color_id],
    (err, existingItem) => {
      if (err) return res.status(500).json({ error: err.message });

      if (existingItem) {
        const newQuantity =
          Number(existingItem.quantity || 1) + Number(quantity || 1);

        db.run(
          `UPDATE Cart SET quantity = ? WHERE cart_id = ?`,
          [newQuantity, existingItem.cart_id],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });

            res.json({
              message: 'Cart quantity updated',
              cart_id: existingItem.cart_id,
              quantity: newQuantity,
            });
          }
        );
      } else {
        db.run(
          `INSERT INTO Cart (user_id, product_color_id, quantity)
           VALUES (?, ?, ?)`,
          [user_id, product_color_id, quantity || 1],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });

            res.status(201).json({
              message: 'Item added to cart',
              cart_id: this.lastID,
            });
          }
        );
      }
    }
  );
});

// GET CART API
// Retrieves all cart items for a user
app.get('/api/cart/:user_id', (req, res) => {
  db.all(
    'SELECT * FROM Cart WHERE user_id = ?',
    [req.params.user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json(rows);
    }
  );
});

// UPDATE CART API
// Updates quantity of a cart item
app.put('/api/cart/:cartId', (req, res) => {
  const { cartId } = req.params;
  const { quantity } = req.body;

  db.run(
    `UPDATE Cart SET quantity = ? WHERE cart_id = ?`,
    [quantity, cartId],
    function (err) {
      if (err) return res.status(500).json({ message: 'Failed to update cart' });

      res.json({ message: 'Cart quantity updated successfully' });
    }
  );
});

// DELETE CART API
// Removes item from cart
app.delete('/api/cart/:cartId', (req, res) => {
  const { cartId } = req.params;

  db.run(
    `DELETE FROM Cart WHERE cart_id = ?`,
    [cartId],
    function (err) {
      if (err) return res.status(500).json({ message: 'Failed to delete cart item' });

      res.json({ message: 'Cart item deleted successfully' });
    }
  );
});

// CREATE ORDER API
// Creates order and inserts items into OrderItems table
app.post('/api/orders', (req, res) => {
  const { user_id, total_amount, payment_method, items } = req.body;

  db.run(
    `INSERT INTO Orders (user_id, total_amount, payment_method)
     VALUES (?, ?, ?)`,
    [user_id, total_amount, payment_method],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const orderId = this.lastID;

      const stmt = db.prepare(`
        INSERT INTO OrderItems
        (order_id, product_color_id, quantity, price_each, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `);

      items.forEach(item => {
        stmt.run(
          orderId,
          item.product_color_id,
          item.quantity,
          item.price_each,
          item.subtotal
        );
      });

      stmt.finalize();

      res.status(201).json({
        message: 'Order created successfully',
        order_id: orderId,
      });
    }
  );
});

// ADD ADDRESS API
// Allows user to save a new delivery address
app.post('/api/addresses', (req, res) => {
  const {
    user_id,
    recipient_name,
    phone,
    address_line1,
    address_line2,
    city,
    state,
    postcode,
    is_default,
  } = req.body;

  const sql = `
    INSERT INTO Addresses
    (user_id, recipient_name, phone, address_line1, address_line2, city, state, postcode, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      user_id,
      recipient_name,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      postcode,
      is_default,
    ],
    function (err) {
      if (err) {
        console.log('Add address backend error:', err);
        return res.status(500).json({ message: 'Failed to add address' });
      }

      res.json({
        message: 'Address added successfully',
        address_id: this.lastID,
      });
    }
  );
});

// GET ADDRESS API
// Retrieves all saved addresses for a specific user
app.get('/api/addresses/:userId', (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT *
    FROM Addresses
    WHERE user_id = ?
    ORDER BY is_default DESC, address_id DESC
  `;

  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.log('Get address backend error:', err);
      return res.status(500).json({ message: 'Failed to get addresses' });
    }

    res.json(rows);
  });
});

// DEVELOPMENT PURPOSE ONLY
// TEST API
// Used to verify that the backend server is running correctly
app.get('/api/test', (req, res) => {
  res.json({ message: 'Updated server is running' });
});

// UPDATE ADDRESS API
// Updates an existing address based on address ID
app.put('/api/addresses/:addressId', (req, res) => {
  const { addressId } = req.params;

  const {
    recipient_name,
    phone,
    address_line1,
    address_line2,
    city,
    state,
    postcode,
    is_default,
  } = req.body;

  const sql = `
    UPDATE Addresses
    SET recipient_name = ?,
        phone = ?,
        address_line1 = ?,
        address_line2 = ?,
        city = ?,
        state = ?,
        postcode = ?,
        is_default = ?
    WHERE address_id = ?
  `;

  db.run(
    sql,
    [
      recipient_name,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      postcode,
      is_default,
      addressId,
    ],
    function (err) {
      if (err) {
        console.log('Update address backend error:', err);
        return res.status(500).json({ message: 'Failed to update address' });
      }

      res.json({ message: 'Address updated successfully' });
    }
  );
});

// DELETE ADDRESS API
// Removes an address from the database
app.delete('/api/addresses/:addressId', (req, res) => {
  const { addressId } = req.params;

  const sql = `DELETE FROM Addresses WHERE address_id = ?`;

  db.run(sql, [addressId], function (err) {
    if (err) {
      console.log('Delete address error:', err);
      return res.status(500).json({ message: 'Failed to delete address' });
    }

    res.json({ message: 'Address deleted successfully' });
  });
});


// DEVELOPMENT PURPOSE ONLY 
// CLEAR CART API
// Deletes all items in the cart (used for testing/debugging)
app.get('/api/clear-cart', (req, res) => {
  db.run(`DELETE FROM Cart`, [], function (err) {
    if (err) return res.status(500).json({ message: 'Failed' });
    res.json({ message: 'Cart cleared' });
  });
});

// GET ORDERS API
// Retrieves all orders for a user including order date and received date
app.get('/api/orders/user/:userId', (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT
      Orders.order_id,
      Orders.user_id,
      Orders.total_amount,
      Orders.payment_method,
      Orders.order_date,
      Orders.status,
      Orders.received_date,
      OrderItems.product_color_id,
      OrderItems.quantity,
      OrderItems.price_each,
      OrderItems.subtotal
    FROM Orders
    JOIN OrderItems ON Orders.order_id = OrderItems.order_id
    WHERE Orders.user_id = ?
    ORDER BY Orders.order_id DESC
  `;

  db.all(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Failed to get orders' });

    res.json(rows);
  });
});

// UPDATE ORDER STATUS API
// Updates order status
// If marked as Completed, automatically records received_date
app.put('/api/orders/:orderId/status', (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (status === 'Completed') {
    db.run(
      `UPDATE Orders 
       SET status = ?, received_date = CURRENT_TIMESTAMP 
       WHERE order_id = ?`,
      [status, orderId],
      function (err) {
        if (err) {
          return res.status(500).json({ message: 'Failed to update order status' });
        }

        res.json({ message: 'Order marked as completed with date' });
      }
    );
  } else {
    db.run(
      `UPDATE Orders SET status = ? WHERE order_id = ?`,
      [status, orderId],
      function (err) {
        if (err) {
          return res.status(500).json({ message: 'Failed to update order status' });
        }

        res.json({ message: 'Order status updated' });
      }
    );
  }
});

// ADD REVIEW API
// Allows user to submit product review after purchase
app.post('/api/reviews', (req, res) => {
  const { user_id, product_id, product_color_id, order_id, rating, comment, tags } = req.body;

 db.run(
  `INSERT INTO Reviews (user_id, product_id, product_color_id, order_id, rating, comment, tags)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [user_id, product_id, product_color_id, order_id, rating, comment, tags],
    function (err) {
      if (err) return res.status(500).json({ message: 'Failed to add review' });

      res.status(201).json({
        message: 'Review submitted successfully',
        review_id: this.lastID,
      });
    }
  );
});

// DEVELOPMENT PURPOSE ONLY 
// CLEAR REVIEWS API
// Removes all reviews from database (testing purpose)
app.get('/api/clear-reviews', (req, res) => {
  db.run(`DELETE FROM Reviews`, [], function (err) {
    if (err) return res.status(500).json({ message: 'Failed' });
    res.json({ message: 'Reviews cleared' });
  });
});

// REVIEW SUMMARY API
// Calculates total reviews and average rating for a product
app.get('/api/reviews/summary/:productId', (req, res) => {
  const { productId } = req.params;

  db.get(
    `SELECT 
      COUNT(*) AS review_count,
      AVG(rating) AS average_rating
     FROM Reviews
     WHERE product_id = ?`,
    [productId],
    (err, row) => {
      if (err) return res.status(500).json({ message: 'Failed to get review summary' });

      res.json({
        review_count: row.review_count || 0,
        average_rating: row.average_rating || 0,
      });
    }
  );
});

// GET USER REVIEWS API
// Retrieves all reviews submitted by a specific user
app.get('/api/reviews/user/:userId', (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT *
    FROM Reviews
    WHERE user_id = ?
    ORDER BY review_id DESC
  `;

  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.log('Get reviews error:', err);
      return res.status(500).json({ message: 'Failed to get reviews' });
    }

    res.json(rows);
  });
});

// GET PRODUCT REVIEWS API
// Retrieves all reviews for a specific product
app.get('/api/reviews/product/:productId', (req, res) => {
  const { productId } = req.params;

  const sql = `
    SELECT 
      Reviews.*,
      Users.username
    FROM Reviews
    LEFT JOIN Users ON Reviews.user_id = Users.user_id
    WHERE Reviews.product_id = ?
    ORDER BY Reviews.review_id DESC
  `;

  db.all(sql, [productId], (err, rows) => {
    if (err) {
      console.log('Get product reviews error:', err);
      return res.status(500).json({ message: 'Failed to get product reviews' });
    }

    res.json(rows);
  });
});

// UPDATE USER PROFILE API
// Updates user's account information (username, email, phone)
app.put('/api/users/:userId', (req, res) => {
  const { userId } = req.params;
  const { username, email, phone } = req.body;

  db.run(
    `UPDATE Users
     SET username = ?, email = ?, phone = ?
     WHERE user_id = ?`,
    [username, email, phone, userId],
    function (err) {
      if (err) {
        return res.status(500).json({ message: 'Failed to update account' });
      }

      res.json({
        message: 'Account updated successfully',
        user_id: userId,
        username,
        email,
        phone,
      });
    }
  );
});

// CHANGE PASSWORD API
// Allows user to update their password after verification
app.put('/api/users/:userId/password', (req, res) => {
  const { userId } = req.params;
  const { old_password, new_password } = req.body;

  db.get(
    `SELECT * FROM Users WHERE user_id = ?`,
    [userId],
    (err, user) => {
      if (err) return res.status(500).json({ message: 'Failed to check user' });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.password !== old_password) {
        return res.status(400).json({ message: 'Old password is incorrect' });
      }

      db.run(
        `UPDATE Users SET password = ? WHERE user_id = ?`,
        [new_password, userId],
        function (err) {
          if (err) {
            return res.status(500).json({ message: 'Failed to update password' });
          }

          res.json({ message: 'Password updated successfully' });
        }
      );
    }
  );
});

// SOLD COUNT API
// Calculates total quantity sold for selected products
app.post('/api/products/sold-count', (req, res) => {
  const { product_color_ids } = req.body;

  if (!Array.isArray(product_color_ids) || product_color_ids.length === 0) {
    return res.json({ sold_count: 0 });
  }

  const placeholders = product_color_ids.map(() => '?').join(',');

  const sql = `
    SELECT SUM(quantity) AS sold_count
    FROM OrderItems
    WHERE product_color_id IN (${placeholders})
  `;

  db.get(sql, product_color_ids, (err, row) => {
    if (err) {
      console.log('Sold count error:', err);
      return res.status(500).json({ message: 'Failed to get sold count' });
    }

    res.json({ sold_count: row.sold_count || 0 });
  });
});

// BEST SELLER API
// Retrieves top-selling products based on sales quantity
app.get('/api/products/best-sellers', (req, res) => {
  const sql = `
    SELECT 
      product_color_id,
      SUM(quantity) AS sold_count
    FROM OrderItems
    GROUP BY product_color_id
    ORDER BY sold_count DESC
    LIMIT 5
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.log('Best seller error:', err);
      return res.status(500).json({ message: 'Failed to get best sellers' });
    }

    res.json(rows);
  });
});


// ============================================
// SERVER START
// Starts backend server and listens for requests
// ============================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on http://localhost:${PORT}`);
});