#!/usr/bin/env bash
set -e

echo "=========================================="
echo "  SearchProof -> Cloud Run & Firebase Deploy"
echo "=========================================="

# Check for PROJECT_ID argument or prompt
PROJECT_ID="${1:-$GOOGLE_CLOUD_PROJECT}"
REGION="${2:-us-central1}"
SERVICE_NAME="searchproof"

if [ -z "$PROJECT_ID" ]; then
  echo ""
  echo "Usage: ./scripts/deploy-gcp.sh <PROJECT_ID> [REGION]"
  echo "Example: ./scripts/deploy-gcp.sh my-searchproof-app us-central1"
  echo ""
  read -p "Enter your Google Cloud / Firebase Project ID: " PROJECT_ID
fi

if [ -z "$PROJECT_ID" ]; then
  echo "Error: Project ID is required."
  exit 1
fi

echo ""
echo "Deploying to Project: $PROJECT_ID"
echo "Region:               $REGION"
echo "Cloud Run Service:    $SERVICE_NAME"
echo ""

# 1. Ensure gcloud is configured to this project
echo "Step 1: Setting gcloud project configuration..."
gcloud config set project "$PROJECT_ID"

# 2. Build & deploy to Cloud Run using Cloud Build (no local Docker required)
echo "Step 2: Building container and deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV="production",NEXTAUTH_URL="https://${PROJECT_ID}.web.app"

# 3. Configure .firebaserc and deploy Firebase Hosting
echo "Step 3: Deploying Firebase Hosting CDN & Rewrite rules..."
cat <<EOF > .firebaserc
{
  "projects": {
    "default": "${PROJECT_ID}"
  }
}
EOF

# Update region in firebase.json if different from us-central1
sed -i '' "s/\"region\": \".*\"/\"region\": \"${REGION}\"/" firebase.json || true

firebase deploy --only hosting --project "$PROJECT_ID"

echo ""
echo "=========================================="
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo "Your app is live with free SSL at:"
echo "👉 https://${PROJECT_ID}.web.app"
echo "👉 https://${PROJECT_ID}.firebaseapp.com"
echo "=========================================="

