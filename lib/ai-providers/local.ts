import { RepositoryInfo, GitHubFile } from '../github';
import { ReadmeConfig } from '../../types/readme-config';
import { generateLogoForProject } from '../svg-logo-generator';

export class LocalAIProvider {
  async generateReadme(
    repoInfo: RepositoryInfo,
    files: GitHubFile[],
    config: ReadmeConfig
  ): Promise<string> {
    const analysis = this.analyzeRepository(repoInfo, files);
    return this.generateIntelligentReadme(repoInfo, analysis, config);
  }

  private analyzeRepository(repoInfo: RepositoryInfo, files: GitHubFile[]) {
    const analysis = {
      projectType: this.detectProjectType(files, repoInfo.language),
      frameworks: this.detectFrameworks(files),
      features: this.detectFeatures(files),
      hasTests: files.some(f => f.path.includes('test') || f.path.includes('spec') || f.name.includes('test')),
      hasDocumentation: files.some(f => f.name.toLowerCase().includes('readme') || f.path.includes('docs')),
      hasCI: files.some(f => f.path.includes('.github/workflows') || f.name.includes('ci')),
      hasDocker: files.some(f => f.name.toLowerCase().includes('docker')),
      packageManager: this.detectPackageManager(files),
      buildTool: this.detectBuildTool(files),
      structure: files.filter(f => f.type === 'dir').map(f => f.name).slice(0, 10),
    };

    return analysis;
  }

  private detectProjectType(files: GitHubFile[], language: string): string {
    if (files.some(f => f.name === 'package.json')) {
      if (files.some(f => f.name === 'next.config.js' || f.name === 'next.config.mjs')) {
        return 'Next.js Application';
      }
      if (files.some(f => f.path.includes('src/App.js') || f.path.includes('src/App.tsx'))) {
        return 'React Application';
      }
      if (files.some(f => f.name === 'vue.config.js' || f.path.includes('src/App.vue'))) {
        return 'Vue.js Application';
      }
      if (files.some(f => f.name === 'angular.json')) {
        return 'Angular Application';
      }
      return 'Node.js Application';
    }
    
    if (files.some(f => f.name === 'requirements.txt' || f.name === 'pyproject.toml')) {
      if (files.some(f => f.name === 'manage.py')) {
        return 'Django Application';
      }
      if (files.some(f => f.name === 'app.py' || f.name === 'main.py')) {
        return 'Flask/FastAPI Application';
      }
      return 'Python Application';
    }
    
    if (files.some(f => f.name === 'Cargo.toml')) {
      return 'Rust Application';
    }
    
    if (files.some(f => f.name === 'go.mod')) {
      return 'Go Application';
    }
    
    if (files.some(f => f.name === 'pom.xml' || f.name === 'build.gradle')) {
      return 'Java Application';
    }
    
    return `${language} Project`;
  }

  private detectFrameworks(files: GitHubFile[]): string[] {
    const frameworks = [];
    
    // Check package.json for JavaScript frameworks
    const packageJson = files.find(f => f.name === 'package.json');
    if (packageJson && packageJson.content) {
      try {
        const pkg = JSON.parse(packageJson.content);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        
        if (deps.react) frameworks.push('React');
        if (deps.next) frameworks.push('Next.js');
        if (deps.vue) frameworks.push('Vue.js');
        if (deps.angular) frameworks.push('Angular');
        if (deps.express) frameworks.push('Express.js');
        if (deps.typescript) frameworks.push('TypeScript');
        if (deps.tailwindcss) frameworks.push('Tailwind CSS');
        if (deps.sass || deps.scss) frameworks.push('Sass/SCSS');
        if (deps.webpack) frameworks.push('Webpack');
        if (deps.vite) frameworks.push('Vite');
      } catch (e) {
        // Ignore JSON parse errors
      }
    }
    
    // Check for other framework indicators
    if (files.some(f => f.name === 'requirements.txt')) {
      // Python frameworks would be detected from requirements.txt content
      frameworks.push('Python');
    }
    
    return frameworks;
  }

  private detectFeatures(files: GitHubFile[]): string[] {
    const features = [];
    
    if (files.some(f => f.path.includes('api') || f.path.includes('routes'))) {
      features.push('RESTful API');
    }
    
    if (files.some(f => f.path.includes('auth') || f.path.includes('login'))) {
      features.push('Authentication');
    }
    
    if (files.some(f => f.path.includes('database') || f.path.includes('db') || f.name.includes('schema'))) {
      features.push('Database Integration');
    }
    
    if (files.some(f => f.path.includes('component') || f.path.includes('ui'))) {
      features.push('Component-based Architecture');
    }
    
    if (files.some(f => f.path.includes('test') || f.path.includes('spec'))) {
      features.push('Comprehensive Testing');
    }
    
    if (files.some(f => f.name.toLowerCase().includes('docker'))) {
      features.push('Docker Support');
    }
    
    if (files.some(f => f.path.includes('.github/workflows'))) {
      features.push('CI/CD Pipeline');
    }
    
    return features;
  }

  private detectPackageManager(files: GitHubFile[]): string {
    if (files.some(f => f.name === 'requirements.txt' || f.name === 'pyproject.toml' || f.name === 'setup.py' || f.name === 'Pipfile')) return 'pip';
    if (files.some(f => f.name === 'Cargo.toml')) return 'Cargo';
    if (files.some(f => f.name === 'go.mod')) return 'Go Modules';
    if (files.some(f => f.name === 'yarn.lock')) return 'Yarn';
    if (files.some(f => f.name === 'pnpm-lock.yaml')) return 'pnpm';
    if (files.some(f => f.name === 'package-lock.json' || f.name === 'package.json')) return 'npm';
    return 'Manual Setup';
  }

  private detectBuildTool(files: GitHubFile[]): string {
    if (files.some(f => f.name === 'webpack.config.js')) return 'Webpack';
    if (files.some(f => f.name === 'vite.config.js' || f.name === 'vite.config.ts')) return 'Vite';
    if (files.some(f => f.name === 'rollup.config.js')) return 'Rollup';
    if (files.some(f => f.name === 'gulpfile.js')) return 'Gulp';
    return '';
  }

  private generateIntelligentReadme(repoInfo: RepositoryInfo, analysis: any, config: ReadmeConfig): string {
    const emoji = config.addEmojisToHeadings;
    let readme = '';

    // Header with alignment
    if (config.headerAlignment === 'center') {
      readme += `<div align="center">\n\n`;
    } else if (config.headerAlignment === 'right') {
      readme += `<div align="right">\n\n`;
    }

    // Logo section
    if (config.generateLogo) {
      const svgLogo = generateLogoForProject(repoInfo.name, analysis.projectType, repoInfo.description);
      readme += `${svgLogo}\n\n`;
    }

    // Title and intelligent description
    const titleEmoji = emoji ? this.getProjectEmoji(analysis.projectType) + ' ' : '';
    readme += `# ${titleEmoji}${repoInfo.name}\n\n`;
    
    const description = this.generateIntelligentDescription(repoInfo, analysis);
    readme += `### ${description}\n\n`;

    // Badges
    if (config.sections.badges) {
      readme += this.generateBadges(repoInfo, analysis, config);
    }

    if (config.headerAlignment !== 'left') {
      readme += `</div>\n\n`;
    }

    readme += `---\n\n`;

    // Table of Contents
    readme += this.generateTableOfContents(config);

    // About section with intelligent content
    readme += this.generateAboutSection(repoInfo, analysis, config);

    // Features section with detected features
    if (config.sections.features) {
      readme += this.generateFeaturesSection(analysis, config);
    }

    // Tech Stack with detected technologies
    if (config.sections.techStack) {
      readme += this.generateTechStackSection(analysis, config);
    }

    // Installation with intelligent commands
    if (config.sections.installation) {
      readme += this.generateInstallationSection(repoInfo, analysis, config);
    }

    // Usage with project-specific examples
    if (config.sections.usage) {
      readme += this.generateUsageSection(analysis, config);
    }

    // Project Structure
    if (config.sections.projectStructure) {
      readme += this.generateProjectStructureSection(repoInfo, analysis, config);
    }

    // Project Ideas
    if (config.sections.projectIdeas) {
      readme += this.generateProjectIdeasSection(repoInfo, analysis, config);
    }

    // Roadmap
    if (config.sections.roadmap) {
      readme += this.generateRoadmapSection(analysis, config);
    }

    // Contributing
    if (config.sections.contributors) {
      readme += this.generateContributingSection(config);
    }

    // License
    if (config.sections.license) {
      readme += this.generateLicenseSection(config);
    }

    // Acknowledgments
    if (config.sections.acknowledgments) {
      readme += this.generateAcknowledgmentsSection(config);
    }

    return readme;
  }

  private getProjectEmoji(projectType: string): string {
    const emojiMap: Record<string, string> = {
      'Next.js Application': '⚡',
      'React Application': '⚛️',
      'Vue.js Application': '💚',
      'Angular Application': '🅰️',
      'Node.js Application': '🟢',
      'Django Application': '🐍',
      'Flask/FastAPI Application': '🐍',
      'Python Application': '🐍',
      'Rust Application': '🦀',
      'Go Application': '🐹',
      'Java Application': '☕',
    };
    
    return emojiMap[projectType] || '🚀';
  }

  private generateIntelligentDescription(repoInfo: RepositoryInfo, analysis: any): string {
    if (repoInfo.description) {
      return repoInfo.description;
    }

    const templates = {
      'Next.js Application': 'A modern, full-stack web application built with Next.js, featuring server-side rendering and optimal performance',
      'React Application': 'A dynamic, interactive web application built with React, showcasing modern component-based architecture',
      'Vue.js Application': 'A progressive web application built with Vue.js, combining simplicity with powerful features',
      'Node.js Application': 'A scalable server-side application built with Node.js, designed for high performance and reliability',
      'Python Application': 'A robust Python application demonstrating clean code practices and efficient problem-solving',
      'Rust Application': 'A high-performance, memory-safe application built with Rust, emphasizing speed and reliability',
      'Go Application': 'A concurrent, efficient application built with Go, designed for scalability and simplicity',
    };

    return templates[analysis.projectType as keyof typeof templates] || `A well-crafted ${repoInfo.language} project showcasing modern development practices`;
  }

  private generateBadges(repoInfo: RepositoryInfo, analysis: any, config: ReadmeConfig): string {
    const style = config.badgeStyle;
    let badges = '';

    badges += `[![GitHub stars](https://img.shields.io/github/stars/${repoInfo.fullName}?style=${style}&logo=github)](https://github.com/${repoInfo.fullName}/stargazers) `;
    badges += `[![GitHub forks](https://img.shields.io/github/forks/${repoInfo.fullName}?style=${style}&logo=github)](https://github.com/${repoInfo.fullName}/network) `;
    badges += `[![GitHub issues](https://img.shields.io/github/issues/${repoInfo.fullName}?style=${style}&logo=github)](https://github.com/${repoInfo.fullName}/issues) `;

    if (repoInfo.language) {
      badges += `[![Language](https://img.shields.io/badge/language-${repoInfo.language}-blue?style=${style})]() `;
    }

    if (analysis.hasTests) {
      badges += `[![Tests](https://img.shields.io/badge/tests-passing-brightgreen?style=${style})]() `;
    }

    if (analysis.hasCI) {
      badges += `[![CI/CD](https://img.shields.io/badge/CI%2FCD-enabled-blue?style=${style})]() `;
    }

    badges += `\n\n`;
    return badges;
  }

  private generateTableOfContents(config: ReadmeConfig): string {
    const emoji = config.addEmojisToHeadings;
    let toc = `## ${emoji ? '📚 ' : ''}Table of Contents\n\n`;

    const sections = [
      { key: 'about', title: 'About', emoji: '📋' },
      { key: 'features', title: 'Features', emoji: '✨' },
      { key: 'techStack', title: 'Tech Stack', emoji: '🛠️' },
      { key: 'installation', title: 'Getting Started', emoji: '🚀' },
      { key: 'usage', title: 'Usage', emoji: '💻' },
      { key: 'projectStructure', title: 'Project Structure', emoji: '📁' },
      { key: 'projectIdeas', title: 'Project Ideas', emoji: '💡' },
      { key: 'roadmap', title: 'Roadmap', emoji: '🗺️' },
      { key: 'contributors', title: 'Contributing', emoji: '🤝' },
      { key: 'license', title: 'License', emoji: '📄' },
    ];

    sections.forEach(section => {
      if (config.sections[section.key as keyof typeof config.sections]) {
        const prefix = config.tableOfContentsStyle === 'numbered' ? '1. ' : '- ';
        const sectionEmoji = emoji ? `${section.emoji} ` : '';
        const displayTitle = `${sectionEmoji}${section.title}`;
        // Create anchor link without emojis for proper linking
        const anchorLink = section.title.toLowerCase().replace(/\s+/g, '-');
        toc += `${prefix}[${displayTitle}](#${anchorLink})\n`;
      }
    });

    return toc + '\n';
  }

  private generateAboutSection(repoInfo: RepositoryInfo, analysis: any, config: ReadmeConfig): string {
    const emoji = config.addEmojisToHeadings ? '📋 ' : '';
    let section = `## ${emoji}About\n\n`;
    
    section += `${this.generateIntelligentDescription(repoInfo, analysis)}\n\n`;
    
    section += `### 🎯 Key Highlights\n\n`;
    section += `- **Project Type**: ${analysis.projectType}\n`;
    section += `- **Language**: ${repoInfo.language}\n`;
    section += `- **Package Manager**: ${analysis.packageManager}\n`;
    if (analysis.buildTool) section += `- **Build Tool**: ${analysis.buildTool}\n`;
    section += `- **Stars**: ${repoInfo.stars} ⭐\n`;
    section += `- **Forks**: ${repoInfo.forks} 🍴\n`;
    if (analysis.hasTests) section += `- **Testing**: ✅ Comprehensive test suite\n`;
    if (analysis.hasCI) section += `- **CI/CD**: ✅ Automated workflows\n`;
    if (analysis.hasDocker) section += `- **Docker**: ✅ Containerized deployment\n`;
    
    return section + '\n';
  }

  private generateFeaturesSection(analysis: any, config: ReadmeConfig): string {
    const emoji = config.addEmojisToHeadings ? '✨ ' : '';
    let section = `## ${emoji}Features\n\n`;

    if (config.customFeatures && config.customFeatures.length > 0) {
      config.customFeatures.forEach(feature => {
        section += `- 🚀 **${feature}**\n`;
      });
    } else {
      // Use detected features
      analysis.features.forEach((feature: string) => {
        section += `- ✅ **${feature}**\n`;
      });
      
      // Add framework-specific features
      analysis.frameworks.forEach((framework: string) => {
        section += `- 🛠️ **${framework}** - Modern ${framework} implementation\n`;
      });
      
      // Add general features
      section += `- 📱 **Responsive Design** - Works on all devices\n`;
      section += `- ⚡ **High Performance** - Optimized for speed\n`;
      section += `- 🔧 **Easy Setup** - Quick installation and configuration\n`;
    }

    return section + '\n';
  }

  private generateTechStackSection(analysis: any, config: ReadmeConfig): string {
    const emoji = config.addEmojisToHeadings ? '🛠️ ' : '';
    let section = `## ${emoji}Tech Stack\n\n`;

    if (config.customTechStack && config.customTechStack.length > 0) {
      config.customTechStack.forEach(tech => {
        section += `- **${tech}**\n`;
      });
    } else {
      // Use detected technologies
      analysis.frameworks.forEach((framework: string) => {
        section += `- **${framework}** - ${this.getTechDescription(framework)}\n`;
      });
      
      section += `- **${analysis.packageManager}** - Package management\n`;
      if (analysis.buildTool) {
        section += `- **${analysis.buildTool}** - Build tool\n`;
      }
      section += `- **Git** - Version control\n`;
      section += `- **GitHub** - Code hosting and collaboration\n`;
    }

    return section + '\n';
  }

  private getTechDescription(tech: string): string {
    const descriptions: Record<string, string> = {
      'React': 'A JavaScript library for building user interfaces',
      'Next.js': 'The React framework for production',
      'Vue.js': 'The progressive JavaScript framework',
      'Angular': 'Platform for building mobile and desktop web applications',
      'Express.js': 'Fast, unopinionated, minimalist web framework for Node.js',
      'TypeScript': 'JavaScript with syntax for types',
      'Tailwind CSS': 'Utility-first CSS framework',
      'Sass/SCSS': 'CSS extension language',
      'Webpack': 'Module bundler',
      'Vite': 'Next generation frontend tooling',
    };

    return descriptions[tech] || `${tech} framework/library`;
  }

  private generateInstallationSection(repoInfo: RepositoryInfo, analysis: any, config: ReadmeConfig): string {
    const emoji = config.addEmojisToHeadings ? '🚀 ' : '';
    let section = `## ${emoji}Getting Started\n\n`;

    section += `### Prerequisites\n\n`;
    section += this.generatePrerequisites(analysis);

    section += `\n### Installation\n\n`;
    section += `1. Clone the repository:\n`;
    section += `\`\`\`bash\n`;
    section += `git clone https://github.com/${repoInfo.fullName}.git\n`;
    section += `cd ${repoInfo.name}\n`;
    section += `\`\`\`\n\n`;

    section += `2. Install dependencies:\n`;
    section += `\`\`\`bash\n`;
    section += this.generateInstallCommands(analysis);
    section += `\`\`\`\n\n`;

    return section;
  }

  private generatePrerequisites(analysis: any): string {
    let prereqs = '';

    if (analysis.packageManager === 'pip') {
      prereqs += '- Python (3.8 or higher)\n';
      prereqs += '- pip\n';
    } else if (analysis.packageManager === 'Cargo') {
      prereqs += '- Rust (1.60 or higher)\n';
      prereqs += '- Cargo\n';
    } else if (analysis.packageManager === 'Go Modules') {
      prereqs += '- Go (1.19 or higher)\n';
    } else if (analysis.packageManager === 'npm' || analysis.packageManager === 'yarn' || analysis.packageManager === 'pnpm') {
      prereqs += '- Node.js (v16 or higher)\n';
      prereqs += `- ${analysis.packageManager}\n`;
    }

    prereqs += '- Git\n';

    return prereqs;
  }

  private generateInstallCommands(analysis: any): string {
    const commands: Record<string, string> = {
      'pip': 'pip install -r requirements.txt\n# or if using virtual environment\npython -m venv venv\nsource venv/bin/activate  # On Windows: venv\\Scripts\\activate\npip install -r requirements.txt',
      'Cargo': 'cargo build',
      'Go Modules': 'go mod download',
      'npm': 'npm install',
      'yarn': 'yarn install',
      'pnpm': 'pnpm install',
    };

    return commands[analysis.packageManager] || '# Follow project-specific installation instructions';
  }

  private generateUsageSection(analysis: any, config: ReadmeConfig): string {
    const emoji = config.addEmojisToHeadings ? '💻 ' : '';
    let section = `## ${emoji}Usage\n\n`;

    section += `\`\`\`bash\n`;
    section += this.generateUsageCommands(analysis);
    section += `\`\`\`\n\n`;

    return section;
  }

  private generateUsageCommands(analysis: any): string {
    if (analysis.packageManager === 'pip') {
      return 'python main.py\n# or\npython app.py\n# or if using a specific script\npython src/main.py';
    } else if (analysis.packageManager === 'Cargo') {
      return 'cargo run\n# or for release build\ncargo run --release';
    } else if (analysis.packageManager === 'Go Modules') {
      return 'go run main.go\n# or build and run\ngo build\n./main';
    } else if (analysis.projectType.includes('Next.js')) {
      return 'npm run dev\n# or\nyarn dev\n# or\npnpm dev\n\n# Open http://localhost:3000 in your browser';
    } else if (analysis.packageManager === 'npm' || analysis.packageManager === 'yarn' || analysis.packageManager === 'pnpm') {
      return 'npm start\n# or for development\nnpm run dev';
    }

    return '# Run the application\n# Check project documentation for specific commands';
  }

  private generateProjectStructureSection(repoInfo: RepositoryInfo, analysis: any, config: ReadmeConfig): string {
    const emoji = config.addEmojisToHeadings ? '📁 ' : '';
    let section = `## ${emoji}Project Structure\n\n`;

    section += `\`\`\`\n`;
    section += `${repoInfo.name}/\n`;
    analysis.structure.forEach((dir: string) => {
      section += `├── ${dir}/\n`;
    });
    section += `├── README.md\n`;
    section += `└── package.json\n`;
    section += `\`\`\`\n\n`;

    return section;
  }

  private generateProjectIdeasSection(repoInfo: RepositoryInfo, analysis: any, config: ReadmeConfig): string {
    const emoji = config.addEmojisToHeadings ? '💡 ' : '';
    let section = `## ${emoji}Project Ideas\n\n`;

    const ideas = this.generateIntelligentProjectIdeas(repoInfo, analysis);
    ideas.forEach(idea => {
      section += `- ${idea}\n`;
    });

    return section + '\n';
  }

  private generateIntelligentProjectIdeas(repoInfo: RepositoryInfo, analysis: any): string[] {
    const baseIdeas = [
      `Extend ${repoInfo.name} with additional ${analysis.projectType} features`,
      `Create a mobile version using React Native or Flutter`,
      `Build a comprehensive admin dashboard`,
      `Add real-time features with WebSockets`,
      `Implement advanced analytics and reporting`,
    ];

    // Add project-type specific ideas
    if (analysis.projectType.includes('React') || analysis.projectType.includes('Next.js')) {
      baseIdeas.push('Add Progressive Web App (PWA) capabilities');
      baseIdeas.push('Implement server-side rendering optimizations');
    }

    if (analysis.projectType.includes('Python')) {
      baseIdeas.push('Add machine learning capabilities');
      baseIdeas.push('Create a REST API with FastAPI');
    }

    return baseIdeas.slice(0, 5);
  }

  private generateRoadmapSection(analysis: any, config: ReadmeConfig): string {
    const emoji = config.addEmojisToHeadings ? '🗺️ ' : '';
    let section = `## ${emoji}Roadmap\n\n`;

    const roadmapItems = [
      'Improve documentation and code comments',
      'Add comprehensive unit and integration tests',
      'Performance optimization and code refactoring',
      'Implement user feedback and feature requests',
      'Add internationalization (i18n) support',
      'Create mobile-responsive design improvements',
      'Set up automated deployment pipeline',
      'Add monitoring and logging capabilities',
    ];

    roadmapItems.forEach(item => {
      section += `- [ ] ${item}\n`;
    });

    return section + '\n';
  }

  private generateContributingSection(config: ReadmeConfig): string {
    const emoji = config.addEmojisToHeadings ? '🤝 ' : '';
    let section = `## ${emoji}Contributing\n\n`;

    section += `Contributions are welcome! Please feel free to submit a Pull Request.\n\n`;
    section += `1. Fork the project\n`;
    section += `2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)\n`;
    section += `3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)\n`;
    section += `4. Push to the branch (\`git push origin feature/AmazingFeature\`)\n`;
    section += `5. Open a Pull Request\n\n`;

    return section;
  }

  private generateLicenseSection(config: ReadmeConfig): string {
    const emoji = config.addEmojisToHeadings ? '📄 ' : '';
    let section = `## ${emoji}License\n\n`;

    section += `This project is licensed under the ${config.licenseType} License - see the [LICENSE](LICENSE) file for details.\n\n`;

    return section;
  }

  private generateAcknowledgmentsSection(config: ReadmeConfig): string {
    const emoji = config.addEmojisToHeadings ? '🙏 ' : '';
    let section = `## ${emoji}Acknowledgments\n\n`;

    section += `- Thanks to all contributors who have helped shape this project\n`;
    section += `- Built with ❤️ using modern development practices\n`;
    section += `- Generated with [GitSpicefy](https://gitspicefy.com) 🚀\n\n`;

    return section;
  }

  async generateProjectIdeas(repoInfo: RepositoryInfo, files: GitHubFile[]): Promise<string[]> {
    const analysis = this.analyzeRepository(repoInfo, files);
    return this.generateIntelligentProjectIdeas(repoInfo, analysis);
  }

  async generateRoadmap(repoInfo: RepositoryInfo): Promise<string[]> {
    return [
      'Improve documentation and code comments',
      'Add comprehensive unit and integration tests',
      'Performance optimization and code refactoring',
      'Implement user feedback and feature requests',
      'Add internationalization (i18n) support',
      'Create mobile-responsive design improvements',
      'Set up automated deployment pipeline',
      'Add monitoring and logging capabilities',
    ];
  }
}
