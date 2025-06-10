# GitSpicefy API Documentation 📚

This document provides comprehensive information about GitSpicefy's API endpoints and usage.

## 🔗 Base URL

```
Production: https://gitspicefy.vercel.app/api
Development: http://localhost:3000/api
```

## 🔐 Authentication

GitSpicefy uses GitHub OAuth for authentication. Include the session token in your requests.

### Headers
```http
Authorization: Bearer <session_token>
Content-Type: application/json
```

## 📋 Endpoints

### 🔍 Repository Analysis

#### `POST /analyze`
Analyze a GitHub repository and extract metadata.

**Request Body:**
```json
{
  "repositoryUrl": "https://github.com/username/repository",
  "includeFiles": true,
  "maxDepth": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "repository-name",
    "description": "Repository description",
    "language": "TypeScript",
    "frameworks": ["Next.js", "React"],
    "packageManager": "npm",
    "structure": {
      "hasTests": true,
      "hasDocumentation": false,
      "hasCI": true
    },
    "files": [
      {
        "name": "package.json",
        "type": "config",
        "content": "..."
      }
    ]
  }
}
```

#### `POST /analyze-advanced`
Advanced repository analysis with AI insights.

**Request Body:**
```json
{
  "repositoryUrl": "https://github.com/username/repository",
  "aiProvider": "openai",
  "model": "gpt-4",
  "includeCodeAnalysis": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "basicAnalysis": { /* ... */ },
    "aiInsights": {
      "projectType": "Web Application",
      "complexity": "Medium",
      "suggestedSections": [
        "Installation",
        "Usage",
        "API Reference",
        "Contributing"
      ],
      "keyFeatures": [
        "Real-time updates",
        "User authentication",
        "Responsive design"
      ]
    }
  }
}
```

### 🤖 README Generation

#### `POST /generate`
Generate a README using AI.

**Request Body:**
```json
{
  "repositoryUrl": "https://github.com/username/repository",
  "template": "professional",
  "aiProvider": "openai",
  "model": "gpt-4",
  "customizations": {
    "includeInstallation": true,
    "includeUsage": true,
    "includeLicense": true,
    "tone": "professional"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "# Project Name\n\n...",
    "metadata": {
      "generatedAt": "2024-12-15T10:30:00Z",
      "aiProvider": "openai",
      "model": "gpt-4",
      "processingTime": 3.2
    }
  }
}
```

### 👤 User Management

#### `GET /auth/user`
Get current user information.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://github.com/username.png",
    "subscription": {
      "plan": "starter",
      "generationsUsed": 5,
      "generationsLimit": 10,
      "hasAdvancedFeatures": true
    }
  }
}
```

### 📊 Admin Endpoints

#### `GET /admin/analytics`
Get platform analytics (Admin only).

**Query Parameters:**
- `timeRange`: `1d`, `7d`, `30d`, `90d`
- `metric`: `overview`, `users`, `generations`, `revenue`

**Response:**
```json
{
  "success": true,
  "analytics": {
    "users": {
      "total": 1250,
      "new": 45,
      "byPlan": {
        "free": 800,
        "starter": 300,
        "monthly": 100,
        "lifetime": 50
      }
    },
    "generations": {
      "total": 5420,
      "recent": 234,
      "byType": {
        "basic": 3200,
        "advanced": 2220
      }
    }
  }
}
```

## 🚨 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific error details"
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Invalid or missing authentication |
| `FORBIDDEN` | Insufficient permissions |
| `RATE_LIMITED` | Too many requests |
| `INVALID_REPOSITORY` | Repository not found or inaccessible |
| `GENERATION_FAILED` | AI generation failed |
| `QUOTA_EXCEEDED` | User has exceeded their plan limits |

## 📈 Rate Limiting

API requests are rate-limited based on user plan:

| Plan | Requests per minute | Burst limit |
|------|-------------------|-------------|
| Free | 10 | 20 |
| Starter | 30 | 60 |
| Monthly | 100 | 200 |
| Lifetime | 200 | 400 |

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🔧 SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @gitspicefy/sdk
```

```javascript
import { GitSpicefy } from '@gitspicefy/sdk';

const client = new GitSpicefy({
  apiKey: 'your-api-key',
  baseUrl: 'https://gitspicefy.vercel.app/api'
});

const readme = await client.generateReadme({
  repositoryUrl: 'https://github.com/username/repo',
  template: 'professional'
});
```

### Python
```bash
pip install gitspicefy
```

```python
from gitspicefy import GitSpicefy

client = GitSpicefy(api_key='your-api-key')
readme = client.generate_readme(
    repository_url='https://github.com/username/repo',
    template='professional'
)
```

## 📝 Examples

### Complete README Generation Flow

```javascript
// 1. Analyze repository
const analysis = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    repositoryUrl: 'https://github.com/username/repo'
  })
});

// 2. Generate README
const readme = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    repositoryUrl: 'https://github.com/username/repo',
    template: 'professional',
    aiProvider: 'openai'
  })
});
```

## 🆘 Support

- **Documentation**: https://docs.gitspicefy.com
- **GitHub Issues**: https://github.com/anomusly/GitSpicefy/issues
- **Discord**: https://discord.gg/gitspicefy
- **Email**: support@gitspicefy.com

---

**Last Updated**: December 2024  
**API Version**: v1.0.0
