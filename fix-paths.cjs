const fs = require('fs');
const path = require('path');

// Fix paths in app/index.html
const htmlPath = './dist/app/index.html';
if (fs.existsSync(htmlPath)) {
  let content = fs.readFileSync(htmlPath, 'utf8');
  content = content.replace(/href="\.\/favicon/g, 'href="/favicon');
  content = content.replace(/src="\.\/assets\//g, 'src="/assets/');
  content = content.replace(/href="\/app\/favicon/g, 'href="/favicon');
  fs.writeFileSync(htmlPath, content);
  console.log('✅ Fixed asset paths in app/index.html');
}

// Also fix main index.html if it exists
const mainHtmlPath = './dist/index.html';
if (fs.existsSync(mainHtmlPath) && !mainHtmlPath.includes('landing')) {
  let content = fs.readFileSync(mainHtmlPath, 'utf8');
  content = content.replace(/href="\.\/favicon/g, 'href="/favicon');
  content = content.replace(/src="\.\/assets\//g, 'src="/assets/');
  fs.writeFileSync(mainHtmlPath, content);
  console.log('✅ Fixed asset paths in index.html');
}

console.log('✅ Path fixing complete');
