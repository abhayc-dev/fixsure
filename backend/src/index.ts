import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config();

const app = express();
const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({ adapter });
const PORT = process.env.PORT || process.env.BACKEND_PORT || 8000;

app.use(cors());
app.use(express.json());

// Basic Health Check
app.get('/', (req, res) => {
    res.json({ message: 'FixSure API is running' });
});

/**
 * AUTH ENDPOINTS (For Mobile App)
 */

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    try {
        const shop = await prisma.shop.findUnique({ where: { email: email.toLowerCase() } });
        if (!shop || !shop.password) return res.status(401).json({ error: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, shop.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

        // Remove password from response
        const { password: _, ...shopInfo } = shop;
        res.json({ success: true, shop: shopInfo });
    } catch (error) {
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// Signup
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, phone, shopName, category } = req.body;
    
    if (!email || !password || !phone || !shopName) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);
        const passwordHash = await bcrypt.hash(password, 10);

        const newShop = await prisma.shop.create({
            data: {
                email: email.toLowerCase(),
                password: passwordHash,
                phone: cleanPhone,
                shopName,
                category: category || 'GENERAL',
                isVerified: true, // Auto-verify for mobile signups for now
                subscriptionStatus: 'FREE_TRIAL',
                subscriptionEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            }
        });

        const { password: _, ...shopInfo } = newShop;
        res.status(201).json({ success: true, shop: shopInfo });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Email or phone already registered' });
        }
        res.status(500).json({ error: 'Registration failed' });
    }
});

/**
 * STATS ENDPOINTS
 */
app.get('/api/stats/jobs', async (req, res) => {
    const { shopId } = req.query;
    if (!shopId) return res.status(400).json({ error: 'shopId is required' });

    try {
        const received = await prisma.jobSheet.count({ where: { shopId: String(shopId), status: 'RECEIVED' } });
        const inProgress = await prisma.jobSheet.count({ where: { shopId: String(shopId), status: 'IN_PROGRESS' } });
        const ready = await prisma.jobSheet.count({ where: { shopId: String(shopId), status: 'READY' } });
        const delivered = await prisma.jobSheet.count({ where: { shopId: String(shopId), status: 'DELIVERED' } });

        res.json({ received, inProgress, ready, delivered });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

/**
 * JOB SHEETS ENDPOINTS
 */

// Get all jobs for a shop
app.get('/api/jobs', async (req, res) => {
    const { shopId } = req.query;
    if (!shopId) return res.status(400).json({ error: 'shopId is required' });

    try {
        const jobs = await prisma.jobSheet.findMany({
            where: { shopId: String(shopId) },
            orderBy: { receivedAt: 'desc' }
        });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

// Admin: Get ALL jobs with Shop info
app.get('/api/admin/jobs', async (req, res) => {
    try {
        const jobs = await prisma.jobSheet.findMany({
            include: {
                shop: {
                    select: {
                        shopName: true,
                        ownerName: true,
                        phone: true
                    }
                }
            },
            orderBy: { receivedAt: 'desc' }
        });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch admin jobs' });
    }
});

// Create a new job
app.post('/api/jobs', async (req, res) => {
    try {
        const { 
            shopId, customerName, customerPhone, customerAddress, 
            category, deviceType, deviceModel, problemDesc, 
            accessories, technicalDetails, estimatedCost, 
            advanceAmount, receivedAt, expectedAt 
        } = req.body;

        const jobId = `JO-${Math.floor(Math.random() * 90000) + 10000}`;
        
        const newJob = await prisma.jobSheet.create({
            data: {
                jobId,
                shopId,
                customerName,
                customerPhone,
                customerAddress,
                category: category || 'GENERAL',
                deviceType,
                deviceModel,
                problemDesc,
                accessories,
                technicalDetails: technicalDetails || null,
                estimatedCost: parseFloat(estimatedCost) || 0,
                advanceAmount: parseFloat(advanceAmount) || 0,
                receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
                expectedAt: expectedAt ? new Date(expectedAt) : null,
                status: 'RECEIVED'
            }
        });
        
        res.status(201).json(newJob);
    } catch (error: any) {
        console.error("POST /api/jobs error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Update a job
app.put('/api/jobs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { 
            customerName, customerPhone, customerAddress, 
            category, deviceType, deviceModel, problemDesc, 
            accessories, technicalDetails, estimatedCost, 
            advanceAmount
        } = req.body;

        const updatedJob = await prisma.jobSheet.update({
            where: { id },
            data: {
                customerName,
                customerPhone,
                customerAddress,
                category,
                deviceType,
                deviceModel,
                problemDesc,
                accessories,
                technicalDetails: technicalDetails || null,
                estimatedCost: estimatedCost !== undefined ? parseFloat(estimatedCost) : undefined,
                advanceAmount: advanceAmount !== undefined ? parseFloat(advanceAmount) : undefined,
                expectedAt: req.body.expectedAt ? new Date(req.body.expectedAt) : undefined,
            }
        });
        res.json(updatedJob);
    } catch (error) {
        console.error("PUT /api/jobs error:", error);
        res.status(500).json({ error: 'Failed to update job' });
    }
});

// Update Status
app.patch('/api/jobs/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const updatedJob = await prisma.jobSheet.update({
            where: { id },
            data: { status }
        });
        res.json(updatedJob);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Delete a job
app.delete('/api/jobs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.jobSheet.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete job' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend Server running on http://localhost:${PORT}`);
});
