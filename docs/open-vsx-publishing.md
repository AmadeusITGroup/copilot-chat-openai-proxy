# Open VSX Registry Publishing Guide

## Overview

This guide covers publishing VSCode extensions to the Open VSX Registry, an open-source alternative to the Microsoft Visual Studio Marketplace. The registry is hosted at [open-vsx.org](https://open-vsx.org) and managed by the [Eclipse Foundation](https://www.eclipse.org/).

Based on the official documentation: [Publishing Extensions Wiki](https://github.com/EclipseFdn/open-vsx.org/wiki/Publishing-Extensions)

## Prerequisites

1. **VSCode Extension**: Working extension with proper `package.json`
2. **Eclipse Account**: Required for Publisher Agreement
3. **GitHub Account**: For Open VSX authentication
4. **ovsx Tool**: Open VSX command-line publishing tool

## Step-by-Step Publishing Process

### 1. Create Eclipse Foundation Account

**Register Eclipse Account**:
1. Go to [Eclipse Account Registration](https://accounts.eclipse.org/user/register)
2. Fill out registration form
3. **Important**: Include your GitHub username in the "GitHub Username" field
4. Use the exact same GitHub account for Open VSX login

### 2. Setup Open VSX Account

**Login to Open VSX**:
1. Visit [open-vsx.org](https://open-vsx.org)
2. Click account icon (top right corner)
3. Authorize with your GitHub account

**Link Eclipse Account**:
1. Navigate to [Profile Settings](https://open-vsx.org/user-settings/profile)
2. Click "Log in with Eclipse"
3. Authorize access to your eclipse.org account

**Sign Publisher Agreement**:
1. After successful Eclipse login, you'll see "Show Publisher Agreement" button
2. Click the button and read the agreement
3. Click "Agree" if you consent to the terms
4. **Note**: This is different from the Eclipse Contributor Agreement (ECA)

### 3. Install ovsx CLI Tool

The `ovsx` tool is the command-line interface for Open VSX operations.

**Install via npx (recommended)**:
```bash
# Use latest version without global installation
npx ovsx --help
```

**Install globally**:
```bash
npm install -g ovsx
```

### 4. Generate Access Token

**Create Token**:
1. Go to [Access Tokens](https://open-vsx.org/user-settings/tokens)
2. Click "Generate New Token"
3. Enter descriptive name (e.g., "Local Development", "CI/CD Pipeline")
4. Click "Generate Token"
5. **Important**: Copy token immediately - it won't be shown again

**Token Management**:
- Generate separate tokens for different environments
- Use descriptive names for easy identification
- Tokens can publish unlimited extensions until deleted
- Delete and regenerate if token is compromised

### 5. Create Namespace

The `publisher` field in your `package.json` defines the namespace for your extension.

**Namespace Requirements**:
- Can only contain: letters, numbers, '-', '+', '$', '~'
- Must be unique across the registry
- Cannot be changed after creation

**Create Namespace Command**:
```bash
npx ovsx create-namespace <publisher-name> -p <access-token>
```

**Example**:
```bash
npx ovsx create-namespace mycompany -p your-access-token-here
```

**Namespace Verification**:
- Creating namespace doesn't automatically make you verified owner
- For verified status, [claim ownership](https://github.com/EclipseFdn/open-vsx.org/wiki/Managing-Namespaces)
- Verified extensions show special badge

### 6. Package Extension

**Using vsce (recommended)**:
```bash
npm install -g @vscode/vsce
vsce package
```

**Ensure Proper Packaging**:
- Use official `vsce` tool only
- Other compression methods are unreliable and unsupported
- Results in `.vsix` file

### 7. Publishing Methods

#### Method 1: Publish Pre-packaged Extension

If you already have a `.vsix` file:
```bash
npx ovsx publish <file-path> -p <access-token>
```

**Example**:
```bash
npx ovsx publish my-extension-1.0.0.vsix -p your-access-token
```

#### Method 2: Build and Publish from Source

**Prepare Project**:
```bash
npm install
# or
yarn install
```

**Publish from Source**:
```bash
npx ovsx publish -p <access-token>
```

**For Yarn Projects**:
```bash
npx ovsx publish -p <access-token> --yarn
```

### 8. Web Interface Publishing

**Alternative Upload Method**:
1. Package extension: `vsce package`
2. Go to [open-vsx.org](https://open-vsx.org)
3. Click "Publish" (upper right)
4. Select "Publish Extension"
5. Drag and drop or select `.vsix` file

### 9. Extension Processing

**After Publishing**:
1. Extension appears in "Deactivated" state initially
2. Processing happens asynchronously (5-10 seconds typically)
3. Extension becomes "Active" after successful processing
4. Processing time depends on extension size and server load

**Troubleshooting Processing**:
- Large extensions take longer to process
- Check for errors in extension logs
- Contact support if processing fails

### 10. GitHub Actions Integration

**Automated Publishing**:
Use the community action: [HaaLeo/publish-vscode-extension](https://github.com/HaaLeo/publish-vscode-extension)

**Example Workflow**:
```yaml
name: Publish Extension
on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm install
      
      - name: Publish to Open VSX
        uses: HaaLeo/publish-vscode-extension@v1
        with:
          pat: ${{ secrets.OPEN_VSX_TOKEN }}
          registryUrl: https://open-vsx.org
```

### 11. Extension Management

**Update Extension**:
1. Increment version in `package.json`
2. Package and publish new version
3. Previous versions remain available

**Extension Visibility**:
- Active extensions appear in search results
- Deactivated extensions are hidden from main page
- Processing status visible in user settings

**Namespace Management**:
- View your namespaces in profile settings
- Claim ownership for verification
- Transfer ownership if needed

## Advanced Features

### Multi-Registry Publishing

Publish to both Microsoft Marketplace and Open VSX:

```bash
# Microsoft Marketplace
vsce publish

# Open VSX Registry  
npx ovsx publish -p <open-vsx-token>
```

### Environment-Specific Tokens

**Development**:
```bash
export OVSX_PAT="dev-token-here"
npx ovsx publish
```

**CI/CD**:
```yaml
env:
  OVSX_PAT: ${{ secrets.OPEN_VSX_TOKEN }}
run: npx ovsx publish
```

### Extension Validation

**Pre-publish Checks**:
- Valid `package.json` structure
- Proper version format
- Required fields present
- File size limits

**Common Issues**:
- Missing publisher field
- Invalid namespace characters
- Expired access tokens
- Network connectivity issues

## Best Practices

### Security
1. **Token Management**: Store tokens securely, never commit to version control
2. **Environment Separation**: Use different tokens for dev/prod
3. **Regular Rotation**: Regenerate tokens periodically
4. **Minimal Scope**: Use tokens only for intended purposes

### Publishing
1. **Version Control**: Tag releases in Git
2. **Testing**: Thoroughly test before publishing
3. **Documentation**: Maintain comprehensive README
4. **Changelog**: Document changes between versions
5. **Namespace**: Choose meaningful, professional names

### Automation
1. **CI/CD Integration**: Automate publishing on releases
2. **Multi-Registry**: Publish to both marketplaces
3. **Error Handling**: Implement retry logic for network issues
4. **Notifications**: Alert on publishing success/failure

## Troubleshooting

### Common Errors

**Authentication Issues**:
- Verify Eclipse account is properly linked
- Check GitHub username matches exactly
- Ensure Publisher Agreement is signed

**Token Problems**:
- Regenerate expired tokens
- Verify token permissions
- Check token format (no extra spaces)

**Namespace Issues**:
- Verify namespace exists and is accessible
- Check namespace naming rules
- Ensure publisher field matches namespace

**Publishing Failures**:
- Check network connectivity
- Verify `.vsix` file integrity
- Review extension validation errors

### Getting Help

**Resources**:
- [Open VSX Wiki](https://github.com/EclipseFdn/open-vsx.org/wiki)
- [GitHub Issues](https://github.com/eclipse/openvsx/issues)
- [Eclipse Community Forums](https://www.eclipse.org/forums/)

**Support Channels**:
- GitHub repository issues
- Eclipse Foundation support
- Community forums and discussions

## References

- [Open VSX Registry](https://open-vsx.org)
- [Publishing Extensions Wiki](https://github.com/EclipseFdn/open-vsx.org/wiki/Publishing-Extensions)
- [ovsx CLI Tool](https://www.npmjs.com/package/ovsx)
- [Eclipse Foundation](https://www.eclipse.org/)
- [Managing Namespaces](https://github.com/EclipseFdn/open-vsx.org/wiki/Managing-Namespaces)
- [GitHub Action for Publishing](https://github.com/HaaLeo/publish-vscode-extension)
