import express from 'express'
import { inventoryService } from '../utils/inventoryService.js'

const router = express.Router()

// Obtener todos los items de inventario
router.get('/items', (req, res) => {
    try {
        const items = inventoryService.getAllItems()
        res.json({
            success: true,
            data: items,
            count: items.length
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching inventory items',
            error: error.message
        })
    }
})

// Obtener un item específico
router.get('/items/:id', (req, res) => {
    try {
        const item = inventoryService.getItemById(req.params.id)
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            })
        }
        res.json({
            success: true,
            data: item
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching item',
            error: error.message
        })
    }
})

// Crear un nuevo item
router.post('/items', (req, res) => {
    try {
        const { name, sku, category, quantity, unitPrice, supplier, reorderLevel } = req.body

        if (!name || !sku || !category || quantity === undefined || !unitPrice) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            })
        }

        const newItem = inventoryService.createItem({
            name,
            sku,
            category,
            quantity,
            unitPrice,
            supplier,
            reorderLevel: reorderLevel || 5,
            lastRestocked: new Date().toISOString().split('T')[0]
        })

        res.status(201).json({
            success: true,
            message: 'Item created successfully',
            data: newItem
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating item',
            error: error.message
        })
    }
})

// Actualizar un item
router.put('/items/:id', (req, res) => {
    try {
        const updatedItem = inventoryService.updateItem(req.params.id, req.body)
        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            })
        }
        res.json({
            success: true,
            message: 'Item updated successfully',
            data: updatedItem
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating item',
            error: error.message
        })
    }
})

// Eliminar un item
router.delete('/items/:id', (req, res) => {
    try {
        const deleted = inventoryService.deleteItem(req.params.id)
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            })
        }
        res.json({
            success: true,
            message: 'Item deleted successfully'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting item',
            error: error.message
        })
    }
})

// Obtener items por categoría
router.get('/categories/:category', (req, res) => {
    try {
        const items = inventoryService.getItemsByCategory(req.params.category)
        res.json({
            success: true,
            data: items,
            count: items.length
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching items by category',
            error: error.message
        })
    }
})

// Obtener items con bajo stock
router.get('/low-stock', (req, res) => {
    try {
        const items = inventoryService.getLowStockItems()
        res.json({
            success: true,
            data: items,
            count: items.length
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching low stock items',
            error: error.message
        })
    }
})

// Actualizar cantidad de stock
router.patch('/items/:id/stock', (req, res) => {
    try {
        const { quantityChange } = req.body

        if (quantityChange === undefined) {
            return res.status(400).json({
                success: false,
                message: 'quantityChange is required'
            })
        }

        const updatedItem = inventoryService.updateStock(req.params.id, quantityChange)
        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            })
        }

        res.json({
            success: true,
            message: 'Stock updated successfully',
            data: updatedItem
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating stock',
            error: error.message
        })
    }
})

// Obtener resumen del inventario
router.get('/summary', (req, res) => {
    try {
        const summary = inventoryService.getInventorySummary()
        res.json({
            success: true,
            data: summary
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching inventory summary',
            error: error.message
        })
    }
})

// Obtener todas las categorías
router.get('/list/categories', (req, res) => {
    try {
        const categories = inventoryService.getCategories()
        res.json({
            success: true,
            data: categories
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        })
    }
})

// Obtener todos los proveedores
router.get('/list/suppliers', (req, res) => {
    try {
        const suppliers = inventoryService.getSuppliers()
        res.json({
            success: true,
            data: suppliers
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching suppliers',
            error: error.message
        })
    }
})

export default router
