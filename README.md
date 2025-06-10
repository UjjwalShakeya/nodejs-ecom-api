# 🛍️ Node.js E-Commerce API

A RESTful API for an e-commerce platform built using **Node.js**, **Express**, and **MongoDB**. It supports user authentication, product management, cart operations, and advanced MongoDB aggregation features for analytics.


## 📦 Features

### 🧑‍💼 UserController
- **Signup** – Register with email, name, password, and user type (customer/seller)
- **Signin** – Login with email and password

### 🛒 ProductController
- **Get Products** – List all products
- **Add Product** – Add a new product (Seller only)
- **Get One Product** – Fetch a single product by ID
- **Filter Products** – Filter products based on category, price, etc.
- **Rate Product** – Submit a rating to a product
- **Add Items to Cart** – Add product to user's cart
- **Get Items of Cart** – Retrieve all items in the cart
- **Remove Items from Cart** – Remove item from user's cart
