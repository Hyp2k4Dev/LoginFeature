const express = require("express");
const router = express.Router();
const Product = require("../model/Product");

// Get all products
// Show all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find({});
    res.render("products", { products });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Show form to add a new product
app.get("/products/new", (req, res) => {
  res.render("new-product");
});

// Handle form submission to add a new product
app.post("/products", async (req, res) => {
  try {
    const { name, description, price, image } = req.body;
    const newProduct = new Product({ name, description, price, image });
    await newProduct.save();
    res.redirect("/products");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Show form to edit a product
app.get("/products/:id/edit", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.render("edit-product", { product });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Handle form submission to update a product
app.put("/products/:id", async (req, res) => {
  try {
    const { name, description, price, image } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, image },
      { new: true }
    );
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.redirect("/products");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Show a single product
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.render("product", { product });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
