#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Campus2Career — One-time Google Cloud Run setup script
# Run this ONCE after creating your GCP account.
# Usage: bash scripts/setup-cloudrun.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

# ── FILL THESE IN ─────────────────────────────────────────────────────────────
PROJECT_ID=""          # e.g. campus2career-12345  (from GCP console)
REGION="asia-south1"   # Mumbai — closest to NMIMS Hyderabad
OPENROUTER_API_KEY=""  # your OpenRouter key from openrouter.ai/keys
# ─────────────────────────────────────────────────────────────────────────────

if [ -z "$PROJECT_ID" ] || [ -z "$OPENROUTER_API_KEY" ]; then
  echo "❌ Please fill in PROJECT_ID and OPENROUTER_API_KEY at the top of this script."
  exit 1
fi

echo "🔧 Setting up Google Cloud for Campus2Career..."
echo "   Project : $PROJECT_ID"
echo "   Region  : $REGION"
echo ""

# 1. Set active project
gcloud config set project "$PROJECT_ID"

# 2. Enable required APIs
echo "⚙️  Enabling APIs (this takes ~1 min)..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com

# 3. Create Artifact Registry repo for Docker images
echo "📦 Creating Artifact Registry repository..."
gcloud artifacts repositories create campus2career \
  --repository-format=docker \
  --location="$REGION" \
  --description="Campus2Career AI backend images" \
  --quiet 2>/dev/null || echo "   (repository already exists, skipping)"

# 4. Store OpenRouter API key in Secret Manager
echo "🔑 Storing OpenRouter API key in Secret Manager..."
echo -n "$OPENROUTER_API_KEY" | gcloud secrets create openrouter-api-key \
  --data-file=- \
  --replication-policy=automatic \
  --quiet 2>/dev/null || \
  echo -n "$OPENROUTER_API_KEY" | gcloud secrets versions add openrouter-api-key --data-file=-
echo "   ✅ Secret stored"

# 5. Create a Service Account for GitHub Actions CI/CD
echo "👤 Creating GitHub Actions service account..."
SA_NAME="github-actions-deploy"
SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

gcloud iam service-accounts create "$SA_NAME" \
  --display-name="GitHub Actions Deploy" \
  --quiet 2>/dev/null || echo "   (service account already exists, skipping)"

# 6. Grant required roles to the service account
echo "🔐 Granting IAM roles..."
for ROLE in \
  "roles/run.admin" \
  "roles/artifactregistry.writer" \
  "roles/secretmanager.secretAccessor" \
  "roles/iam.serviceAccountUser"; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SA_EMAIL" \
    --role="$ROLE" \
    --quiet
done

# Also allow Cloud Run to access the secret
gcloud secrets add-iam-policy-binding openrouter-api-key \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/secretmanager.secretAccessor" \
  --quiet

# 7. Generate and download the service account key (for GitHub secret)
echo "📥 Generating service account key..."
KEY_FILE="gcp-sa-key.json"
gcloud iam service-accounts keys create "$KEY_FILE" \
  --iam-account="$SA_EMAIL" \
  --quiet

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ Setup complete! Now add these secrets to GitHub:"
echo "   Repo → Settings → Secrets and variables → Actions"
echo ""
echo "   GCP_PROJECT_ID  →  $PROJECT_ID"
echo "   GCP_REGION      →  $REGION"
echo "   GCP_SA_KEY      →  (contents of $KEY_FILE below)"
echo ""
cat "$KEY_FILE"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "⚠️  DELETE $KEY_FILE after copying it to GitHub secrets!"
echo "   rm $KEY_FILE"
echo ""
echo "Also add these if not already set:"
echo "   VITE_SUPABASE_URL      →  https://ljwnoaekevrymieukgxy.supabase.co"
echo "   VITE_SUPABASE_ANON_KEY →  (from your .env file)"
echo "   FIREBASE_SERVICE_ACCOUNT → (already set if Firebase CI was working)"
echo "═══════════════════════════════════════════════════════════════"
