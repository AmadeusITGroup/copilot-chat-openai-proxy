# Complete VSCode Extension Publishing Guide

## Overview

This comprehensive guide provides step-by-step instructions for publishing VSCode extensions to both Microsoft Visual Studio Marketplace and Open VSX Registry. It includes automation scripts and CI/CD workflows for streamlined publishing.

## Quick Start Checklist

- [ ] Extension is properly packaged and tested
- [ ] `package.json` contains all required fields
- [ ] Publisher accounts are set up
- [ ] Access tokens are generated and stored securely
- [ ] Namespaces are created (for Open VSX)
- [ ] CI/CD workflows are configured

## Prerequisites

### Required Tools
```bash
# Install required CLI tools
npm install -g @vscode/vsce  # Microsoft Marketplace
npm install -g ovsx          # Open VSX Registry
```

### Required Accounts
1. **Microsoft Account** - For Azure DevOps and Marketplace
2. **Eclipse Foundation Account** - For Open VSX Registry
3. **GitHub Account** - For Open VSX authentication

## Extension Preparation

### 1. Validate package.json

Ensure your `package.json` includes all required fields:

```json
{
  "name": "your-extension-name",
  "displayName": "Your Extension Display Name",
  "description": "Extension description",
  "version": "1.0.0",
  "publisher": "your-publisher-id",
  "engines": {
    "vscode": "^1.74.0"
  },
  "categories": ["Other"],
  "repository": {
    "type": "git",
    "url": "https://github.com/username/repo.git"
  },
  "bugs": {
    "url": "https://github.com/username/repo/issues"
  },
  "homepage": "https://github.com/username/repo#readme",
  "scripts": {
    "vscode:prepublish": "npm run compile"
  }
}
```

### 2. Create .vscodeignore

Exclude unnecessary files from the package:

```
.vscode/**
.vscode-test/**
src/**
.gitignore
.yarnrc
vsc-extension-quickstart.md
**/tsconfig.json
**/.eslintrc.json
**/*.map
**/*.ts
node_modules/**
.git/**
```

### 3. Security Compliance

Ensure compliance with marketplace security requirements:
- No SVG icons in `package.json`
- HTTPS URLs for all images in README/CHANGELOG
- Only trusted badge providers for SVG badges

## Microsoft Marketplace Publishing

### 1. Setup Azure DevOps

1. Create Azure DevOps organization at [dev.azure.com](https://dev.azure.com)
2. Generate Personal Access Token:
   - Go to User Settings → Personal Access Tokens
   - Create new token with "Marketplace (Manage)" scope
   - Store token securely

### 2. Create Publisher
(https://marketplace.visualstudio.com/manage/publishers/AmadeusITGroup)

1. Visit [Marketplace Publisher Management](https://marketplace.visualstudio.com/manage)
2. Create new publisher with unique ID
3. Verify publisher: `vsce login <publisher-id>`

### 3. Publish Extension

```bash
# Login (if not already done)
vsce login <publisher-id>

# Publish directly
vsce publish

# Or package first, then publish
vsce package
vsce publish <extension-name>.vsix
```

## Open VSX Registry Publishing

### 1. Setup Eclipse Account

1. Register at [Eclipse Account Registration](https://accounts.eclipse.org/user/register)
2. Include exact GitHub username in registration
3. Login to [open-vsx.org](https://open-vsx.org) with GitHub
4. Link Eclipse account in profile settings
5. Sign Publisher Agreement

### 2. Generate Access Token

1. Go to [Access Tokens](https://open-vsx.org/user-settings/tokens)
2. Generate new token with descriptive name
3. Store token securely

### 3. Create Namespace

```bash
npx ovsx create-namespace <publisher-name> -p <access-token>
```

### 4. Publish Extension

```bash
# Publish from source
npx ovsx publish -p <access-token>

# Or publish pre-packaged extension
npx ovsx publish <extension-name>.vsix -p <access-token>
```

## Dual Publishing Strategy

### Manual Dual Publishing

```bash
# Build extension
npm run vscode:prepublish
vsce package

# Publish to Microsoft Marketplace
vsce publish

# Publish to Open VSX
npx ovsx publish <extension-name>.vsix -p $OPEN_VSX_TOKEN
```

### Environment Variables

Set up environment variables for automation:

```bash
# Microsoft Marketplace
export VSCE_PAT="your-microsoft-token"

# Open VSX Registry
export OVSX_PAT="your-open-vsx-token"
```

## Version Management

### Semantic Versioning

```bash
# Patch version (1.0.0 → 1.0.1)
vsce publish patch

# Minor version (1.0.0 → 1.1.0)
vsce publish minor

# Major version (1.0.0 → 2.0.0)
vsce publish major

# Specific version
vsce publish 1.2.3
```

### Pre-release Versions

```bash
# Microsoft Marketplace
vsce publish --pre-release

# Open VSX (use pre-release version number)
vsce publish 1.0.0-beta.1
```

## Troubleshooting

### Common Issues

**Authentication Errors**:
- Verify tokens haven't expired
- Check token scopes/permissions
- Ensure publisher ID matches

**Publishing Failures**:
- Validate package.json structure
- Check file size limits
- Verify network connectivity

**Security Violations**:
- Remove SVG icons from package.json
- Use HTTPS URLs for all images
- Check badge provider whitelist

### Validation Commands

```bash
# Validate extension package
vsce package --allow-unused-files-pattern

# Check extension info
vsce show <publisher>.<extension-name>

# List published extensions
vsce ls <publisher>
```

## Best Practices

### Development Workflow
1. **Testing**: Thoroughly test extension before publishing
2. **Documentation**: Maintain comprehensive README and CHANGELOG
3. **Versioning**: Follow semantic versioning principles
4. **Security**: Never commit access tokens to version control

### Publishing Strategy
1. **Staging**: Test in development environment first
2. **Dual Publishing**: Publish to both marketplaces for maximum reach
3. **Automation**: Use CI/CD for consistent, reliable publishing
4. **Monitoring**: Track downloads, ratings, and user feedback

### Maintenance
1. **Updates**: Regular updates with bug fixes and features
2. **Support**: Respond to user issues and feedback
3. **Security**: Keep dependencies updated
4. **Deprecation**: Proper deprecation process for old versions

## Next Steps

1. **Automation**: Implement the publishing automation script
2. **CI/CD**: Set up GitHub Actions workflows
3. **Monitoring**: Configure extension analytics and monitoring
4. **Documentation**: Create user guides and API documentation

## References

- [Microsoft Marketplace Publishing](./microsoft-marketplace-publishing.md)
- [Open VSX Registry Publishing](./open-vsx-publishing.md)
- [Extension Architecture](./architecture.md)
- [Official VSCode Extension API](https://code.visualstudio.com/api)
- [vsce CLI Documentation](https://github.com/microsoft/vscode-vsce)
- [ovsx CLI Documentation](https://www.npmjs.com/package/ovsx)
