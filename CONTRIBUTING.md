# Contributing to GitSpicefy

Thank you for your interest in contributing to GitSpicefy! We welcome contributions from the community and are grateful for your support.

## 🤝 How to Contribute

### 1. Fork the Repository
- Fork the GitSpicefy repository to your GitHub account
- Clone your fork locally: `git clone https://github.com/your-username/gitspicefy.git`

### 2. Set Up Development Environment
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### 3. Make Your Changes
- Create a new branch: `git checkout -b feature/your-feature-name`
- Make your changes following our coding standards
- Test your changes thoroughly
- Commit with descriptive messages

### 4. Submit a Pull Request
- Push your changes to your fork
- Create a pull request with a clear description
- Link any related issues

## 🎯 Types of Contributions

### 🐛 Bug Reports
- Use the bug report template
- Include steps to reproduce
- Provide environment details
- Add screenshots if applicable

### ✨ Feature Requests
- Use the feature request template
- Explain the use case
- Describe the proposed solution
- Consider implementation complexity

### 📝 Documentation
- Fix typos and improve clarity
- Add examples and tutorials
- Update API documentation
- Translate content

### 🔧 Code Contributions
- Bug fixes
- New features
- Performance improvements
- Code refactoring

## 📋 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write meaningful variable and function names
- Add comments for complex logic

### Testing
- Write tests for new features
- Ensure existing tests pass
- Test across different browsers
- Verify mobile responsiveness

### Commit Messages
Follow conventional commits format:
```
type(scope): description

feat(auth): add GitHub OAuth integration
fix(ui): resolve mobile navigation issue
docs(readme): update installation instructions
```

## 🚀 Development Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- GitHub OAuth app
- OpenAI/Hugging Face API keys

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GITHUB_TOKEN=your_github_token
OPENAI_API_KEY=your_openai_key
HUGGINGFACE_API_KEY=your_huggingface_key
```

### Project Structure
```
gitspicefy/
├── app/                 # Next.js App Router
├── components/          # React components
├── lib/                 # Utilities and AI providers
├── contexts/            # React contexts
├── public/              # Static assets
└── docs/                # Documentation
```

## 🔍 Code Review Process

1. **Automated Checks**: All PRs must pass CI/CD checks
2. **Code Review**: At least one maintainer review required
3. **Testing**: Manual testing for UI/UX changes
4. **Documentation**: Update docs for new features

## 🎉 Recognition

Contributors will be:
- Added to the contributors list
- Mentioned in release notes
- Invited to join our Discord community
- Eligible for contributor swag

## 📞 Getting Help

- **Discord**: Join our community server
- **Issues**: Create a GitHub issue
- **Email**: Contact hassan@gitspicefy.com
- **Discussions**: Use GitHub Discussions

## 📜 Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a welcoming environment for all contributors.

---

**Happy Contributing! 🚀**

Made with ❤️ by the GitSpicefy community
