#!/bin/bash
# Build React app
npm run build
# Create webapp folder
mkdir -p dist/webapp
# Move React build to webapp
mv dist/index.html dist/webapp/
mv dist/assets dist/webapp/
# Copy landing page to root
cp landing.html dist/index.html
cp download.html dist/
