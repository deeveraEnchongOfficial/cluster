#!/bin/bash

set -eo pipefail

echo "Installing pre-commit file..."

path=".git/hooks/pre-commit"
rm -f $path
cp "./workspace/scripts/.pre-commit" $path
chmod a+x $path
echo "Pre-commit file installed"
