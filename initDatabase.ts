// ============================================
// DATABASE INITIALIZATION MODULE
// Initializes local product database only.
// User, cart, order, address and review data
// are handled by backend server APIs.
// ============================================

import { createProductTables, insertSampleData } from './database';

export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('start createProductTables');

    // Create local product-related tables
    // (Categories, Brands, Products, ProductColors)
    await createProductTables();

    console.log('start insertSampleData');

    // Insert sample product data for app display
    await insertSampleData();

    console.log('Local product database initialized successfully.');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};