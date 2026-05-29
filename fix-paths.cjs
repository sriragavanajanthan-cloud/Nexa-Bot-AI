const fs = require('fs');
const path = require('path');

// Fix the main app index.html
const htmlPath = './dist/app/index.html';

try {
    let content = fs.readFileSync(htmlPath, 'utf8');
    
    // Fix asset paths to use root
    content = content.replace(/href="\.\/favicon/g, 'href="/favicon');
    content = content.replace(/src="\.\/assets\//g, 'src="/assets/');
    content = content.replace(/href="\.\/assets\//g, 'href="/assets/');
    content = content.replace(/href="\/app\/favicon/g, 'href="/favicon');
    content = content.replace(/src="\/app\/assets\//g, 'src="/assets/');
    
    fs.writeFileSync(htmlPath, content);
    console.log('✅ Fixed asset paths in', htmlPath);
    
    // Also copy favicons to root dist
    const faviconFiles = ['favicon.png', 'favicon-32.png'];
    faviconFiles.forEach(file => {
        const src = path.join(__dirname, file);
        const dest = path.join(__dirname, 'dist', file);
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            console.log(`✅ Copied ${file} to dist/`);
        }
    });
} catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
}
