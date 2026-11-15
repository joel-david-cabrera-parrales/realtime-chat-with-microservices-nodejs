#!/bin/bash
set -e

# Esperar a que el volumen de init esté montado (condición de carrera con bind-mount)
for i in $(seq 1 30); do
  if [ -f /etc/localstack/init/ready.d/ready.sh ]; then
    break
  fi
  echo "Esperando a que el volumen de init se monte... intento $i/30"
  sleep 1
done

awslocal s3api head-bucket --bucket "$AWS_S3_BUCKET" >/dev/null 2>&1 || \
  awslocal s3 mb "s3://$AWS_S3_BUCKET"
