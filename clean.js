const fs = require('fs');
const paths = [
    'client/src/store/useAuthStore.ts',
    'client/src/components/AuthGuard.tsx',
    'client/src/app/register/page.tsx',
    'client/src/app/login/page.tsx',
    'server/src/routes/auth.ts',
    'server/src/middleware/auth.ts'
];
paths.forEach(p => {
    try {
        fs.rmSync(p, { force: true, recursive: true });
        console.log('Deleted ' + p);
    } catch (e) {
        console.error('Failed ' + p, e);
    }
});
