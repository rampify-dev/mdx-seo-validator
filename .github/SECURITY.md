# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in MDX SEO Validator, please report it privately:

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please email: **security@rampify.dev**

Include the following information:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### What to Expect

- **Acknowledgment:** We'll acknowledge receipt within 48 hours
- **Updates:** We'll provide regular updates on our progress
- **Timeline:** We aim to patch critical vulnerabilities within 7 days
- **Credit:** We'll credit you in the release notes (unless you prefer to remain anonymous)

### Disclosure Policy

- We'll work with you to understand and address the issue
- We'll coordinate the disclosure timeline with you
- We'll publish a security advisory after the fix is released

## Security Best Practices

This extension:
- Runs in a sandboxed VS Code environment
- Does not transmit data to external servers (unless `devServerUrl` is configured for local dev server validation)
- Only reads files within your workspace
- Does not execute arbitrary code from MDX files

If you configure `seo.devServerUrl`, ensure it points to a trusted local development server.

## Questions?

For non-security questions, please open a [GitHub issue](https://github.com/rampify-dev/mdx-seo-validator/issues).
