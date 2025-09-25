import { PrismaClient } from '@prisma/client';
import { hashPassword } from './lib/hash.js';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log(' Cr√ation d\'un utilisateur administrateur...');

    // V√rifier si un admin existe d√j√
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (existingAdmin) {
      console.log(' Un administrateur existe d√j√:', existingAdmin.email);
      return;
    }

    // Cr√er un nouvel administrateur
    const hashedPassword = await hashPassword('admin123');
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@sneakershop.com',
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        emailVerified: true,
      },
    });

    console.log(' Administrateur cr√√ avec succ√s !');
    console.log(' Email: admin@sneakershop.com');
    console.log(' Mot de passe: admin123');
    console.log(' ID:', admin.id);

  } catch (error) {
    console.error(' Erreur lors de la cr√ation de l\'administrateur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
