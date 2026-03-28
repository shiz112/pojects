const fs = require('fs');
const path = require('path');

const toDelete = [
  'src/app/login',
  'src/app/register',
  'src/store/useAuthStore.ts',
  'src/components/AuthGuard.tsx'
];

toDelete.forEach(p => {
  const fullPath = path.join(__dirname, p);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log('Deleted', fullPath);
  } else {
    console.log('Not found', fullPath);
  }
});
