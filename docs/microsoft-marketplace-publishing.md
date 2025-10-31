# Microsoft Visual Studio Marketplace Publishing Guide

## Overview

This guide covers the complete process of publishing VSCode extensions to the Microsoft Visual Studio Marketplace, based on the official documentation from [Visual Studio Code Extension API](https://code.visualstudio.com/api/working-with-extensions/publishing-extension).

## Prerequisites

1. **VSCode Extension**: A working VSCode extension with proper `package.json`
2. **Microsoft Account**: Required for Azure DevOps access
3. **Azure DevOps Organization**: For authentication and token management
4. **vsce Tool**: Visual Studio Code Extensions command-line tool

## Step-by-Step Publishing Process

### 1. Install and Setup vsce

The `vsce` (Visual Studio Code Extensions) tool is the official command-line tool for packaging, publishing, and managing VS Code extensions.

```bash
npm install -g @vscode/vsce
```

### 2. Create Azure DevOps Organization

1. Go to [Azure DevOps](https://dev.azure.com)
2. Sign in with your Microsoft account
3. Create a new organization (e.g., `your-org-name`)
4. Note: Organization name doesn't need to match your publisher name

### 3. Generate Personal Access Token

**Navigate to Token Creation**:
1. From your organization's home page (e.g., `https://dev.azure.com/your-org-name`)
2. Click on User settings dropdown (next to profile image)
3. Select "Personal access tokens"

**Create New Token**:
1. Click "New Token"
2. Configure token settings:
   - **Name**: Any descriptive name (e.g., "VSCode Extension Publishing")
   - **Organization**: "All accessible organizations"
   - **Expiration**: Set desired expiration date (optional)
   - **Scopes**: "Custom defined"

**Set Marketplace Permissions**:
1. Click "Show all scopes" link
2. Scroll to "Marketplace" section
3. Select "Manage" scope
4. Click "Create"

**Important**: Copy the generated token immediately and store it securely. It won't be displayed again.

### 4. Create Publisher Account

**Access Publisher Management**:
1. Go to [Visual Studio Marketplace Publisher Management](https://marketplace.visualstudio.com/manage)
2. Log in with the same Microsoft account used for Azure DevOps

**Create Publisher**:
1. Click "Create publisher"
2. Fill required fields:
   - **ID**: Unique identifier (cannot be changed later)
   - **Name**: Display name for your publisher
3. Optionally fill additional fields
4. Click "Create"

**Verify Publisher**:
```bash
vsce login <publisher-id>
```
When prompted, enter your Personal Access Token.

### 5. Prepare Extension for Publishing

**Update package.json**:
Ensure your `package.json` includes:
```json
{
  "publisher": "your-publisher-id",
  "name": "extension-name",
  "version": "1.0.0",
  "description": "Extension description",
  "repository": {
    "type": "git",
    "url": "https://github.com/username/repo.git"
  },
  "bugs": {
    "url": "https://github.com/username/repo/issues"
  },
  "homepage": "https://github.com/username/repo#readme"
}
```

**Security Constraints**:
The publishing tool enforces these security constraints:
- Icon in `package.json` cannot be SVG
- Badges must be from trusted providers or non-SVG
- Images in README.md and CHANGELOG.md must use HTTPS URLs
- SVG images only allowed from trusted badge providers

**Pre-publish Script**:
Ensure `vscode:prepublish` script is defined:
```json
{
  "scripts": {
    "vscode:prepublish": "npm run compile"
  }
}
```

### 6. Publishing Methods

#### Method 1: Automatic Publishing
```bash
vsce publish
```
This command will:
1. Package the extension
2. Upload to marketplace
3. Publish immediately

#### Method 2: Manual Publishing
```bash
# Package extension
vsce package

# This creates a .vsix file
# Upload manually at https://marketplace.visualstudio.com/manage
```

### 7. Version Management

**Auto-increment Version**:
```bash
vsce publish patch  # 1.0.0 → 1.0.1
vsce publish minor  # 1.0.0 → 1.1.0
vsce publish major  # 1.0.0 → 2.0.0
```

**Specific Version**:
```bash
vsce publish 1.2.3
```

### 8. Extension Management

**View Extension Stats**:
- Go to [Publisher Management Page](https://marketplace.visualstudio.com/manage)
- View installs, ratings, and reviews

**Update Extension**:
- Increment version in `package.json`
- Run `vsce publish` again

**Unpublish Extension**:
```bash
vsce unpublish <publisher>.<extension-name>
```

**Deprecate Extension**:
- Use marketplace web interface
- Provide migration information

### 9. Advanced Features

**Pre-release Extensions**:
```bash
vsce publish --pre-release
```

**Platform-specific Extensions**:
```bash
vsce package --target win32-x64
vsce package --target linux-x64
vsce package --target darwin-x64
```

**Using .vscodeignore**:
Create `.vscodeignore` file to exclude files from package:
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
```

### 10. CI/CD Integration

**Environment Variables**:
```bash
export VSCE_PAT="your-personal-access-token"
vsce publish
```

**GitHub Actions Example**:
```yaml
- name: Publish to Marketplace
  run: vsce publish -p ${{ secrets.VSCE_PAT }}
```

## Troubleshooting

### Common Issues

**403 Forbidden Error**:
- Verify Personal Access Token has Marketplace "Manage" scope
- Ensure token hasn't expired
- Check publisher ID matches

**Extension Already Exists**:
- Extension name/publisher combination must be unique
- Check if extension was previously published

**Tag Limit Exceeded**:
- Maximum 30 tags allowed in `package.json`
- Remove unnecessary keywords

### Best Practices

1. **Version Control**: Always tag releases in Git
2. **Changelog**: Maintain detailed CHANGELOG.md
3. **Documentation**: Comprehensive README.md
4. **Testing**: Test extension thoroughly before publishing
5. **Security**: Never commit Personal Access Tokens
6. **Backup**: Keep .vsix files for rollback capability

## References

- [Official Publishing Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Extension Manifest Reference](https://code.visualstudio.com/api/references/extension-manifest)
- [vsce GitHub Repository](https://github.com/microsoft/vscode-vsce)
- [Azure DevOps Personal Access Tokens](https://learn.microsoft.com/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate)
- [Visual Studio Marketplace](https://marketplace.visualstudio.com/)
