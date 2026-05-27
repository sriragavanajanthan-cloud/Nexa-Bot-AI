const fs = require('fs');
const path = require('path');
const htmlPath = './dist/app/index.html';

try {
    let content = fs.readFileSync(htmlPath, 'utf8');
    // Check if this is the React app (has root div)
    if (content.includes('<div id="root"></div>')) {
        // Fix asset paths for React app
        content = content.replace(/href="\.\/favicon/g, 'href="/app/favicon');
        content = content.replace(/src="\.\/assets\//g, 'src="/app/assets/');
        fs.writeFileSync(htmlPath, content);
        console.log('✅ React app paths fixed');
    } else {
        console.log('⚠️ Not a React app, skipping');
    }
} catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
}
