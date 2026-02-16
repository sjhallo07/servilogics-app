#!/usr/bin/env bash
set -euo pipefail

# Builds Docker images and exports them as tar files into ./docker-output

OUT_DIR="$(pwd)/docker-output"
mkdir -p "$OUT_DIR"

echo "Building images with docker-compose..."
docker-compose -f docker-compose.yml build --parallel

IMAGES=("servilogics-app_backend" "servilogics-app_frontend")

echo "Saving images to $OUT_DIR"
for img in "$(docker images --format '{{.Repository}}:{{.Tag}}' | grep servilogics-app | tr '\n' ' ')"; do
  echo "Saving $img"
  name=$(echo "$img" | sed 's/[:\/]/_/g')
  docker save "$img" -o "$OUT_DIR/${name}.tar"
done

echo "Done. Files in $OUT_DIR"
