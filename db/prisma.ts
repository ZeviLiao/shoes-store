// Import needed packages
import { PrismaClient } from '@prisma/client';

// Check if DATABASE_URL is for Neon (contains neon.tech) or local PostgreSQL
const isNeonDB = process.env.DATABASE_URL?.includes('neon.tech');

// Initialize Prisma Client
let prismaClient: PrismaClient;

if (isNeonDB) {
    // Use Neon adapter for Neon database
    const { Pool, neonConfig } = require('@neondatabase/serverless');
    const { PrismaNeon } = require('@prisma/adapter-neon');
    const ws = require('ws');

    neonConfig.webSocketConstructor = ws;
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);

    prismaClient = new PrismaClient({ adapter });
} else {
    // Use standard Prisma Client for local PostgreSQL
    prismaClient = new PrismaClient();
}

// Export with custom type extensions
export const prisma = prismaClient.$extends({
    result: {
        product: {
            price: { compute(product) { return product.price.toString() } },
            rating: { compute(product) { return product.rating.toString() } }
        }
    }
});
