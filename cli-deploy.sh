rm -rf ./node_modules ./package-lock.json .nuxt compiled.zip &&
npm i &&
npm run generate &&
cp .surgeignore dist/ &&
cp CNAME dist/ &&
cp CORS dist/ &&
zip -r9 compiled.zip ./dist &&
mv compiled.zip dist/ &&
surge dist/