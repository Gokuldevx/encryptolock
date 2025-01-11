const fs = require('fs');
const path = require('path');

function checkDependencies() {
  const dependencies = [
    'express', 'sqlite3', 'sequelize', 
    'jsonwebtoken', 'cors', 'helmet', 
    'dotenv'
  ];

  console.log('🔍 Checking Dependencies:');
  dependencies.forEach(dep => {
    try {
      require(dep);
      console.log(`✅ ${dep}: Installed`);
    } catch (error) {
      console.error(`❌ ${dep}: Not found`);
    }
  });
}

function checkEnvironmentFile() {
  const envPath = path.join(__dirname, '.env');
  console.log('\n🔍 Checking .env file:');
  
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file exists');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const requiredVars = [
      'PORT', 'NODE_ENV', 'DB_PATH', 
      'JWT_SECRET', 'ETHEREUM_NETWORK'
    ];

    requiredVars.forEach(variable => {
      if (envContent.includes(variable)) {
        console.log(`✅ ${variable} is defined`);
      } else {
        console.error(`❌ ${variable} is missing`);
      }
    });
  } else {
    console.error('❌ .env file not found');
  }
}

function main() {
  console.log('🛠️  EncryptoLock Backend Diagnostic Tool\n');
  checkDependencies();
  checkEnvironmentFile();
}

main();