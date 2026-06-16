// ============================================
// API CONFIGURATION
// Base URL for backend server communication
// ============================================
const API_BASE_URL = 'http://10.0.2.2:5001/api';

// ============================================
// USER AUTHENTICATION APIs
// Handles user registration and login
// ============================================
export const registerUserApi = async (
  userId: string,
  username: string,
  email: string,
  password: string,
  phone: string,
) => {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      username,
      email,
      password,
      phone,
    }),
  });

  const data = await response.json();

  if (!response.ok) throw { status: response.status, data };

  return data;
};

// LOGIN API
// Sends user credentials to backend for authentication
export const loginUserApi = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) throw { status: response.status, data };

  return data;
};

// ============================================
// CART APIs
// Handles adding, retrieving, updating and deleting cart items
// ============================================
export const addToCartApi = async (
  userId: string,
  productColorId: string,
  quantity: number
) => {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      product_color_id: productColorId,
      quantity,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw { status: response.status, data };
  return data;
};

// GET CART API
// Retrieves all cart items for a specific user
export const getCartByUserApi = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/cart/${userId}`);
  const data = await response.json();

  if (!response.ok) throw { status: response.status, data };

  return data;
};

// ============================================
// ADDRESS APIs
// Manage user delivery addresses
// ============================================
export const addAddressApi = async (address: any) => {
  const response = await fetch(`${API_BASE_URL}/addresses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(address),
  });

  const text = await response.text();
  console.log('Add address response:', text);

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw {
      status: response.status,
      data: { message: text },
    };
  }

  if (!response.ok) throw { status: response.status, data };

  return data;
};

// GET ADDRESS API
// Retrieves all saved addresses for a user
export const getAddressesByUserApi = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/addresses/${userId}`);

  const data = await response.json();

  if (!response.ok) throw { status: response.status, data };

  return data;
};

// UPDATE ADDRESS API
// Updates an existing address
export const updateAddressApi = async (addressId: number, address: any) => {
  const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(address),
  });

  const data = await response.json();

  if (!response.ok) throw { status: response.status, data };

  return data;
};

// DELETE ADDRESS API
// Removes an address from database
export const deleteAddressApi = async (addressId: number) => {
  const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
    method: 'DELETE',
  });

  const data = await response.json();

  if (!response.ok) throw { status: response.status, data };

  return data;
};

// UPDATE CART API
// Updates quantity of a specific cart item
export const updateCartQuantityApi = async (
  cartId: number,
  quantity: number
) => {
  const response = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantity }),
  });

  const text = await response.text();
  console.log('Update cart response:', text);

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw {
      status: response.status,
      data: { message: text },
    };
  }

  if (!response.ok) throw { status: response.status, data };

  return data;
};

// DELETE CART API
// Removes an item from the cart
export const deleteCartItemApi = async (cartId: number) => {
  const response = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
    method: 'DELETE',
  });

  const text = await response.text();
  console.log('Delete cart response:', text);

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw {
      status: response.status,
      data: { message: text },
    };
  }

  if (!response.ok) throw { status: response.status, data };

  return data;
};

// ============================================
// ORDER APIs
// Handles order creation and retrieval
// ============================================
export const createOrderApi = async (order: any) => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(order),
  });

  const data = await response.json();
  if (!response.ok) throw { status: response.status, data };

  return data;
};

// GET ORDERS API
// Retrieves all orders for a user including order status and dates
export const getOrdersByUserApi = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`);
  const data = await response.json();

  if (!response.ok) throw { status: response.status, data };

  return data;
};

// UPDATE ORDER STATUS API
// Updates order status (e.g., mark as Completed)
// Backend will also record received_date automatically
export const updateOrderStatusApi = async (
  orderId: number,
  status: string
) => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok) throw { status: response.status, data };

  return data;
};

// ============================================
// REVIEW APIs
// Handles product reviews and ratings
// ============================================
export const addReviewApi = async (review: any) => {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(review),
  });

  const data = await response.json();

  if (!response.ok) throw { status: response.status, data };

  return data;
};

// REVIEW SUMMARY API
// Retrieves average rating and total review count
export const getProductReviewSummaryApi = async (productId: string) => {
  const response = await fetch(`${API_BASE_URL}/reviews/summary/${productId}`);
  const data = await response.json();

  if (!response.ok) throw { status: response.status, data };

  return data;
};

// GET USER REVIEWS API
// Retrieves all reviews submitted by a user
export const getReviewsByUserApi = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/reviews/user/${userId}`);
  const data = await response.json();

  if (!response.ok) throw { status: response.status, data };

  return data;
};

// GET PRODUCT REVIEWS API
// Retrieves all reviews for a specific product
export const getReviewsByProductApi = async (productId: string) => {
  const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}`);
  const data = await response.json();

  if (!response.ok) throw { status: response.status, data };

  return data;
};

// ============================================
// USER PROFILE APIs
// Handles updating user account information
// ============================================
export const updateUserApi = async (
  userId: string,
  username: string,
  email: string,
  phone: string
) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      email,
      phone,
    }),
  });

  const data = await response.json();

  if (!response.ok) throw { status: response.status, data };

  return data;
};

// CHANGE PASSWORD API
// Allows user to update their password securely
export const changePasswordApi = async (
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
    }),
  });

  const data = await response.json();

  if (!response.ok) throw { status: response.status, data };

  return data;
};

// ============================================
// PRODUCT ANALYTICS APIs
// Used for tracking product sales and popularity
// ============================================
export const getSoldCountApi = async (productColorIds: string[]) => {
  const response = await fetch(`${API_BASE_URL}/products/sold-count`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_color_ids: productColorIds,
    }),
  });

  const data = await response.json();

  if (!response.ok) throw { status: response.status, data };

  return data.sold_count || 0;
};

// BEST SELLERS API
// Retrieves top-selling products based on sales data
export const getBestSellersApi = async () => {
  const response = await fetch(`${API_BASE_URL}/products/best-sellers`);
  const data = await response.json();

  if (!response.ok) throw { status: response.status, data };

  return data;
};