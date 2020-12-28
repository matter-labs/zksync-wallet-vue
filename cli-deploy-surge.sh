#!/bin/bash

yarn build:firebase:rinkeby
cp CNAME public/ &&
cp CORS public/ &&
surge public/
