#!/bin/bash

# VSCode Extension Publishing Automation Script
# Publishes to both Microsoft Marketplace and Open VSX Registry

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PACKAGE_JSON="$PROJECT_ROOT/package.json"

# Default values
PUBLISH_MICROSOFT=true
PUBLISH_OPENVSX=true
VERSION_BUMP=""
PRE_RELEASE=false
DRY_RUN=false
FORCE=false

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

# Function to show usage
show_usage() {
    cat << EOF
VSCode Extension Publishing Script

Usage: $0 [OPTIONS]

OPTIONS:
    -h, --help              Show this help message
    -v, --version BUMP      Version bump type (patch|minor|major|VERSION)
    -m, --microsoft-only    Publish only to Microsoft Marketplace
    -o, --openvsx-only      Publish only to Open VSX Registry
    -p, --pre-release       Publish as pre-release version
    -d, --dry-run           Show what would be done without actually publishing
    -f, --force             Force publish even if validation fails
    --skip-build            Skip the build step
    --skip-tests            Skip running tests

ENVIRONMENT VARIABLES:
    VSCE_PAT               Personal Access Token for Microsoft Marketplace
    OVSX_PAT               Personal Access Token for Open VSX Registry

EXAMPLES:
    $0                                    # Publish current version to both marketplaces
    $0 -v patch                          # Bump patch version and publish
    $0 -v 1.2.3 --microsoft-only        # Publish specific version to Microsoft only
    $0 --pre-release                     # Publish as pre-release
    $0 --dry-run                         # Show what would be published

EOF
}

# Function to validate prerequisites
validate_prerequisites() {
    print_status "Validating prerequisites..."
    
    # Check if we're in the right directory
    if [[ ! -f "$PACKAGE_JSON" ]]; then
        print_error "package.json not found. Please run this script from the project root or scripts directory."
        exit 1
    fi
    
    # Check required tools
    if ! command -v npm &> /dev/null; then
        print_error "npm is required but not installed."
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is required but not installed."
        exit 1
    fi
    
    # Check vsce for Microsoft publishing
    if [[ "$PUBLISH_MICROSOFT" == true ]]; then
        if ! command -v vsce &> /dev/null; then
            print_warning "vsce not found. Installing..."
            npm install -g @vscode/vsce
        fi
        
        if [[ -z "$VSCE_PAT" ]]; then
            print_error "VSCE_PAT environment variable is required for Microsoft Marketplace publishing."
            print_error "Set it with: export VSCE_PAT='your-token-here'"
            exit 1
        fi
    fi
    
    # Check ovsx for Open VSX publishing
    if [[ "$PUBLISH_OPENVSX" == true ]]; then
        if ! command -v ovsx &> /dev/null; then
            print_warning "ovsx not found. Installing..."
            npm install -g ovsx
        fi
        
        if [[ -z "$OVSX_PAT" ]]; then
            print_error "OVSX_PAT environment variable is required for Open VSX Registry publishing."
            print_error "Set it with: export OVSX_PAT='your-token-here'"
            exit 1
        fi
    fi
    
    print_success "Prerequisites validated"
}

# Function to get package information
get_package_info() {
    if ! command -v jq &> /dev/null; then
        # Fallback if jq is not available
        PACKAGE_NAME=$(node -p "require('$PACKAGE_JSON').name")
        PACKAGE_VERSION=$(node -p "require('$PACKAGE_JSON').version")
        PUBLISHER=$(node -p "require('$PACKAGE_JSON').publisher")
    else
        PACKAGE_NAME=$(jq -r '.name' "$PACKAGE_JSON")
        PACKAGE_VERSION=$(jq -r '.version' "$PACKAGE_JSON")
        PUBLISHER=$(jq -r '.publisher' "$PACKAGE_JSON")
    fi
    
    if [[ "$PACKAGE_NAME" == "null" || "$PACKAGE_VERSION" == "null" || "$PUBLISHER" == "null" ]]; then
        print_error "Could not read package information from package.json"
        exit 1
    fi
    
    print_status "Package: $PUBLISHER.$PACKAGE_NAME@$PACKAGE_VERSION"
}

# Function to run tests
run_tests() {
    if [[ "$SKIP_TESTS" == true ]]; then
        print_warning "Skipping tests"
        return
    fi
    
    print_status "Running tests..."
    cd "$PROJECT_ROOT"
    
    # Check if test script exists
    if npm run test --silent 2>/dev/null; then
        print_success "Tests passed"
    else
        print_warning "No test script found or tests failed"
        if [[ "$FORCE" != true ]]; then
            read -p "Continue anyway? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    fi
}

# Function to build extension
build_extension() {
    if [[ "$SKIP_BUILD" == true ]]; then
        print_warning "Skipping build"
        return
    fi
    
    print_status "Building extension..."
    cd "$PROJECT_ROOT"
    
    # Install dependencies
    npm install
    
    # Run build script
    if npm run vscode:prepublish 2>/dev/null; then
        print_success "Build completed"
    else
        print_warning "No vscode:prepublish script found, trying compile..."
        if npm run compile 2>/dev/null; then
            print_success "Compile completed"
        else
            print_warning "No build script found"
        fi
    fi
}

# Function to bump version
bump_version() {
    if [[ -z "$VERSION_BUMP" ]]; then
        return
    fi
    
    print_status "Bumping version: $VERSION_BUMP"
    cd "$PROJECT_ROOT"
    
    case "$VERSION_BUMP" in
        patch|minor|major)
            npm version "$VERSION_BUMP" --no-git-tag-version
            ;;
        *)
            # Assume it's a specific version
            npm version "$VERSION_BUMP" --no-git-tag-version
            ;;
    esac
    
    # Update package info after version bump
    get_package_info
    print_success "Version bumped to $PACKAGE_VERSION"
}

# Function to package extension
package_extension() {
    print_status "Packaging extension..."
    cd "$PROJECT_ROOT"
    
    local vsce_args=""
    if [[ "$PRE_RELEASE" == true ]]; then
        vsce_args="--pre-release"
    fi
    
    # Remove existing package
    rm -f "${PUBLISHER}.${PACKAGE_NAME}"*.vsix
    
    # Package extension
    if [[ "$DRY_RUN" == true ]]; then
        print_status "DRY RUN: Would package with: vsce package $vsce_args"
    else
        vsce package $vsce_args
        print_success "Extension packaged: ${PUBLISHER}.${PACKAGE_NAME}-${PACKAGE_VERSION}.vsix"
    fi
}

# Function to publish to Microsoft Marketplace
publish_microsoft() {
    if [[ "$PUBLISH_MICROSOFT" != true ]]; then
        return
    fi
    
    print_status "Publishing to Microsoft Marketplace..."
    cd "$PROJECT_ROOT"
    
    local vsce_args="-p $VSCE_PAT"
    if [[ "$PRE_RELEASE" == true ]]; then
        vsce_args="$vsce_args --pre-release"
    fi
    
    if [[ "$DRY_RUN" == true ]]; then
        print_status "DRY RUN: Would publish with: vsce publish $vsce_args"
    else
        if vsce publish $vsce_args; then
            print_success "Successfully published to Microsoft Marketplace"
        else
            print_error "Failed to publish to Microsoft Marketplace"
            return 1
        fi
    fi
}

# Function to publish to Open VSX Registry
publish_openvsx() {
    if [[ "$PUBLISH_OPENVSX" != true ]]; then
        return
    fi
    
    print_status "Publishing to Open VSX Registry..."
    cd "$PROJECT_ROOT"
    
    local vsix_file="${PUBLISHER}.${PACKAGE_NAME}-${PACKAGE_VERSION}.vsix"
    
    if [[ "$DRY_RUN" == true ]]; then
        print_status "DRY RUN: Would publish with: ovsx publish $vsix_file -p [TOKEN]"
    else
        if [[ -f "$vsix_file" ]]; then
            if ovsx publish "$vsix_file" -p "$OVSX_PAT"; then
                print_success "Successfully published to Open VSX Registry"
            else
                print_error "Failed to publish to Open VSX Registry"
                return 1
            fi
        else
            print_error "VSIX file not found: $vsix_file"
            return 1
        fi
    fi
}

# Function to create git tag
create_git_tag() {
    if [[ "$DRY_RUN" == true ]]; then
        print_status "DRY RUN: Would create git tag: v$PACKAGE_VERSION"
        return
    fi
    
    if git rev-parse --git-dir > /dev/null 2>&1; then
        print_status "Creating git tag: v$PACKAGE_VERSION"
        git tag "v$PACKAGE_VERSION"
        print_success "Git tag created"
        
        read -p "Push tag to remote? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git push origin "v$PACKAGE_VERSION"
            print_success "Tag pushed to remote"
        fi
    else
        print_warning "Not a git repository, skipping tag creation"
    fi
}

# Function to show summary
show_summary() {
    echo
    print_success "Publishing Summary:"
    echo "  Package: $PUBLISHER.$PACKAGE_NAME@$PACKAGE_VERSION"
    
    if [[ "$PUBLISH_MICROSOFT" == true ]]; then
        echo "  Microsoft Marketplace: ✓"
    fi
    
    if [[ "$PUBLISH_OPENVSX" == true ]]; then
        echo "  Open VSX Registry: ✓"
    fi
    
    if [[ "$PRE_RELEASE" == true ]]; then
        echo "  Pre-release: Yes"
    fi
    
    echo
    print_status "Extension URLs:"
    if [[ "$PUBLISH_MICROSOFT" == true ]]; then
        echo "  Microsoft: https://marketplace.visualstudio.com/items?itemName=$PUBLISHER.$PACKAGE_NAME"
    fi
    if [[ "$PUBLISH_OPENVSX" == true ]]; then
        echo "  Open VSX: https://open-vsx.org/extension/$PUBLISHER/$PACKAGE_NAME"
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -v|--version)
            VERSION_BUMP="$2"
            shift 2
            ;;
        -m|--microsoft-only)
            PUBLISH_MICROSOFT=true
            PUBLISH_OPENVSX=false
            shift
            ;;
        -o|--openvsx-only)
            PUBLISH_MICROSOFT=false
            PUBLISH_OPENVSX=true
            shift
            ;;
        -p|--pre-release)
            PRE_RELEASE=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_status "Starting VSCode Extension Publishing Process"
    
    validate_prerequisites
    get_package_info
    
    if [[ "$DRY_RUN" == true ]]; then
        print_warning "DRY RUN MODE - No actual publishing will occur"
    fi
    
    run_tests
    build_extension
    bump_version
    package_extension
    
    # Publish to marketplaces
    local publish_failed=false
    
    if ! publish_microsoft; then
        publish_failed=true
    fi
    
    if ! publish_openvsx; then
        publish_failed=true
    fi
    
    if [[ "$publish_failed" == true ]]; then
        print_error "Some publishing steps failed"
        exit 1
    fi
    
    create_git_tag
    show_summary
    
    print_success "Publishing process completed successfully!"
}

# Run main function
main "$@"
