import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'menu.json');

// Initialize menu database (fallback to empty shell if file doesn't exist)
async function initMenuDb() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch {
      const defaultMenu = { bases: [], addons: [], combos: [] };
      await fs.writeFile(DATA_FILE, JSON.stringify(defaultMenu, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error initializing menu database:', err);
  }
}

// Read menu
async function getMenu() {
  await initMenuDb();
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const menu = JSON.parse(data);
    if (!menu.combos) {
      menu.combos = [];
    }
    return menu;
  } catch (err) {
    console.error('Error reading menu:', err);
    return { bases: [], addons: [], combos: [] };
  }
}

// Save menu atomically
async function saveMenu(menu) {
  await initMenuDb();
  try {
    const tempFile = `${DATA_FILE}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(menu, null, 2), 'utf-8');
    await fs.rename(tempFile, DATA_FILE);
    return true;
  } catch (err) {
    console.error('Error saving menu:', err);
    return false;
  }
}

// Add menu item
async function addMenuItem(itemData) {
  const menu = await getMenu();
  const { type, name, price, tags, desc, image, category } = itemData;
  
  if (!name || typeof price !== 'number') {
    throw new Error('Name and price are required');
  }

  let id = '';
  const inStock = itemData.inStock !== false; // default to true

  if (type === 'base') {
    // Generate base ID (e.g. b10)
    let nextNum = 1;
    if (menu.bases && menu.bases.length > 0) {
      const nums = menu.bases.map(b => {
        const match = b.id.match(/^b(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      });
      nextNum = Math.max(...nums, 0) + 1;
    }
    id = `b${nextNum}`;

    const newBase = { id, name, price, tags: tags || [], desc: desc || '', image: image || '', inStock };
    menu.bases.push(newBase);
    await saveMenu(menu);
    return newBase;
  } else if (type === 'addon') {
    if (!category) {
      throw new Error('Category is required for addon items');
    }

    // Determine prefix based on category
    let prefix = 'addon';
    if (category === 'Spreads & Sweeteners') prefix = 'bu';
    else if (category === 'Fresh Fruits') prefix = 'f';
    else if (category === 'Premium Nuts') prefix = 'n';
    else if (category === 'Healthy Seeds') prefix = 's';

    let nextNum = 1;
    if (menu.addons && menu.addons.length > 0) {
      const nums = menu.addons
        .filter(a => a.id.startsWith(prefix))
        .map(a => {
          const match = a.id.substring(prefix.length).match(/^(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        });
      nextNum = Math.max(...nums, 0) + 1;
    }
    id = `${prefix}${nextNum}`;

    const newAddon = { id, name, price, tags: tags || [], image: image || '', category, inStock };
    menu.addons.push(newAddon);
    await saveMenu(menu);
    return newAddon;
  } else if (type === 'combo') {
    let nextNum = 1;
    if (menu.combos && menu.combos.length > 0) {
      const nums = menu.combos.map(c => {
        const match = c.id.match(/^c(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      });
      nextNum = Math.max(...nums, 0) + 1;
    }
    id = `c${nextNum}`;

    const newCombo = {
      id,
      name,
      base: itemData.base || '',
      addons: itemData.addons || [],
      price,
      tag: itemData.tag || '',
      image: itemData.image || '',
      inStock
    };
    if (!menu.combos) menu.combos = [];
    menu.combos.push(newCombo);
    await saveMenu(menu);
    return newCombo;
  } else {
    throw new Error('Invalid item type. Must be base, addon, or combo');
  }
}

// Update menu item
async function updateMenuItem(id, itemData) {
  const menu = await getMenu();
  
  // Try to find in bases
  const baseIndex = menu.bases.findIndex(b => b.id === id);
  if (baseIndex !== -1) {
    const updated = {
      ...menu.bases[baseIndex],
      name: itemData.name !== undefined ? itemData.name : menu.bases[baseIndex].name,
      price: itemData.price !== undefined ? itemData.price : menu.bases[baseIndex].price,
      tags: itemData.tags !== undefined ? itemData.tags : menu.bases[baseIndex].tags,
      desc: itemData.desc !== undefined ? itemData.desc : menu.bases[baseIndex].desc,
      image: itemData.image !== undefined ? itemData.image : menu.bases[baseIndex].image,
      inStock: itemData.inStock !== undefined ? itemData.inStock : menu.bases[baseIndex].inStock
    };
    menu.bases[baseIndex] = updated;
    await saveMenu(menu);
    return updated;
  }

  // Try to find in addons
  const addonIndex = menu.addons.findIndex(a => a.id === id);
  if (addonIndex !== -1) {
    const updated = {
      ...menu.addons[addonIndex],
      name: itemData.name !== undefined ? itemData.name : menu.addons[addonIndex].name,
      price: itemData.price !== undefined ? itemData.price : menu.addons[addonIndex].price,
      tags: itemData.tags !== undefined ? itemData.tags : menu.addons[addonIndex].tags,
      image: itemData.image !== undefined ? itemData.image : menu.addons[addonIndex].image,
      category: itemData.category !== undefined ? itemData.category : menu.addons[addonIndex].category,
      inStock: itemData.inStock !== undefined ? itemData.inStock : menu.addons[addonIndex].inStock
    };
    menu.addons[addonIndex] = updated;
    await saveMenu(menu);
    return updated;
  }

  // Try to find in combos
  const comboIndex = menu.combos ? menu.combos.findIndex(c => c.id === id) : -1;
  if (comboIndex !== -1) {
    const updated = {
      ...menu.combos[comboIndex],
      name: itemData.name !== undefined ? itemData.name : menu.combos[comboIndex].name,
      base: itemData.base !== undefined ? itemData.base : menu.combos[comboIndex].base,
      addons: itemData.addons !== undefined ? itemData.addons : menu.combos[comboIndex].addons,
      price: itemData.price !== undefined ? itemData.price : menu.combos[comboIndex].price,
      tag: itemData.tag !== undefined ? itemData.tag : menu.combos[comboIndex].tag,
      image: itemData.image !== undefined ? itemData.image : menu.combos[comboIndex].image,
      inStock: itemData.inStock !== undefined ? itemData.inStock : menu.combos[comboIndex].inStock
    };
    menu.combos[comboIndex] = updated;
    await saveMenu(menu);
    return updated;
  }

  return null;
}

// Delete menu item
async function deleteMenuItem(id) {
  const menu = await getMenu();
  
  const baseIndex = menu.bases.findIndex(b => b.id === id);
  if (baseIndex !== -1) {
    menu.bases.splice(baseIndex, 1);
    await saveMenu(menu);
    return true;
  }

  const addonIndex = menu.addons.findIndex(a => a.id === id);
  if (addonIndex !== -1) {
    menu.addons.splice(addonIndex, 1);
    await saveMenu(menu);
    return true;
  }

  const comboIndex = menu.combos ? menu.combos.findIndex(c => c.id === id) : -1;
  if (comboIndex !== -1) {
    menu.combos.splice(comboIndex, 1);
    await saveMenu(menu);
    return true;
  }

  return false;
}

export {
  getMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem
};
