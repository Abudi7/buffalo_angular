#!/bin/bash

# GitHub Branch Protection Setup Script
# This script helps set up branch protection rules for professional Git workflow

echo "🔒 Setting up GitHub Branch Protection Rules..."

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first:"
    echo "   brew install gh"
    echo "   or visit: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Please authenticate with GitHub CLI first:"
    echo "   gh auth login"
    exit 1
fi

# Get repository name
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📦 Repository: $REPO"

# Function to create branch protection rule
create_branch_protection() {
    local branch=$1
    local reviewers=$2
    local require_linear_history=$3
    
    echo "🔧 Setting up protection for branch: $branch"
    
    gh api repos/$REPO/branches/$branch/protection \
        --method PUT \
        --field required_status_checks='{"strict":true,"contexts":["ci-dev","ci-staging","ci-prod"]}' \
        --field enforce_admins=false \
        --field required_pull_request_reviews='{"required_approving_review_count":'$reviewers',"dismiss_stale_reviews":true,"require_code_owner_reviews":false}' \
        --field restrictions='{"users":[],"teams":[],"apps":[]}' \
        --field allow_force_pushes=false \
        --field allow_deletions=false \
        --field required_linear_history=$require_linear_history \
        --field allow_squash_merge=true \
        --field allow_merge_commit=false \
        --field allow_rebase_merge=true \
        --field allow_auto_merge=false \
        --field delete_branch_on_merge=true
}

# Set up protection for each branch
echo "🚀 Creating branch protection rules..."

# dev branch - 1 reviewer, no linear history required
create_branch_protection "dev" 1 false

# staging branch - 2 reviewers, linear history required
create_branch_protection "staging" 2 true

# prod branch - 2 reviewers, linear history required
create_branch_protection "prod" 2 true

echo "✅ Branch protection rules created successfully!"
echo ""
echo "📋 Summary:"
echo "   • dev: 1 reviewer required, no linear history"
echo "   • staging: 2 reviewers required, linear history required"
echo "   • prod: 2 reviewers required, linear history required"
echo ""
echo "🔗 You can view and modify these rules at:"
echo "   https://github.com/$REPO/settings/branches"
echo ""
echo "🎉 Professional Git workflow is now set up!"
