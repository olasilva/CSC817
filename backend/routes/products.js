const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { supabase, supabaseAdmin } = require('../supabase/client');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

// Configure multer for image upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Get all products
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { category, search, status } = req.query;
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    if (status === 'low_stock') {
      query = query.gt('quantity', 0).lte('quantity', supabase.raw('min_stock'));
    } else if (status === 'out_of_stock') {
      query = query.eq('quantity', 0);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Product not found' });

    res.json({ success: true, data });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product
router.post('/', authenticateUser, authorizeRoles('admin', 'manager'), upload.single('image'), async (req, res) => {
  try {
    const { name, sku, category, quantity, location, description } = req.body;
    
    if (!name || !sku || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check SKU uniqueness
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('sku', sku)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'SKU already exists' });
    }

    let imageUrl = null;

    // Upload image if provided
    if (req.file) {
      const optimizedImage = await sharp(req.file.buffer)
        .resize(800, 600, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer();

      const fileName = `products/${uuidv4()}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('product-images')
        .upload(fileName, optimizedImage, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabaseAdmin
        .storage
        .from('product-images')
        .getPublicUrl(fileName);

      imageUrl = publicUrl;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    const productId = `INV-${uuidv4().substring(0, 8).toUpperCase()}`;

    const { data, error } = await supabase
      .from('products')
      .insert({
        id: productId,
        name,
        sku,
        category,
        quantity: parseInt(quantity) || 0,
        location: location || 'Main Store',
        image_url: imageUrl,
        description: description || '',
        min_stock: 2,
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_log').insert({
      type: 'PRODUCT_ADDED',
      details: `Added new product: ${name}`,
      user_id: req.user.id,
      product_id: productId
    });

    // Emit real-time event
    req.app.get('io').emit('product:created', data);

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', authenticateUser, authorizeRoles('admin', 'manager'), upload.single('image'), async (req, res) => {
  try {
    const { name, sku, category, quantity, location, description } = req.body;
    const productId = req.params.id;

    // Check if product exists
    const { data: existing, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let imageUrl = existing.image_url;

    if (req.file) {
      const optimizedImage = await sharp(req.file.buffer)
        .resize(800, 600, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer();

      const fileName = `products/${uuidv4()}.jpg`;
      
      const { error: uploadError } = await supabaseAdmin
        .storage
        .from('product-images')
        .upload(fileName, optimizedImage, {
          contentType: 'image/jpeg'
        });

      if (!uploadError) {
        const { data: { publicUrl } } = supabaseAdmin
          .storage
          .from('product-images')
          .getPublicUrl(fileName);
        imageUrl = publicUrl;
      }
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        name: name || existing.name,
        sku: sku || existing.sku,
        category: category || existing.category,
        quantity: quantity !== undefined ? parseInt(quantity) : existing.quantity,
        location: location || existing.location,
        image_url: imageUrl,
        description: description || existing.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('activity_log').insert({
      type: 'PRODUCT_UPDATED',
      details: `Updated product: ${data.name}`,
      user_id: req.user.id,
      product_id: productId
    });

    req.app.get('io').emit('product:updated', data);

    res.json({ success: true, data });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', authenticateUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const productId = req.params.id;

    const { data: existing, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;

    await supabase.from('activity_log').insert({
      type: 'PRODUCT_DELETED',
      details: `Deleted product: ${existing.name}`,
      user_id: req.user.id,
      product_id: productId
    });

    req.app.get('io').emit('product:deleted', { id: productId });

    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Restock product
router.post('/:id/restock', authenticateUser, authorizeRoles('admin', 'manager'), async (req, res) => {
  try {
    const { quantity, source, notes } = req.body;
    const productId = req.params.id;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (fetchError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const newQuantity = product.quantity + parseInt(quantity);

    const { data, error } = await supabase
      .from('products')
      .update({ 
        quantity: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;

    // Log restock
    await supabase.from('restock_log').insert({
      product_id: productId,
      quantity_added: parseInt(quantity),
      previous_quantity: product.quantity,
      new_quantity: newQuantity,
      source: source || '',
      notes: notes || '',
      performed_by: req.user.id
    });

    await supabase.from('activity_log').insert({
      type: 'PRODUCT_RESTOCKED',
      details: `Restocked ${product.name}: ${product.quantity} → ${newQuantity} (+${quantity})`,
      user_id: req.user.id,
      product_id: productId
    });

    req.app.get('io').emit('product:updated', data);

    res.json({ success: true, data });
  } catch (error) {
    console.error('Restock error:', error);
    res.status(500).json({ error: 'Failed to restock product' });
  }
});

module.exports = router;