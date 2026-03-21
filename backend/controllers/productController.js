const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;

const getAllProducts = async (req, res) => {
  try {
    const { search = '', category = 'All', minPrice, maxPrice } = req.query;
    const query = {};

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') query.price.$lte = Number(maxPrice);
      if (Object.keys(query.price).length === 0) delete query.price;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.status(200).json(products);
  }
  catch (e) { res.status(500).json({ message: 'Server Error: Could not fetch products.' }); }
};

const getProductById = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    p ? res.status(200).json(p) : res.status(404).json({ message: 'Product not found.' });
  } catch (e) { res.status(500).json({ message: 'Server Error: Could not fetch product.' }); }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, countInStock } = req.body;
    const product = await Product.create({
      name, description, price: Number(price), category,
      countInStock: countInStock ? Number(countInStock) : 0,
      image: req.file ? req.file.path : null, imageId: req.file ? req.file.filename : null
    });
    res.status(201).json({ message: 'Product created successfully!', product });
  } catch (e) { res.status(500).json({ message: 'Server Error: Could not create product.' }); }
};

const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, countInStock } = req.body;
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found.' });

    if (req.file) {
      if (p.imageId) await cloudinary.uploader.destroy(p.imageId);
      p.image = req.file.path; p.imageId = req.file.filename;
    }

    p.name = name || p.name;
    p.description = description || p.description;
    p.price = price ? Number(price) : p.price;
    p.category = category || p.category;
    if (countInStock !== undefined) p.countInStock = Number(countInStock);

    res.status(200).json({ message: 'Product updated!', product: await p.save() });
  } catch (e) { res.status(500).json({ message: 'Server Error: Could not update product.' }); }
};

const deleteProduct = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found.' });
    if (p.imageId) await cloudinary.uploader.destroy(p.imageId);
    await p.deleteOne();
    res.status(200).json({ message: 'Product deleted successfully!' });
  } catch (e) { res.status(500).json({ message: 'Server Error: Could not delete product.' }); }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
