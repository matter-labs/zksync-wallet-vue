#!/bin/bash

ACTION="$1"

if [[ $ACTION == "y:pre" ]]; then
  echo "Yarn garbage collection started"
  echo
  echo "  - dropping node_modules folder..."
  rm -rf node_modules
  echo "    Done"
  echo "  - removing .yarn cached files..."
  rm -rf .yarn/cache .yarn/build-state.yml .yarn/install-state.gz yarn.lock
  echo "    Done"
  echo "  - cleaning yarn cache..."
  yarn cache clean --all
  printf "   Done\n\n"
  echo "All done!"
fi
