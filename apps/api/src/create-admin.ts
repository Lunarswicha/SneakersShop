import { PrismaClient } from '@prisma/client';
import { hashPassword } from './lib/hash.js';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔄 Création d\'un utilisateur administrateur...');

    // Vérifier si un admin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (existingAdmin) {
      console.log('✅ Un administrateur existe déjà:', existingAdmin.email);
      return;
    }

    // Créer un nouvel administrateur
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

    console.log('✅ Administrateur créé avec succès !');
    console.log('📧 Email: admin@sneakershop.com');
    console.log('🔑 Mot de passe: admin123');
    console.log('👤 ID:', admin.id);

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
