#!/bin/bash

set -eo pipefail

echo "Booting up the containers..."

docker-compose up -d
echo "Waiting for containers to start ... (10 second pause)"
sleep 10

echo "Initializing..."

docker-compose exec -u sail app composer install

if [ ! -f ".env" ] && [ -f ".env.encrypted" ]; then
  if [ -z "$LOCAL_ENCRYPTION_KEY" ]; then
    echo "No LOCAL_ENCRYPTION_KEY defined in .devconfig. Please reach out to the DevOps (@devops) team for assistance."
    exit 1
  fi
  echo "Decrypting .env.encrypted"
  docker-compose exec -u sail app php artisan env:decrypt --key="$LOCAL_ENCRYPTION_KEY" --filename=.env --force
fi

docker-compose exec -u sail app php artisan migrate
docker-compose exec -u sail app php artisan db:seed
