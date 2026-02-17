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
        const stats = await prisma.jobSheet.groupBy({
            by: ['status'],
            where: { shopId: String(shopId) },
            _count: { _all: true }
        });

        const result = {
            received: stats.find(s => s.status === 'RECEIVED')?._count._all || 0,
            inProgress: stats.find(s => s.status === 'IN_PROGRESS')?._count._all || 0,
            ready: stats.find(s => s.status === 'READY')?._count._all || 0,
            delivered: stats.find(s => s.status === 'DELIVERED')?._count._all || 0
        };

        res.json(result);
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
            include: {
                payments: {
                    orderBy: { date: 'asc' }
                }
            },
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
                },
                payments: true
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
        const initialAdvance = parseFloat(advanceAmount) || 0;

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
                advanceAmount: initialAdvance,
                receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
                expectedAt: expectedAt ? new Date(expectedAt) : null,
                status: 'RECEIVED',
                // If there's an initial advance, create a payment record too
                payments: initialAdvance > 0 ? {
                    create: {
                        amount: initialAdvance,
                        date: new Date(),
                        note: 'Initial Advance'
                    }
                } : undefined
            }
        });

        res.status(201).json(newJob);
    } catch (error: any) {
        console.error("POST /api/jobs error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get a single job by ID
app.get('/api/jobs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const job = await prisma.jobSheet.findUnique({
            where: { id },
            include: {
                shop: {
                    select: {
                        shopName: true,
                        ownerName: true,
                        phone: true,
                        address: true,
                        city: true
                    }
                },
                payments: {
                    orderBy: { date: 'asc' }
                }
            }
        });

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json(job);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch job details' });
    }
});

// Update a job
app.put('/api/jobs/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const {
            customerName, customerPhone, customerAddress,
            category, deviceType, deviceModel, problemDesc,
            accessories, technicalDetails, estimatedCost
            // "advanceAmount" is now read-only derived from payments, but we might still accept it for legacy reasons if needed outside payments
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

/**
 * PAYMENT ENDPOINTS
 */

// Add a Payment (Installment)
app.post('/api/jobs/:id/payments', async (req, res) => {
    const { id } = req.params;
    const { amount, date, note } = req.body;

    if (!amount) return res.status(400).json({ error: 'Amount is required' });

    try {
        // 1. Create Payment Record
        const payment = await prisma.payment.create({
            data: {
                jobId: id,
                amount: parseFloat(amount),
                date: date ? new Date(date) : new Date(),
                note: note || ''
            }
        });

        // 2. Update JobSheet's total advanceAmount (denormalization for easy access)
        const job = await prisma.jobSheet.findUnique({
            where: { id },
            include: { payments: true }
        });

        if (job) {
            const totalPaid = job.payments.reduce((sum, p) => sum + p.amount, 0);
            await prisma.jobSheet.update({
                where: { id },
                data: { advanceAmount: totalPaid }
            });
        }

        res.status(201).json(payment);
    } catch (error) {
        console.error("POST /api/jobs/:id/payments error:", error);
        res.status(500).json({ error: 'Failed to add payment' });
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
