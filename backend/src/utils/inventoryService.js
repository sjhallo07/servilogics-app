import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const INVENTORY_FILE = path.join(__dirname, '../../data/inventory.json')

// Funciones auxiliares para leer y escribir en JSON
const readInventory = () => {
    try {
        const data = fs.readFileSync(INVENTORY_FILE, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        console.error('Error reading inventory:', error)
        return null
    }
}

const writeInventory = (data) => {
    try {
        fs.writeFileSync(INVENTORY_FILE, JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch (error) {
        console.error('Error writing inventory:', error)
        return false
    }
}

// Servicios de inventario
export const inventoryService = {
    // Obtener todos los items
    getAllItems: () => {
        const inventory = readInventory()
        return inventory ? inventory.items : []
    },

    // Obtener un item por ID
    getItemById: (id) => {
        const inventory = readInventory()
        if (!inventory) return null
        return inventory.items.find(item => item.id === parseInt(id))
    },

    // Crear un nuevo item
    createItem: (itemData) => {
        const inventory = readInventory()
        if (!inventory) return null

        const newItem = {
            id: Math.max(...inventory.items.map(i => i.id), 0) + 1,
            ...itemData,
            status: itemData.quantity === 0 ? 'out-of-stock' : 
                    itemData.quantity <= itemData.reorderLevel ? 'low-stock' : 'in-stock'
        }

        inventory.items.push(newItem)
        writeInventory(inventory)
        return newItem
    },

    // Actualizar un item
    updateItem: (id, updates) => {
        const inventory = readInventory()
        if (!inventory) return null

        const itemIndex = inventory.items.findIndex(item => item.id === parseInt(id))
        if (itemIndex === -1) return null

        const updatedItem = {
            ...inventory.items[itemIndex],
            ...updates
        }

        // Actualizar estado basado en cantidad
        if (updatedItem.quantity === 0) {
            updatedItem.status = 'out-of-stock'
        } else if (updatedItem.quantity <= updatedItem.reorderLevel) {
            updatedItem.status = 'low-stock'
        } else {
            updatedItem.status = 'in-stock'
        }

        inventory.items[itemIndex] = updatedItem
        writeInventory(inventory)
        return updatedItem
    },

    // Eliminar un item
    deleteItem: (id) => {
        const inventory = readInventory()
        if (!inventory) return false

        const itemIndex = inventory.items.findIndex(item => item.id === parseInt(id))
        if (itemIndex === -1) return false

        inventory.items.splice(itemIndex, 1)
        writeInventory(inventory)
        return true
    },

    // Buscar items por categoría
    getItemsByCategory: (category) => {
        const inventory = readInventory()
        if (!inventory) return []
        return inventory.items.filter(item => item.category === category)
    },

    // Obtener items con bajo stock
    getLowStockItems: () => {
        const inventory = readInventory()
        if (!inventory) return []
        return inventory.items.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock')
    },

    // Actualizar cantidad de stock
    updateStock: (id, quantityChange) => {
        const item = inventoryService.getItemById(id)
        if (!item) return null

        const newQuantity = Math.max(0, item.quantity + quantityChange)
        return inventoryService.updateItem(id, { quantity: newQuantity })
    },

    // Obtener todas las categorías
    getCategories: () => {
        const inventory = readInventory()
        return inventory ? inventory.categories : []
    },

    // Obtener todos los proveedores
    getSuppliers: () => {
        const inventory = readInventory()
        return inventory ? inventory.suppliers : []
    },

    // Obtener resumen del inventario
    getInventorySummary: () => {
        const inventory = readInventory()
        if (!inventory) return null

        const items = inventory.items
        const totalItems = items.length
        const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
        const inStock = items.filter(item => item.status === 'in-stock').length
        const lowStock = items.filter(item => item.status === 'low-stock').length
        const outOfStock = items.filter(item => item.status === 'out-of-stock').length

        return {
            totalItems,
            totalValue: totalValue.toFixed(2),
            inStock,
            lowStock,
            outOfStock,
            lastUpdated: new Date().toISOString()
        }
    }
}
