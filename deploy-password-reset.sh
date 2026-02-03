#!/bin/bash

# Password Reset Deployment Script
# This script deploys the password reset Edge Functions to Supabase

set -e  # Exit on error

echo "🚀 Starting Password Reset Deployment"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI is not installed${NC}"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found${NC}"
echo ""

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Supabase${NC}"
    echo "Running: supabase login"
    supabase login
fi

echo -e "${GREEN}✅ Logged in to Supabase${NC}"
echo ""

# Deploy send-password-reset-email function
echo "📧 Deploying send-password-reset-email function..."
if supabase functions deploy send-password-reset-email --no-verify-jwt; then
    echo -e "${GREEN}✅ send-password-reset-email deployed successfully${NC}"
else
    echo -e "${RED}❌ Failed to deploy send-password-reset-email${NC}"
    exit 1
fi
echo ""

# Deploy update-password function
echo "🔐 Deploying update-password function..."
if supabase functions deploy update-password --no-verify-jwt; then
    echo -e "${GREEN}✅ update-password deployed successfully${NC}"
else
    echo -e "${RED}❌ Failed to deploy update-password${NC}"
    exit 1
fi
echo ""

# Check secrets
echo "🔑 Checking secrets..."
if supabase secrets list | grep -q "RESEND_API_KEY"; then
    echo -e "${GREEN}✅ RESEND_API_KEY is set${NC}"
else
    echo -e "${YELLOW}⚠️  RESEND_API_KEY is not set${NC}"
    echo "Set it with: supabase secrets set RESEND_API_KEY=your_key_here"
fi
echo ""

echo "======================================"
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Run the SQL migration: database/password_reset_codes.sql"
echo "2. Test the functions in Supabase Dashboard"
echo "3. Test the full flow on your website"
echo ""
echo "View logs with:"
echo "  supabase functions logs send-password-reset-email"
echo "  supabase functions logs update-password"
echo ""
