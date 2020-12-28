#!/bin/bash

yarn build stage
cp CNAME public/ &&
cp CORS public/ &&
surge public/
