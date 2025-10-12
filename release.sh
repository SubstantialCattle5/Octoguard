#!/bin/bash

# Octoguard Release Script
# This script helps manage releases and versioning for Octoguard

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository"
        exit 1
    fi
}

# Function to check if working directory is clean
check_clean_working_dir() {
    if ! git diff-index --quiet HEAD --; then
        print_error "Working directory is not clean. Please commit or stash changes first."
        exit 1
    fi
}

# Function to validate version format
validate_version() {
    local version=$1
    if [[ ! $version =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        print_error "Invalid version format. Use semantic versioning (e.g., v1.0.0)"
        exit 1
    fi
}

# Function to check if version already exists
check_version_exists() {
    local version=$1
    if git tag -l | grep -q "^$version$"; then
        print_error "Version $version already exists"
        exit 1
    fi
}

# Function to update package.json version
update_package_version() {
    local version=$1
    local version_number=${version#v}  # Remove 'v' prefix
    
    print_status "Updating package.json version to $version_number"
    
    # Update version in package.json using node
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        pkg.version = '$version_number';
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
    
    print_success "Updated package.json version"
}

# Function to create and push tag
create_tag() {
    local version=$1
    
    print_status "Creating tag $version"
    git tag -a "$version" -m "Release $version"
    
    print_status "Pushing tag to remote"
    git push origin "$version"
    
    print_success "Tag $version created and pushed"
}

# Function to create release using GitHub CLI
create_github_release() {
    local version=$1
    
    if ! command -v gh &> /dev/null; then
        print_warning "GitHub CLI not found. Please install it or create release manually."
        print_warning "Install from: https://cli.github.com/"
        return
    fi
    
    print_status "Creating GitHub release for $version"
    
    # Check if user is authenticated
    if ! gh auth status &> /dev/null; then
        print_warning "Not authenticated with GitHub CLI. Please run 'gh auth login' first."
        return
    fi
    
    # Check if release already exists
    if gh release view "$version" &> /dev/null; then
        print_warning "Release $version already exists. Skipping release creation."
        return
    fi
    
    # Create release
    gh release create "$version" \
        --title "Release $version" \
        --notes "## What's Changed

This release includes updates to the Octoguard GitHub Actions:

### Actions Included:
- **Low-Effort PR Triage**: Detects and labels low-effort contributions
- **Auto-Close Low-Effort PRs**: Automatically closes PRs that don't meet standards  
- **AI-Suspect Detection**: Identifies AI-assisted contributions

### Usage:
\`\`\`yaml
- name: Low-effort triage
  uses: SubstantialCattle5/Octoguard/.github/actions/low-effort@$version
  with:
    grace_hours: '48'
\`\`\`

Full documentation: https://github.com/SubstantialCattle5/Octoguard"
    
    print_success "GitHub release created for $version"
}

# Main release function
release() {
    local version=$1
    
    print_status "Starting release process for $version"
    
    # Validate inputs
    validate_version "$version"
    check_git_repo
    check_clean_working_dir
    check_version_exists "$version"
    
    # Update version
    update_package_version "$version"
    
    # Commit version change
    print_status "Committing version change"
    git add package.json
    git commit -m "chore: bump version to $version"
    
    # Create and push tag
    create_tag "$version"
    
    # Create GitHub release
    create_github_release "$version"
    
    print_success "Release $version completed successfully!"
    print_status "Next steps:"
    echo "  1. Go to your repository on GitHub"
    echo "  2. Navigate to each action file in .github/actions/"
    echo "  3. Click 'Draft a release' and publish to marketplace"
    echo "  4. Or use the GitHub web interface to publish actions"
}

# Function to show help
show_help() {
    echo "Octoguard Release Script"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  release <version>    Create a new release (e.g., v1.0.0)"
    echo "  help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 release v1.0.0"
    echo "  $0 release v1.1.0"
    echo ""
    echo "Prerequisites:"
    echo "  - Git repository with clean working directory"
    echo "  - GitHub CLI (optional, for automatic release creation)"
    echo "  - Proper permissions to push tags and create releases"
}

# Main script logic
case "${1:-}" in
    release)
        if [ -z "${2:-}" ]; then
            print_error "Version required. Usage: $0 release <version>"
            exit 1
        fi
        release "$2"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: ${1:-}"
        show_help
        exit 1
        ;;
esac
