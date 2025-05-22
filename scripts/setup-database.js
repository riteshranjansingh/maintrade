const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🗄️ Setting up database...');

// Ensure prisma directory exists
const prismaDir = path.join(process.cwd(), 'prisma');
if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir, { recursive: true });
  console.log('📁 Created prisma directory');
}

try {
  // Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Push schema to database (creates tables)
  console.log('📊 Creating database tables...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('✅ Database setup completed successfully!');
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  process.exit(1);
}