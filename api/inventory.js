import { inventoryService } from '../backend/src/utils/inventoryService.js'

export default async function handler(req, res) {
  // GET /items
  if (req.method === 'GET' && req.url.endsWith('/items')) {
    try {
      const items = inventoryService.getAllItems()
      return res.json({ success: true, data: items, count: items.length })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error fetching inventory items', error: error.message })
    }
  }

  // GET /items/:id
  if (req.method === 'GET' && req.url.match(/\/items\/[\w-]+$/)) {
    try {
      const id = req.url.split('/').pop()
      const item = inventoryService.getItemById(id)
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found' })
      }
      return res.json({ success: true, data: item })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error fetching item', error: error.message })
    }
  }

  // POST /items
  if (req.method === 'POST' && req.url.endsWith('/items')) {
    try {
      const { name, sku, category, quantity, unitPrice, supplier, reorderLevel } = req.body
      if (!name || !sku || !category || quantity === undefined || !unitPrice) {
        return res.status(400).json({ success: false, message: 'Missing required fields' })
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
      return res.status(201).json({ success: true, message: 'Item created successfully', data: newItem })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error creating item', error: error.message })
    }
  }

  // PUT /items/:id
  if (req.method === 'PUT' && req.url.match(/\/items\/[\w-]+$/)) {
    try {
      const id = req.url.split('/').pop()
      const updatedItem = inventoryService.updateItem(id, req.body)
      if (!updatedItem) {
        return res.status(404).json({ success: false, message: 'Item not found' })
      }
      return res.json({ success: true, message: 'Item updated successfully', data: updatedItem })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error updating item', error: error.message })
    }
  }

  // DELETE /items/:id
  if (req.method === 'DELETE' && req.url.match(/\/items\/[\w-]+$/)) {
    try {
      const id = req.url.split('/').pop()
      const deleted = inventoryService.deleteItem(id)
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Item not found' })
      }
      return res.json({ success: true, message: 'Item deleted successfully' })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error deleting item', error: error.message })
    }
  }

  // GET /categories/:category
  if (req.method === 'GET' && req.url.match(/\/categories\/[\w-]+$/)) {
    try {
      const category = req.url.split('/').pop()
      const items = inventoryService.getItemsByCategory(category)
      return res.json({ success: true, data: items, count: items.length })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error fetching items by category', error: error.message })
    }
  }

  // GET /low-stock
  if (req.method === 'GET' && req.url.endsWith('/low-stock')) {
    try {
      const items = inventoryService.getLowStockItems()
      return res.json({ success: true, data: items, count: items.length })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error fetching low stock items', error: error.message })
    }
  }

  // PATCH /items/:id/stock
  if (req.method === 'PATCH' && req.url.match(/\/items\/[\w-]+\/stock$/)) {
    try {
      const id = req.url.split('/')[req.url.split('/').length - 2]
      const { quantityChange } = req.body
      if (quantityChange === undefined) {
        return res.status(400).json({ success: false, message: 'quantityChange is required' })
      }
      const updatedItem = inventoryService.updateStock(id, quantityChange)
      if (!updatedItem) {
        return res.status(404).json({ success: false, message: 'Item not found' })
      }
      return res.json({ success: true, message: 'Stock updated successfully', data: updatedItem })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error updating stock', error: error.message })
    }
  }

  // GET /summary
  if (req.method === 'GET' && req.url.endsWith('/summary')) {
    try {
      const summary = inventoryService.getInventorySummary()
      return res.json({ success: true, data: summary })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error fetching inventory summary', error: error.message })
    }
  }

  // GET /list/categories
  if (req.method === 'GET' && req.url.endsWith('/list/categories')) {
    try {
      const categories = inventoryService.getCategories()
      return res.json({ success: true, data: categories })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error fetching categories', error: error.message })
    }
  }

  // GET /list/suppliers
  if (req.method === 'GET' && req.url.endsWith('/list/suppliers')) {
    try {
      const suppliers = inventoryService.getSuppliers()
      return res.json({ success: true, data: suppliers })
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error fetching suppliers', error: error.message })
    }
  }

  return res.status(404).json({ success: false, message: 'Not found' })
}
