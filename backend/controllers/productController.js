const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2; 

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server Error: Could not fetch products." });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server Error: Could not fetch product." });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    const imageUrl = req.file ? req.file.path : null;
    const imageId = req.file ? req.file.filename : null;

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      image: imageUrl,
      imageId: imageId
    });

    res.status(201).json({ message: "Product created successfully!", product });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Server Error: Could not create product." });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    let newImageUrl = product.image;
    let newImageId = product.imageId;

    if (req.file) {
      if (product.imageId) {
        await cloudinary.uploader.destroy(product.imageId);
      }
      newImageUrl = req.file.path;
      newImageId = req.file.filename;
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price ? Number(price) : product.price;
    product.category = category || product.category;
    product.image = newImageUrl;
    product.imageId = newImageId;

    const updatedProduct = await product.save();
    res.status(200).json({ message: "Product updated successfully!", product: updatedProduct });

  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server Error: Could not update product." });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (product.imageId) {
      await cloudinary.uploader.destroy(product.imageId);
    }

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted successfully!" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server Error: Could not delete product." });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};