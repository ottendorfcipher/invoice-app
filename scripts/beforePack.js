const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = async function beforePack(context) {
  const { electronPlatformName, arch, appDir } = context;
  
  console.log(`Building for ${electronPlatformName} ${arch}`);
  console.log('App directory:', appDir);
  
  // Rebuild native modules for the target architecture
  if (electronPlatformName === 'darwin' && arch === 'arm64') {
    console.log('Rebuilding native modules for ARM64...');
    
    try {
      // Clean and rebuild better-sqlite3 for ARM64
      execSync('npm rebuild better-sqlite3 --target_arch=arm64', {
        stdio: 'inherit',
        cwd: appDir || process.cwd()
      });
      
      console.log('Native modules rebuilt successfully for ARM64');
    } catch (error) {
      console.error('Error rebuilding native modules:', error);
      // Don't throw error, just log it
      console.log('Continuing with build...');
    }
  }
  
  console.log('beforePack completed successfully');
};
