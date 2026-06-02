const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    // If cart doesn't exist, create a new one
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    console.log('Cart items before transform:', cart.items.map(item => ({
      id: item._id.toString(),
      productId: item.product?._id?.toString(),
      name: item.name,
      hasImage: !!item.image,
      hasProductImages: !!(item.product?.images?.length),
      hasProductImage: !!item.product?.image
    })));

    // Transform cart data for client
    const transformedItems = cart.items.map((item) => {
      let imageUrl = '';
      
      // First try to use the image stored directly in the cart item
      if (item.image) {
        // Make sure image URL is absolute if it's a relative path
        if (item.image.startsWith('/uploads')) {
          imageUrl = item.image; // This is a relative path that frontend will resolve
        } else if (item.image.startsWith('http')) {
          imageUrl = item.image; // Already an absolute URL
        } else {
          // Prepend uploads folder to ensure frontend can resolve it
          imageUrl = `/uploads/${item.image}`;
        }
      } 
      // If no image in cart item, try to get from product
      else if (item.product) {
        if (item.product.images && item.product.images.length > 0) {
          const productImage = item.product.images[0];
          if (productImage.startsWith('/uploads') || productImage.startsWith('http')) {
            imageUrl = productImage;
          } else {
            imageUrl = `/uploads/${productImage}`;
          }
        } else if (item.product.image) {
          const productMainImage = item.product.image;
          if (productMainImage.startsWith('/uploads') || productMainImage.startsWith('http')) {
            imageUrl = productMainImage;
          } else {
            imageUrl = `/uploads/${productMainImage}`;
          }
        }
      }

      console.log('Cart item image resolved for item:', item.name, 'to:', imageUrl);

      return {
        id: item._id,
        product: item.product?._id || item.product,
        name: item.name,
        image: imageUrl,
        price: item.price,
        originalPrice: item.originalPrice,
        quantity: item.quantity,
      };
    });

    console.log('Transformed cart items:', transformedItems.map(item => ({
      id: item.id.toString(),
      image: item.image,
      name: item.name
    })));

    res.json({
      items: transformedItems,
      coupon: cart.coupon,
      shippingMethod: cart.shippingMethod,
    });
  } catch (error) {
    console.error('Error in getCart:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
const addItemToCart = async (req, res) => {
  try {
    console.log('Adding item to cart - Request body:', req.body);
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        message: 'ID sản phẩm không hợp lệ',
        details: { productId }
      });
    }

    if (!quantity || isNaN(parseInt(quantity, 10)) || parseInt(quantity, 10) <= 0) {
      return res.status(400).json({ 
        message: 'Số lượng không hợp lệ',
        details: { quantity }
      });
    }

    const parsedQuantity = parseInt(quantity, 10);

    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    console.log('Found cart:', cart ? 'Yes' : 'No');

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      console.error('Product not found - ID:', productId);
      return res.status(404).json({ 
        message: 'Sản phẩm không tồn tại',
        details: { productId }
      });
    }
    console.log('Found product:', product.name);

    // Check stock
    if (product.countInStock < parsedQuantity) {
      return res.status(400).json({ 
        message: `Chỉ còn ${product.countInStock} sản phẩm trong kho`,
        details: {
          requestedQuantity: parsedQuantity,
          availableQuantity: product.countInStock
        }
      });
    }

    // Process the image URL from product
    let imageUrl = '';
    if (product.images && product.images.length > 0) {
      imageUrl = product.images[0];
    } else if (product.image) {
      imageUrl = product.image;
    }

    // Make sure imageUrl has the correct format
    if (imageUrl && !imageUrl.startsWith('/uploads') && !imageUrl.startsWith('http')) {
      imageUrl = `/uploads/${imageUrl}`;
    }

    console.log('Image URL for cart item:', imageUrl);

    // Create cart item
    const cartItem = {
      product: productId,
      name: product.name,
      image: imageUrl,
      price: product.salePrice || product.price,
      originalPrice: product.price,
      quantity: parsedQuantity
    };
    console.log('Created cart item:', cartItem);

    if (!cart) {
      // Create new cart
      cart = await Cart.create({
        user: userId,
        items: [cartItem],
      });
      console.log('Created new cart');
    } else {
      // Update existing cart
      const itemIndex = cart.items.findIndex(item => 
        item.product.toString() === productId
      );

      if (itemIndex > -1) {
        // Update existing item
        const newQuantity = cart.items[itemIndex].quantity + parsedQuantity;
        
        if (newQuantity > product.countInStock) {
          return res.status(400).json({ 
            message: `Chỉ còn ${product.countInStock} sản phẩm trong kho`,
            details: {
              currentQuantity: cart.items[itemIndex].quantity,
              requestedQuantity: parsedQuantity,
              totalRequested: newQuantity,
              availableQuantity: product.countInStock
            }
          });
        }
        
        cart.items[itemIndex] = {
          ...cart.items[itemIndex],
          quantity: newQuantity,
          price: product.salePrice || product.price,
          originalPrice: product.price,
          image: imageUrl
        };
        console.log('Updated existing item in cart');
      } else {
        // Add new item
        cart.items.push(cartItem);
        console.log('Added new item to cart');
      }

      await cart.save();
      console.log('Cart saved successfully');
    }

    // Populate and transform cart data
    await cart.populate('items.product');
    
    console.log('Cart items after add/update:', cart.items.map(item => ({
      id: item._id.toString(),
      productId: item.product?._id?.toString(),
      name: item.name,
      hasImage: !!item.image,
      image: item.image,
      hasProductImages: !!(item.product?.images?.length),
      hasProductImage: !!item.product?.image
    })));
    
    const transformedItems = cart.items.map(item => {
      let imageUrl = '';
      
      // First try to use the image stored directly in the cart item
      if (item.image) {
        // Make sure image URL is absolute if it's a relative path
        if (item.image.startsWith('/uploads')) {
          imageUrl = item.image; // This is a relative path that frontend will resolve
        } else if (item.image.startsWith('http')) {
          imageUrl = item.image; // Already an absolute URL
        } else {
          // Prepend uploads folder to ensure frontend can resolve it
          imageUrl = `/uploads/${item.image}`;
        }
      } 
      // If no image in cart item, try to get from product
      else if (item.product) {
        if (item.product.images && item.product.images.length > 0) {
          const productImage = item.product.images[0];
          if (productImage.startsWith('/uploads') || productImage.startsWith('http')) {
            imageUrl = productImage;
          } else {
            imageUrl = `/uploads/${productImage}`;
          }
        } else if (item.product.image) {
          const productMainImage = item.product.image;
          if (productMainImage.startsWith('/uploads') || productMainImage.startsWith('http')) {
            imageUrl = productMainImage;
          } else {
            imageUrl = `/uploads/${productMainImage}`;
          }
        }
      }
      
      console.log('Cart item image resolved for item:', item.name, 'to:', imageUrl);
      
      return {
        id: item._id,
        product: item.product._id,
        name: item.name,
        image: imageUrl,
        price: item.price,
        originalPrice: item.originalPrice,
        quantity: item.quantity
      };
    });
    
    console.log('Transformed items after add/update:', transformedItems.map(item => ({
      id: item.id.toString(),
      image: item.image,
      name: item.name
    })));

    res.json({
      items: transformedItems,
      coupon: cart.coupon,
      shippingMethod: cart.shippingMethod
    });
  } catch (error) {
    console.error('Error in addItemToCart:', {
      error: error.message,
      stack: error.stack,
      userId: req.user._id,
      body: req.body
    });
    res.status(500).json({ 
      message: 'Lỗi server',
      details: error.message 
    });
  }
};

// @desc    Update cart item
// @route   PUT /api/cart/items/:id
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    console.log('Updating cart item - ID:', req.params.id);
    console.log('Update payload:', req.body);
    
    const { quantity } = req.body;
    const itemId = req.params.id;
    const userId = req.user._id;

    // Validate itemId
    if (!itemId || !mongoose.isValidObjectId(itemId)) {
      console.error('Invalid item ID:', itemId);
      return res.status(400).json({ 
        message: 'ID sản phẩm không hợp lệ',
        details: { itemId }
      });
    }

    // Validate quantity
    if (!quantity || isNaN(parseInt(quantity, 10))) {
      console.error('Invalid quantity provided:', quantity);
      return res.status(400).json({ 
        message: 'Số lượng không hợp lệ',
        details: { providedQuantity: quantity }
      });
    }

    const parsedQuantity = parseInt(quantity, 10);
    if (parsedQuantity <= 0) {
      console.error('Quantity must be greater than 0:', parsedQuantity);
      return res.status(400).json({ 
        message: 'Số lượng phải lớn hơn 0',
        details: { providedQuantity: parsedQuantity }
      });
    }

    // Find cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      console.error('Cart not found for user:', userId);
      return res.status(404).json({ 
        message: 'Giỏ hàng không tồn tại',
        details: { userId }
      });
    }

    // Debug info about cart items
    console.log('Cart items:', cart.items.map(item => ({
      id: item._id.toString(),
      product: item.product.toString(),
      name: item.name,
      quantity: item.quantity
    })));
    console.log('Looking for item with ID:', itemId);

    // Convert itemId to ObjectId for proper comparison
    const itemObjectId = new mongoose.Types.ObjectId(itemId);
    
    // Find item by its _id in the cart using ObjectId comparison
    const itemIndex = cart.items.findIndex(item => 
      item._id.equals(itemObjectId)
    );

    console.log('Found item at index:', itemIndex);

    if (itemIndex === -1) {
      console.error('Item not found in cart - Item ID:', itemId);
      return res.status(404).json({ 
        message: 'Sản phẩm không tồn tại trong giỏ hàng',
        details: { 
          itemId,
          itemsCount: cart.items.length,
          availableItemIds: cart.items.map(item => item._id.toString())
        }
      });
    }

    const cartItem = cart.items[itemIndex];
    console.log('Found cart item:', {
      id: cartItem._id.toString(),
      product: cartItem.product.toString(),
      name: cartItem.name,
      price: cartItem.price,
      quantity: cartItem.quantity
    });

    // Check if product exists and is valid
    if (!cartItem.product || !mongoose.isValidObjectId(cartItem.product)) {
      console.error('Product reference invalid in cart item:', {
        id: cartItem._id,
        product: cartItem.product
      });
      
      // Remove the invalid item from cart and save
      cart.items.splice(itemIndex, 1);
      await cart.save();
      
      return res.status(400).json({ 
        message: 'Sản phẩm không hợp lệ, đã xóa khỏi giỏ hàng',
        details: { cartItem: {
          id: cartItem._id,
          product: cartItem.product,
          name: cartItem.name
        }}
      });
    }

    // Get the product to check stock and get latest price
    const product = await Product.findById(cartItem.product);
    if (!product) {
      console.error('Product not found in database - ID:', cartItem.product);
      
      // Remove the item with non-existent product
      cart.items.splice(itemIndex, 1);
      await cart.save();
      
      return res.status(404).json({ 
        message: 'Sản phẩm không còn tồn tại, đã xóa khỏi giỏ hàng',
        details: { productId: cartItem.product }
      });
    }

    console.log('Found product:', {
      id: product._id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      countInStock: product.countInStock
    });

    // Check stock availability
    if (product.countInStock < parsedQuantity) {
      console.error('Insufficient stock:', {
        requested: parsedQuantity,
        available: product.countInStock
      });
      return res.status(400).json({ 
        message: `Chỉ còn ${product.countInStock} sản phẩm trong kho`,
        details: {
          requestedQuantity: parsedQuantity,
          availableQuantity: product.countInStock
        }
      });
    }

    // Create the updated item (create a new object instead of modifying the existing one)
    // Process the image URL from product
    let imageUrl = '';
    if (product.images && product.images.length > 0) {
      imageUrl = product.images[0];
    } else if (product.image) {
      imageUrl = product.image;
    }

    // Make sure imageUrl has the correct format
    if (imageUrl && !imageUrl.startsWith('/uploads') && !imageUrl.startsWith('http')) {
      imageUrl = `/uploads/${imageUrl}`;
    }

    console.log('Image URL for updated cart item:', imageUrl);

    const updatedItem = {
      _id: cartItem._id,
      product: cartItem.product,
      name: product.name,
      image: imageUrl,
      price: product.salePrice || product.price,
      originalPrice: product.price,
      quantity: parsedQuantity
    };

    // Replace the item in the cart
    cart.items[itemIndex] = updatedItem;
    
    console.log('Updated cart item:', updatedItem);

    // Save the cart
    try {
      await cart.save();
      console.log('Cart updated successfully');
    } catch (saveError) {
      console.error('Error saving cart:', {
        error: saveError.message,
        stack: saveError.stack,
        cartItem: updatedItem
      });
      
      return res.status(500).json({ 
        message: 'Lỗi khi lưu giỏ hàng',
        details: { 
          error: saveError.message,
          item: {
            id: updatedItem._id,
            product: updatedItem.product,
            quantity: updatedItem.quantity
          }
        }
      });
    }

    // Transform cart data for response
    const transformedItems = cart.items.map(item => {
      let imageUrl = '';
      
      // First try to use the image stored directly in the cart item
      if (item.image) {
        // Make sure image URL is absolute if it's a relative path
        if (item.image.startsWith('/uploads')) {
          imageUrl = item.image; // This is a relative path that frontend will resolve
        } else if (item.image.startsWith('http')) {
          imageUrl = item.image; // Already an absolute URL
        } else {
          // Prepend uploads folder to ensure frontend can resolve it
          imageUrl = `/uploads/${item.image}`;
        }
      }
      
      console.log('Cart item image resolved for item:', item.name, 'to:', imageUrl);
      
      return {
        id: item._id,
        product: item.product,
        name: item.name,
        image: imageUrl,
        price: item.price,
        originalPrice: item.originalPrice,
        quantity: item.quantity
      };
    });

    console.log('Transformed items for response:', transformedItems.map(item => ({
      id: item.id.toString(),
      image: item.image,
      name: item.name
    })));

    res.json({
      items: transformedItems,
      coupon: cart.coupon,
      shippingMethod: cart.shippingMethod
    });
  } catch (error) {
    console.error('Error in updateCartItem:', {
      error: error.message,
      stack: error.stack,
      itemId: req.params.id,
      userId: req.user?._id,
      body: req.body
    });
    res.status(500).json({ 
      message: 'Lỗi server',
      details: error.message 
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:id
// @access  Private
const removeCartItem = async (req, res) => {
  try {
    console.log('Removing cart item - ID:', req.params.id);
    
    const itemId = req.params.id;
    const userId = req.user._id;

    // Validate itemId
    if (!itemId || !mongoose.isValidObjectId(itemId)) {
      console.error('Invalid item ID:', itemId);
      return res.status(400).json({ 
        message: 'ID sản phẩm không hợp lệ',
        details: { itemId }
      });
    }

    // Find cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      console.error('Cart not found for user:', userId);
      return res.status(404).json({ 
        message: 'Giỏ hàng không tồn tại',
        details: { userId } 
      });
    }

    // Debug info about cart items
    console.log('Cart items before removal:', cart.items.map(item => ({
      id: item._id.toString(),
      product: item.product.toString(),
      name: item.name,
      quantity: item.quantity
    })));

    // Convert itemId to ObjectId for proper comparison
    const itemObjectId = new mongoose.Types.ObjectId(itemId);

    // Check if item exists in cart before removal
    const itemExists = cart.items.some(item => item._id.equals(itemObjectId));
    if (!itemExists) {
      console.error('Item not found in cart - Item ID:', itemId);
      return res.status(404).json({ 
        message: 'Sản phẩm không tồn tại trong giỏ hàng',
        details: { 
          itemId,
          itemsCount: cart.items.length,
          availableItemIds: cart.items.map(item => item._id.toString())
        }
      });
    }

    // Remove item from cart
    cart.items = cart.items.filter(item => !item._id.equals(itemObjectId));
    
    console.log('Cart items after removal:', cart.items.map(item => ({
      id: item._id.toString(),
      product: item.product.toString(),
      name: item.name,
      quantity: item.quantity
    })));

    // Save the cart
    try {
      await cart.save();
      console.log('Cart saved successfully after removal');
    } catch (saveError) {
      console.error('Error saving cart after removal:', {
        error: saveError.message,
        stack: saveError.stack
      });
      
      return res.status(500).json({ 
        message: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng',
        details: { error: saveError.message }
      });
    }

    // Transform cart data for response
    const transformedItems = cart.items.map(item => {
      let imageUrl = '';
      
      // First try to use the image stored directly in the cart item
      if (item.image) {
        // Make sure image URL is absolute if it's a relative path
        if (item.image.startsWith('/uploads')) {
          imageUrl = item.image; // This is a relative path that frontend will resolve
        } else if (item.image.startsWith('http')) {
          imageUrl = item.image; // Already an absolute URL
        } else {
          // Prepend uploads folder to ensure frontend can resolve it
          imageUrl = `/uploads/${item.image}`;
        }
      }
      
      console.log('Cart item image resolved for item:', item.name, 'to:', imageUrl);
      
      return {
        id: item._id,
        product: item.product,
        name: item.name,
        image: imageUrl,
        price: item.price,
        originalPrice: item.originalPrice,
        quantity: item.quantity
      };
    });
    
    console.log('Transformed items after removal:', transformedItems.map(item => ({
      id: item.id.toString(),
      image: item.image,
      name: item.name
    })));

    res.json({
      items: transformedItems,
      coupon: cart.coupon,
      shippingMethod: cart.shippingMethod
    });
  } catch (error) {
    console.error('Error in removeCartItem:', {
      error: error.message,
      stack: error.stack,
      itemId: req.params.id,
      userId: req.user?._id
    });
    res.status(500).json({ 
      message: 'Lỗi server',
      details: error.message 
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
    }

    cart.items = [];
    await cart.save();

    res.json({
      items: [],
      coupon: null,
      shippingMethod: null
    });
  } catch (error) {
    console.error('Error in clearCart:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
}; 