import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Authentication Roots ---

// Signup
app.post('/api/auth/signup', async (req, res) => {
    const { name, sapId, branch, password } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { sapId }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User with this SAP ID already exists' });
        }

        const user = await prisma.user.create({
            data: {
                name,
                sapId,
                branch,
                password, // In a real app, hash this!
            }
        });

        res.status(201).json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { sapId, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { sapId }
        });

        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid SAP ID or Password' });
        }

        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// --- Onboarding & Profile ---

// Complete Onboarding
app.post('/api/onboarding/complete', async (req, res) => {
    const { sapId, year, leetcode, interests, goals } = req.body;

    try {
        const user = await prisma.user.update({
            where: { sapId },
            data: {
                currentYear: year,
                onboardingStep: 4, // Completed
                dynamicTwin: {
                    create: {
                        leetcodeHandle: leetcode,
                        interests: JSON.stringify(interests),
                        goals: JSON.stringify(goals)
                    }
                }
            },
            include: {
                dynamicTwin: true
            }
        });

        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get Profile
app.get('/api/user/:sapId', async (req, res) => {
    const { sapId } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { sapId },
            include: {
                dynamicTwin: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
