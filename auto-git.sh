#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🚀 Auto-Git Script${NC}"
echo "=================================="

# Check if we're in a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Not a git repository! Run 'git init' first.${NC}"
    exit 1
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo -e "${YELLOW}📝 Creating .gitignore file...${NC}"
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/

# Build outputs
dist/
build/
EOF
    
    # Clean up any previously committed large files
    echo -e "${YELLOW}🧹 Cleaning up large files from git history...${NC}"
    if [ -d "node_modules" ]; then
        git rm -r --cached node_modules/ 2>/dev/null || true
        echo -e "${GREEN}✅ Removed node_modules from git tracking${NC}"
    fi
    
    # Remove any other large files that shouldn't be tracked
    git rm --cached package-lock.json 2>/dev/null || true
fi

# Check git status
echo -e "${BLUE}📊 Current git status:${NC}"
git status --short

# Ask if user wants to create a new branch
echo ""
read -p "🌿 Create a new branch? (y/N): " create_branch

if [[ $create_branch =~ ^[Yy]$ ]]; then
    read -p "🏷️  Enter branch name: " branch_name
    if [ ! -z "$branch_name" ]; then
        echo -e "${YELLOW}🔄 Creating and switching to branch: $branch_name${NC}"
        git checkout -b "$branch_name"
    else
        echo -e "${RED}❌ Branch name cannot be empty!${NC}"
        exit 1
    fi
fi

# Show current branch
current_branch=$(git branch --show-current)
echo -e "${GREEN}📍 Current branch: $current_branch${NC}"

# Ask for commit message
echo ""
read -p "💬 Enter commit message: " commit_message

if [ -z "$commit_message" ]; then
    echo -e "${RED}❌ Commit message cannot be empty!${NC}"
    exit 1
fi

# Add all files (respecting .gitignore)
echo -e "${YELLOW}📦 Adding all files (excluding gitignored)...${NC}"
git add .

# Show what's being committed (but limit output)
echo -e "${BLUE}📝 Files to be committed:${NC}"
git diff --cached --name-only | head -20
file_count=$(git diff --cached --name-only | wc -l)
if [ $file_count -gt 20 ]; then
    echo -e "${YELLOW}... and $((file_count - 20)) more files${NC}"
fi

# Commit
echo -e "${YELLOW}💾 Committing changes...${NC}"
git commit -m "$commit_message"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Commit failed!${NC}"
    exit 1
fi

# Ask about pushing
echo ""
read -p "🚀 Push to remote? (Y/n): " push_confirm

if [[ ! $push_confirm =~ ^[Nn]$ ]]; then
    echo -e "${YELLOW}🌐 Pushing to remote...${NC}"
    
    # Check if remote branch exists
    if git ls-remote --exit-code --heads origin "$current_branch" > /dev/null 2>&1; then
        # Remote branch exists, just push
        git push origin "$current_branch"
    else
        # Remote branch doesn't exist, push and set upstream
        echo -e "${BLUE}🔗 Setting upstream and pushing...${NC}"
        git push -u origin "$current_branch"
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Successfully pushed to remote!${NC}"
        
        # Show GitHub link if it's a GitHub repo
        remote_url=$(git remote get-url origin 2>/dev/null)
        if [[ $remote_url == *"github.com"* ]]; then
            repo_path=$(echo $remote_url | sed 's/.*github\.com[:/]\(.*\)\.git.*/\1/')
            echo -e "${PURPLE}🔗 View on GitHub: https://github.com/$repo_path${NC}"
        fi
    else
        echo -e "${RED}❌ Push failed!${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⏸️  Skipped pushing to remote${NC}"
fi

echo ""
echo -e "${GREEN}🎉 All done! Your changes are committed${NC}"
if [[ ! $push_confirm =~ ^[Nn]$ ]]; then
    echo -e "${GREEN}   and pushed to the remote repository!${NC}"
fi
