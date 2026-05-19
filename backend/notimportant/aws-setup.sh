#!/bin/bash

# --- Rumi Infrastructure Setup ---
set -e

echo "======================================"
echo " Rumi EC2 Docker Setup Starting"
echo "======================================"

# -----------------------------------
# 1. Update Packages
# -----------------------------------
echo ""
echo "[1/7] Updating packages..."
sudo apt update -y

# -----------------------------------
# 2. Install Dependencies
# -----------------------------------
echo ""
echo "[2/7] Installing Docker, Compose, Git, Curl..."
sudo apt install -y docker.io docker-compose git curl

# -----------------------------------
# 3. Enable Docker
# -----------------------------------
echo ""
echo "[3/7] Starting Docker service..."
sudo systemctl start docker
sudo systemctl enable docker

# -----------------------------------
# 4. Add User To Docker Group
# -----------------------------------
echo ""
echo "[4/7] Adding ubuntu user to docker group..."
sudo usermod -aG docker ubuntu

# -----------------------------------
# 5. Create Project Directory
# -----------------------------------
echo ""
echo "[5/7] Creating project directory..."

PROJECT_DIR="/home/ubuntu/rumi-app"

mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# -----------------------------------
# 6. Clone Repository
# -----------------------------------
echo ""
echo "[6/7] Cloning repository..."

git clone https://github.com/dhriti-tnm/rumi.git .

# -----------------------------------
# 7. Fetch Public IP
# -----------------------------------
echo ""
echo "[7/7] Fetching EC2 public IP..."

PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)

echo "Public IP Detected: $PUBLIC_IP"

# -----------------------------------
# 8. Create .env File
# -----------------------------------
echo ""
echo "Creating frontend's .env file..."
cd frontend/
cat > .env <<EOF
# -----------------------------
# Rumi Environment Variables
# -----------------------------
APP_ENV=production
SERVER_IP=$PUBLIC_IP
VITE_API_URL=http://$PUBLIC_IP:8000
EOF

echo "Frontend .env file created successfully."

echo ""
echo "Creating backend's .env file..."
cd ..
cd backend/
cat > .env <<EOF
# -----------------------------
# Rumi Environment Variables
# -----------------------------
DATABASE_URL = "postgresql://postgres:password@localhost:5432/db_name"
SECRET_KEY = "Secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7
EOF

echo "Backend .env file created successfully."


# -----------------------------------
# 9. Show Docker Version
# -----------------------------------
echo ""
echo "Docker Version:"
docker --version

# -----------------------------------
# 10. Final Instructions
# -----------------------------------
echo ""
echo "======================================"
echo " Setup Complete"
echo "======================================"

echo ""
echo "Project Directory:"
echo "$PROJECT_DIR"

echo ""
echo "Public Server URL:"
echo "http://$PUBLIC_IP"

echo ""
echo "Next Steps:"
echo "1. Logout and login again:"
echo "   exit"

echo ""
echo "2. SSH back into server"

echo ""
echo "3. Start application:"
echo "   cd ~/rumi-app"
echo "   docker compose up -d"

echo ""
echo "4. Check running containers:"
echo "   docker ps"

echo ""
echo "======================================"