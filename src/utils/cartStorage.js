import * as SQLite from 'expo-sqlite';

const DB_NAME = 'coffeecart.db';
const TABLE_SQL = 'CREATE TABLE IF NOT EXISTS cart_table (id INTEGER PRIMARY KEY NOT NULL, cart_data TEXT);';

async function getDb() {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync(TABLE_SQL);
  return db;
}

export async function loadCartItems() {
  const db = await getDb();
  const saved = await db.getFirstAsync('SELECT cart_data FROM cart_table WHERE id = 1;');

  if (!saved?.cart_data) return [];

  try {
    const parsed = JSON.parse(saved.cart_data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.log('Cart parse error:', error);
    return [];
  }
}

export async function saveCartItems(items = []) {
  const db = await getDb();
  await db.runAsync('INSERT OR REPLACE INTO cart_table (id, cart_data) VALUES (1, ?);', [JSON.stringify(items)]);
}

export async function clearCartItems() {
  await saveCartItems([]);
}
