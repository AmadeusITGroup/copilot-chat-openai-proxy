# VSCode Extension Documentation

This directory contains comprehensive documentation for the Chat Participant OpenAI Proxy VSCode extension, including architecture analysis, publishing guides, and automation tools.

## 📁 Documentation Structure

### Core Documentation
- **[architecture.md](./architecture.md)** - Complete technical architecture analysis of the extension
- **[publishing-guide.md](./publishing-guide.md)** - Comprehensive guide for publishing to both marketplaces

### Publishing Guides
- **[microsoft-marketplace-publishing.md](./microsoft-marketplace-publishing.md)** - Detailed Microsoft Marketplace publishing process
- **[open-vsx-publishing.md](./open-vsx-publishing.md)** - Complete Open VSX Registry publishing guide

## 🚀 Quick Start

### Manual Publishing
```bash
# Install required tools
npm install -g @vscode/vsce ovsx

# Set environment variables
export VSCE_PAT="your-microsoft-token"
export OVSX_PAT="your-open-vsx-token"

# Use automation script
./scripts/publish.sh
```

### Automated Publishing
The repository includes GitHub Actions workflow for automated publishing:
- **Trigger**: Release creation or manual workflow dispatch
- **Supports**: Both Microsoft Marketplace and Open VSX Registry
- **Features**: Version bumping, pre-release support, dual publishing

## 🏗️ Extension Architecture

The extension is a VSCode chat participant that:
- Creates a local proxy server (localhost:8080)
- Routes OpenAI API requests to GitHub Copilot
- Provides Swagger UI documentation
- Supports standard OpenAI chat completions format

### Key Components
- **Chat Handler**: Routes commands to appropriate processors
- **Intent Handlers**: Process specific commands (e.g., `/start`)
- **Proxy Server**: Express.js server with OpenAI API compatibility
- **Telemetry**: Usage tracking and feedback collection

## 📦 Publishing Process

### Prerequisites
1. **Microsoft Marketplace**:
   - Azure DevOps organization
   - Personal Access Token with Marketplace scope
   - Publisher account

2. **Open VSX Registry**:
   - Eclipse Foundation account
   - GitHub account (same as used for Eclipse)
   - Signed Publisher Agreement
   - Access token from Open VSX

### Automation Tools

#### Publishing Script (`scripts/publish.sh`)
```bash
# Basic usage
./scripts/publish.sh

# Version bump and publish
./scripts/publish.sh -v patch

# Publish to specific marketplace
./scripts/publish.sh --microsoft-only
./scripts/publish.sh --openvsx-only

# Pre-release version
./scripts/publish.sh --pre-release

# Dry run (test without publishing)
./scripts/publish.sh --dry-run
```

#### GitHub Actions Workflow
- **File**: `.github/workflows/vscode-extension-secure-publish.yml`
- **Triggers**: Release creation, manual dispatch
- **Features**: 
  - Automated testing and building
  - Dual marketplace publishing(if relevant)
  - Version management
  - Artifact uploads

## 🔧 Configuration

### Required Secrets
Add these secrets to your GitHub repository:

```
VSCE_PAT              # Microsoft Marketplace token
OVSX_PAT              # Open VSX Registry token
```

### Environment Variables
```bash
export VSCE_PAT="your-microsoft-token"
export OVSX_PAT="your-open-vsx-token"
```

## 📋 Checklist for Publishing

### Pre-Publishing
- [ ] Extension tested and working
- [ ] `package.json` has all required fields
- [ ] Publisher accounts created
- [ ] Access tokens generated
- [ ] Namespaces created (Open VSX)
- [ ] Secrets configured in GitHub

### Publishing
- [ ] Tests pass
- [ ] Extension builds successfully
- [ ] Package validation passes
- [ ] Published to Microsoft Marketplace
- [ ] Published to Open VSX Registry
- [ ] Git tags created
- [ ] Release notes updated

### Post-Publishing
- [ ] Verify extension appears in marketplaces
- [ ] Test installation from marketplaces
- [ ] Monitor for user feedback
- [ ] Update documentation if needed

## 🔗 Useful Links

### Microsoft Marketplace
- [Publisher Management](https://marketplace.visualstudio.com/manage)
- [Extension Page](https://marketplace.visualstudio.com/items?itemName=AmadeusITGroup.chat-participant-openai-proxy)

### Open VSX Registry
- [Registry Homepage](https://open-vsx.org)
- [Extension Page](https://open-vsx.org/extension/Amadeus/chat-participant-openai-proxy)

### Development Resources
- [VSCode Extension API](https://code.visualstudio.com/api)
- [vsce CLI Documentation](https://github.com/microsoft/vscode-vsce)
- [ovsx CLI Documentation](https://www.npmjs.com/package/ovsx)

## 🆘 Troubleshooting

### Common Issues
1. **Authentication Errors**: Verify tokens and permissions
2. **Build Failures**: Check dependencies and build scripts
3. **Publishing Failures**: Validate package.json and file structure
4. **Namespace Issues**: Ensure namespaces exist and are accessible

### Getting Help
- Check the troubleshooting sections in individual guides
- Review GitHub Actions logs for CI/CD issues
- Consult official documentation links
- Open issues in the repository for extension-specific problems

---

*This documentation was generated as part of the extension publishing setup process.*
