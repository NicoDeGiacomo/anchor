# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Anchor, please report it responsibly.

**Do not open a public issue.** Instead, please contact the maintainer directly:

- Open a private security advisory on [GitHub](https://github.com/NicoDeGiacomo/anchor/security/advisories/new)
- Or reach out via [LinkedIn](https://www.linkedin.com/in/nicolasdegiacomo/)

## What to Include

- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if you have one)

## Response

You can expect an initial response within 48 hours. Security issues will be prioritized and addressed as quickly as possible.

## Scope

Anchor is a fully offline, client-side application with no backend, no accounts, and no network communication. The primary security considerations are:

- Local data integrity (AsyncStorage)
- Dependency vulnerabilities
- Build and supply chain security

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | Yes       |
