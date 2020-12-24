npm run generate &&
npm run build
cp .surgeignore dist/ &&
cp CNAME dist/ &&
cp CORS dist/ &&
zip -r9 compiled.zip ./dist &&
mv compiled.zip dist/ &&
surge dist/
