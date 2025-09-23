import { PrismaClient } from '@prisma/client';
import { hashPassword } from './lib/hash.js';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log('🔄 Réinitialisation du mot de passe admin...');
    
    const newPassword = 'admin123';
    const hashedPassword = await hashPassword(newPassword);
    
    await prisma.user.update({
      where: { email: 'admin@example.com' },
      data: { passwordHash: hashedPassword }
    });
    
    console.log('✅ Mot de passe admin réinitialisé avec succès !');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Nouveau mot de passe: admin123');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
