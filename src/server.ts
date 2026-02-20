import { Server } from 'http';
import app from './app';
import config from './config';
import { prisma } from './helpers/prisma';
import { seedSuperAdmin } from './helpers/seedSuperAdmin';

async function startServer() {
    let server: Server;

    try {
        await prisma.$connect();

        await seedSuperAdmin();

        server = app.listen(config.port, () => {
            console.log(`🚀 Server is running on http://localhost:${config.port}`);
        });

        process.on('unhandledRejection', (error) => {
            console.log('Unhandled Rejection is detected, we are closing our server...');
            if (server) {
                server.close(() => {
                    console.log(error);
                    process.exit(1);
                });
            } else {
                process.exit(1);
            }
        });
    } catch (error) {
        console.error('Error during server startup:', error);
        process.exit(1);
    }
}

startServer();