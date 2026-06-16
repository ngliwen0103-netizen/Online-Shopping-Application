// ============================================
// SQLITE DATABASE CONNECTION MODULE
// This file manages the connection to the local
// SQLite database used in the mobile application
// ============================================
import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

// Enable Promise-based API for SQLite
// Allows use of async/await instead of callbacks
SQLite.enablePromise(true);

// Define database file name
// This database will be stored locally on the device
const DATABASE_NAME = 'gamegear_v2.db';

// Singleton pattern: ensures only ONE database connection is used
// Prevents multiple connections which may cause performance issues
let dbInstance: SQLiteDatabase | null = null;

// ============================================
// GET DATABASE CONNECTION FUNCTION
// Returns an active database connection
// If connection already exists, reuse it
// Otherwise, create a new connection
// ============================================
export const getDBConnection = async (): Promise<SQLiteDatabase> => {
  try {
    // Check if database is already connected
    // If yes, return existing instance (reuse connection)
    if (dbInstance) {
      return dbInstance;
    }

    // Open database connection
    // If database does not exist, it will be created automatically
    dbInstance = await SQLite.openDatabase({
      name: DATABASE_NAME,
      location: 'default',
    });


    // Enable foreign key constraints
    // Ensures relational integrity between tables
    // (e.g., Products must exist before ProductColors)
    await dbInstance.executeSql('PRAGMA foreign_keys = ON;');

    return dbInstance;

    // Error handling for database connection issues
    // Logs error and prevents app from crashing silently
  } catch (error) {
    console.error('DB connection error:', error);
    throw error;
  }
};