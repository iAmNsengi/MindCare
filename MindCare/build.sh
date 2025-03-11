#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Creating .env file..."
cat << EOF > .env
SECRET_KEY=${SECRET_KEY}
EMAIL_HOST_USER=${EMAIL_HOST_USER}
EMAIL_HOST_PASSWORD=${EMAIL_HOST_PASSWORD}
REDIS_URL=${REDIS_URL}
EOF

echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt || {
    echo "Some packages failed to install, continuing anyway..."
}

echo "Collecting static files..."
python manage.py collectstatic --no-input

echo "Creating media directory..."
if [ -d "/app/media" ]; then
    mkdir -p /app/media/professionals
    mkdir -p /app/media/Video
    mkdir -p /app/media/videos
    mkdir -p /app/media/books
    chmod -R 755 /app/media
else
    mkdir -p media/professionals
    mkdir -p media/Video
    mkdir -p media/videos
    mkdir -p media/books
    chmod -R 755 media
fi


echo "Applying migrations..."
python manage.py migrate --noinput || {
    echo "Migration failed, but continuing..."
}

echo "Creating superuser if not exists..."
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@example.com', '123456') if not User.objects.filter(username='admin').exists() else print('Superuser already exists')"

echo "Build completed!"
