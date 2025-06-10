import { RepositoryInfo, GitHubFile } from '../github';
import { ReadmeConfig } from '../../types/readme-config';
import { generateLogoForProject } from '../svg-logo-generator';

export class HuggingFaceProvider {
  private apiKey: string;
  private baseUrl: string = 'https://api-inference.huggingface.co/models';

  constructor(apiKey?: string) {
    // Hugging Face provides free inference API without requiring API key for public models
    this.apiKey = apiKey || process.env.HUGGINGFACE_API_KEY || '';
  }

  async generateReadme(
    repoInfo: RepositoryInfo,
    files: GitHubFile[],
    config: ReadmeConfig
  ): Promise<string> {
    const prompt = this.buildPrompt(repoInfo, files, config);

    try {
      // Try multiple free models in order of preference
      const models = [
        'microsoft/DialoGPT-medium',
        'facebook/blenderbot-400M-distill',
        'microsoft/DialoGPT-small'
      ];

      for (const model of models) {
        try {
          const response = await this.queryModel(model, prompt);
          if (response && response.length > 100) {
            return this.formatResponse(response, repoInfo, config);
          }
        } catch (error) {
          console.log(`Model ${model} failed, trying next...`);
          continue;
        }
      }

      // If all AI models fail, return enhanced template
      return this.generateFallbackReadme(repoInfo, files, config);
    } catch (error) {
      console.error('Hugging Face generation error:', error);
      return this.generateFallbackReadme(repoInfo, files, config);
    }
  }

  private async queryModel(model: string, prompt: string): Promise<string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(`${this.baseUrl}/${model}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 1000,
          temperature: 0.7,
          do_sample: true,
        },
        options: {
          wait_for_model: true,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text;
    }
    
    if (data.generated_text) {
      return data.generated_text;
    }

    throw new Error('No generated text in response');
  }

  private buildPrompt(
    repoInfo: RepositoryInfo,
    files: GitHubFile[],
    config: ReadmeConfig
  ): string {
    const fileStructure = files
      .filter(f => f.type === 'file')
      .map(f => f.path)
      .slice(0, 10)
      .join(', ');

    return `Create a README.md for ${repoInfo.name} (${repoInfo.language}): ${repoInfo.description || 'A software project'}. Files: ${fileStructure}. Include installation, usage, and features.`;
  }

  private formatResponse(response: string, repoInfo: RepositoryInfo, config: ReadmeConfig): string {
    // Clean up the AI response and format it properly
    let cleaned = response.replace(/^.*?#/, '#').trim();
    
    // If response doesn't start with markdown, wrap it
    if (!cleaned.startsWith('#')) {
      const emoji = config.addEmojisToHeadings ? '🚀 ' : '';
      cleaned = `# ${emoji}${repoInfo.name}\n\n${cleaned}`;
    }

    // Add alignment if needed
    if (config.headerAlignment === 'center') {
      cleaned = `<div align="center">\n\n${cleaned}\n\n</div>`;
    } else if (config.headerAlignment === 'right') {
      cleaned = `<div align="right">\n\n${cleaned}\n\n</div>`;
    }

    return cleaned;
  }

  private generateFallbackReadme(
    repoInfo: RepositoryInfo,
    files: GitHubFile[],
    config: ReadmeConfig
  ): string {
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
      const projectType = repoInfo.language || 'application';
      const svgLogo = generateLogoForProject(repoInfo.name, projectType, repoInfo.description);
      readme += `${svgLogo}\n\n`;
    }

    // Title and description
    const titleEmoji = emoji ? '🚀 ' : '';
    readme += `# ${titleEmoji}${repoInfo.name}\n\n`;
    
    const description = repoInfo.description || `A modern ${repoInfo.language} project with advanced features`;
    readme += `### ${description}\n\n`;

    // Badges
    if (config.sections.badges) {
      const style = config.badgeStyle;
      readme += `[![GitHub stars](https://img.shields.io/github/stars/${repoInfo.fullName}?style=${style}&logo=github)](https://github.com/${repoInfo.fullName}/stargazers) `;
      readme += `[![GitHub forks](https://img.shields.io/github/forks/${repoInfo.fullName}?style=${style}&logo=github)](https://github.com/${repoInfo.fullName}/network) `;
      readme += `[![GitHub issues](https://img.shields.io/github/issues/${repoInfo.fullName}?style=${style}&logo=github)](https://github.com/${repoInfo.fullName}/issues)\n\n`;
    }

    if (config.headerAlignment !== 'left') {
      readme += `</div>\n\n`;
    }

    readme += `---\n\n`;

    // About section
    const aboutEmoji = emoji ? '📋 ' : '';
    readme += `## ${aboutEmoji}About\n\n`;
    readme += `${description}\n\n`;
    readme += `This ${repoInfo.language} project demonstrates modern development practices and includes:\n\n`;

    // Smart features based on file analysis
    const features = this.analyzeProjectFeatures(files, repoInfo);
    features.forEach(feature => {
      readme += `- ${feature}\n`;
    });

    readme += `\n`;

    // Tech Stack
    if (config.sections.techStack) {
      const techEmoji = emoji ? '🛠️ ' : '';
      readme += `## ${techEmoji}Tech Stack\n\n`;
      readme += `- **${repoInfo.language}** - Primary programming language\n`;
      
      const detectedTech = this.detectTechnologies(files);
      detectedTech.forEach(tech => {
        readme += `- **${tech}**\n`;
      });
      readme += `\n`;
    }

    // Installation
    if (config.sections.installation) {
      const installEmoji = emoji ? '🚀 ' : '';
      readme += `## ${installEmoji}Getting Started\n\n`;
      readme += `### Prerequisites\n\n`;
      readme += this.generatePrerequisites(repoInfo.language, files);
      readme += `\n### Installation\n\n`;
      readme += `\`\`\`bash\n`;
      readme += `git clone https://github.com/${repoInfo.fullName}.git\n`;
      readme += `cd ${repoInfo.name}\n`;
      readme += this.generateInstallCommands(repoInfo.language, files);
      readme += `\`\`\`\n\n`;
    }

    // Usage
    if (config.sections.usage) {
      const usageEmoji = emoji ? '💻 ' : '';
      readme += `## ${usageEmoji}Usage\n\n`;
      readme += `\`\`\`bash\n`;
      readme += this.generateUsageCommands(repoInfo.language, files);
      readme += `\`\`\`\n\n`;
    }

    // Contributing
    if (config.sections.contributors) {
      const contribEmoji = emoji ? '🤝 ' : '';
      readme += `## ${contribEmoji}Contributing\n\n`;
      readme += `Contributions are welcome! Please feel free to submit a Pull Request.\n\n`;
      readme += `1. Fork the project\n`;
      readme += `2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)\n`;
      readme += `3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)\n`;
      readme += `4. Push to the branch (\`git push origin feature/AmazingFeature\`)\n`;
      readme += `5. Open a Pull Request\n\n`;
    }

    // License
    if (config.sections.license) {
      const licenseEmoji = emoji ? '📄 ' : '';
      readme += `## ${licenseEmoji}License\n\n`;
      readme += `This project is licensed under the ${config.licenseType} License - see the [LICENSE](LICENSE) file for details.\n\n`;
    }

    // Acknowledgments
    if (config.sections.acknowledgments) {
      const ackEmoji = emoji ? '🙏 ' : '';
      readme += `## ${ackEmoji}Acknowledgments\n\n`;
      readme += `- Thanks to all contributors\n`;
      readme += `- Built with ❤️ and modern development practices\n`;
      readme += `- Generated with [GitSpicefy](https://gitspicefy.com) 🚀\n\n`;
    }

    return readme;
  }

  private analyzeProjectFeatures(files: GitHubFile[], repoInfo: RepositoryInfo): string[] {
    const features = [];
    
    features.push(`🚀 **Modern ${repoInfo.language}** - Built with latest ${repoInfo.language} features`);
    
    if (files.some(f => f.path.includes('test') || f.path.includes('spec'))) {
      features.push('🧪 **Well Tested** - Comprehensive test coverage');
    }
    
    if (files.some(f => f.path.includes('.github/workflows'))) {
      features.push('🔄 **CI/CD Ready** - Automated deployment pipeline');
    }
    
    if (files.some(f => f.name.toLowerCase().includes('docker'))) {
      features.push('🐳 **Dockerized** - Easy deployment with Docker');
    }
    
    if (files.some(f => f.name.toLowerCase().includes('readme') || f.path.includes('docs'))) {
      features.push('📚 **Well Documented** - Comprehensive documentation');
    }
    
    features.push('⚡ **High Performance** - Optimized for speed and efficiency');
    features.push('🔧 **Easy Setup** - Quick installation and configuration');
    features.push('📱 **Cross Platform** - Works on multiple platforms');
    
    return features;
  }

  private detectTechnologies(files: GitHubFile[]): string[] {
    const technologies = [];
    
    if (files.some(f => f.name === 'package.json')) {
      technologies.push('Node.js', 'npm');
    }
    
    if (files.some(f => f.name === 'requirements.txt' || f.name === 'pyproject.toml')) {
      technologies.push('Python', 'pip');
    }
    
    if (files.some(f => f.name === 'Cargo.toml')) {
      technologies.push('Rust', 'Cargo');
    }
    
    if (files.some(f => f.name === 'go.mod')) {
      technologies.push('Go Modules');
    }
    
    if (files.some(f => f.name.toLowerCase().includes('docker'))) {
      technologies.push('Docker');
    }
    
    if (files.some(f => f.path.includes('.github'))) {
      technologies.push('GitHub Actions');
    }
    
    technologies.push('Git', 'GitHub');
    
    return technologies;
  }

  private generatePrerequisites(language: string, files: GitHubFile[]): string {
    let prereqs = '';
    
    if (language === 'JavaScript' || language === 'TypeScript' || files.some(f => f.name === 'package.json')) {
      prereqs += '- Node.js (v16 or higher)\n- npm or yarn\n';
    } else if (language === 'Python') {
      prereqs += '- Python (3.8 or higher)\n- pip\n';
    } else if (language === 'Rust') {
      prereqs += '- Rust (1.60 or higher)\n- Cargo\n';
    } else if (language === 'Go') {
      prereqs += '- Go (1.19 or higher)\n';
    }
    
    prereqs += '- Git\n';
    
    return prereqs;
  }

  private generateInstallCommands(language: string, files: GitHubFile[]): string {
    if (language === 'JavaScript' || language === 'TypeScript' || files.some(f => f.name === 'package.json')) {
      return 'npm install\n';
    } else if (language === 'Python') {
      return 'pip install -r requirements.txt\n';
    } else if (language === 'Rust') {
      return 'cargo build\n';
    } else if (language === 'Go') {
      return 'go mod download\n';
    }
    
    return '# Follow project-specific installation instructions\n';
  }

  private generateUsageCommands(language: string, files: GitHubFile[]): string {
    if (language === 'JavaScript' || language === 'TypeScript' || files.some(f => f.name === 'package.json')) {
      return 'npm start\n# or for development\nnpm run dev\n';
    } else if (language === 'Python') {
      return 'python main.py\n# or\npython app.py\n';
    } else if (language === 'Rust') {
      return 'cargo run\n';
    } else if (language === 'Go') {
      return 'go run main.go\n';
    }
    
    return '# Run the application\n# Check project documentation for specific commands\n';
  }

  async generateProjectIdeas(repoInfo: RepositoryInfo, files: GitHubFile[]): Promise<string[]> {
    // Generate project ideas based on the technology stack
    const ideas = [
      `Extend ${repoInfo.name} with additional ${repoInfo.language} features`,
      `Create a mobile version using React Native or Flutter`,
      `Build a REST API integration for ${repoInfo.name}`,
      `Add user authentication and authorization`,
      `Implement real-time features with WebSockets`,
      `Create a dashboard interface for analytics`,
      `Add machine learning capabilities`,
      `Build a plugin system for extensibility`
    ];
    
    return ideas.slice(0, 5);
  }

  async generateRoadmap(repoInfo: RepositoryInfo): Promise<string[]> {
    // Generate a realistic roadmap based on the project
    const roadmap = [
      'Improve documentation and code comments',
      'Add comprehensive unit and integration tests',
      'Performance optimization and code refactoring',
      'Implement additional features based on user feedback',
      'Add internationalization (i18n) support',
      'Create mobile-responsive design improvements',
      'Set up automated deployment pipeline',
      'Add monitoring and logging capabilities'
    ];
    
    return roadmap;
  }
}
