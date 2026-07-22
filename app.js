require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

const cache = {
    data: null,
    expiry: 0
};

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'dist')));

// ==========================
// AUTHENTICATION
// ==========================

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.users.create({
            data: {
                username,
                password_hash: hashedPassword
            }
        });

        res.status(201).json({
            success: true,
            message: 'User registered'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Registration failed'
        });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await prisma.users.findUnique({
            where: {
                username
            }
        });

        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        res.json({
            success: true,
            token
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
});

// JWT Middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(403).json({
            error: 'No token provided'
        });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                error: 'Unauthorized'
            });
        }

        req.userId = decoded.id;
        next();
    });
};

// ==========================
// HEALTH CHECK
// ==========================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'CRUD API is running successfully!'
    });
});

// ==========================
// PRODUCTS WITH CATEGORIES
// ==========================

app.get('/api/products-with-categories', async (req, res) => {
    try {
        const products = await prisma.products.findMany({
            take: 50,
            orderBy: {
                ProductID: 'desc'
            },
            include: {
                categories: true
            }
        });

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: 'Database error'
        });
    }
});

// ==========================
// CATEGORIES CRUD
// ==========================

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await prisma.categories.findMany();

        res.json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: 'Database error'
        });
    }
});

// Get one category
app.get('/api/categories/:id', async (req, res) => {
    try {
        const category = await prisma.categories.findUnique({
            where: {
                CategoryID: parseInt(req.params.id)
            }
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

// Create category protected
app.post('/api/categories', verifyToken, async (req, res) => {
    try {
        const { CategoryName, Description } = req.body;

        if (!CategoryName) {
            return res.status(400).json({
                success: false,
                error: 'Missing category name'
            });
        }

        const category = await prisma.categories.create({
            data: {
                CategoryName,
                Description: Description || null
            }
        });

        res.status(201).json({
            success: true,
            insertedId: category.CategoryID,
            data: category
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: 'Insert failed'
        });
    }
});

// Update category protected
app.put('/api/categories/:id', verifyToken, async (req, res) => {
    try {
        const { CategoryName, Description } = req.body;

        await prisma.categories.update({
            where: {
                CategoryID: parseInt(req.params.id)
            },
            data: {
                CategoryName,
                Description
            }
        });

        res.json({
            success: true,
            message: 'Category updated'
        });
    } catch (error) {
        console.error(error);

        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Update failed'
        });
    }
});

// Delete category protected
app.delete('/api/categories/:id', verifyToken, async (req, res) => {
    try {
        await prisma.categories.delete({
            where: {
                CategoryID: parseInt(req.params.id)
            }
        });

        res.json({
            success: true,
            message: 'Category deleted'
        });
    } catch (error) {
        console.error(error);

        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Delete failed'
        });
    }
});

// ==========================
// PRODUCTS CRUD
// ==========================

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const now = Date.now();

        if (cache.data && cache.expiry > now) {
            return res.json({
                success: true,
                cached: true,
                data: cache.data
            });
        }

        const products = await prisma.products.findMany({
            take: 50,
            orderBy: {
                ProductID: 'desc'
            }
        });

        cache.data = products;
        cache.expiry = now + (60 * 1000);

        res.json({
            success: true,
            cached: false,
            data: products
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Database error'
        });
    }
});

// Get one product
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await prisma.products.findUnique({
            where: {
                ProductID: parseInt(req.params.id)
            }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
});

// Create product protected
app.post('/api/products', verifyToken, async (req, res) => {
    try {
        const {
            ProductName,
            SupplierID,
            CategoryID,
            Unit,
            Price
        } = req.body;

        if (!ProductName || !Price) {
            return res.status(400).json({
                success: false,
                error: 'Missing fields'
            });
        }

        const newProduct = await prisma.products.create({
            data: {
                ProductName,
                SupplierID: SupplierID || 1,
                CategoryID: CategoryID || 1,
                Unit: Unit || '1 box',
                Price: parseFloat(Price)
            }
        });

        res.status(201).json({
            success: true,
            insertedId: newProduct.ProductID,
            data: newProduct
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: 'Insert failed'
        });
    }
});

// Update product protected
app.put('/api/products/:id', verifyToken, async (req, res) => {
    try {
        const { ProductName, Price } = req.body;

        await prisma.products.update({
            where: {
                ProductID: parseInt(req.params.id)
            },
            data: {
                ProductName,
                Price: parseFloat(Price)
            }
        });

        res.json({
            success: true,
            message: 'Product updated'
        });

    } catch (error) {
        console.error(error);

        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Update failed'
        });
    }
});

// Delete product protected
app.delete('/api/products/:id', verifyToken, async (req, res) => {
    try {
        await prisma.products.delete({
            where: {
                ProductID: parseInt(req.params.id)
            }
        });

        res.json({
            success: true,
            message: 'Product deleted'
        });

    } catch (error) {
        console.error(error);

        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Delete failed'
        });
    }
});

// ==========================
// START SERVER
// ==========================

app.listen(port, () => {
    console.log(`Backend API listening on port ${port}`);
});