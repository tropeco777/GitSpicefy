import { RepositoryInfo, GitHubFile } from "./github";
import { ReadmeConfig } from "../types/readme-config";
import { OpenAIProvider } from "./ai-providers/openai";
import { HuggingFaceProvider } from "./ai-providers/huggingface";
import { LocalAIProvider } from "./ai-providers/local";
import { generateLogoForProject } from "./svg-logo-generator";

export async function generateEnhancedReadme(
  repoInfo: RepositoryInfo,
  files: GitHubFile[],
  config: ReadmeConfig
): Promise<string> {
  // Try AI providers in order of preference
  if (config.aiProvider === 'local') {
    try {
      const localAI = new LocalAIProvider();
      const aiContent = await localAI.generateReadme(repoInfo, files, config);
      if (aiContent) {
        return aiContent;
      }
    } catch (error) {
      console.error('Local AI generation failed, falling back to template:', error);
    }
  } else if (config.aiProvider === 'huggingface') {
    try {
      const huggingface = new HuggingFaceProvider();
      const aiContent = await huggingface.generateReadme(repoInfo, files, config);
      if (aiContent) {
        return aiContent;
      }
    } catch (error) {
      console.error('Hugging Face generation failed, falling back to template:', error);
    }
  } else if (config.aiProvider === 'openai' && process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAIProvider();
      const aiContent = await openai.generateReadme(repoInfo, files, config);
      if (aiContent) {
        return aiContent;
      }
    } catch (error) {
      console.error('OpenAI generation failed, falling back to template:', error);
    }
  }

  // Fallback to enhanced template generation
  return generateTemplateReadme(repoInfo, files, config);
}

export async function generateTemplateReadme(
  repoInfo: RepositoryInfo,
  files: GitHubFile[],
  config: ReadmeConfig
): Promise<string> {
  const analysis = analyzeRepository(repoInfo, files);
  
  let readme = '';

  // Header with alignment
  if (config.headerAlignment === 'center') {
    readme += `<div align="center">\n\n`;
  } else if (config.headerAlignment === 'right') {
    readme += `<div align="right">\n\n`;
  }

  // Logo section
  if (config.generateLogo) {
    readme += generateLogoSection(repoInfo, analysis, config);
  }

  // Title and description
  const titleEmoji = config.addEmojisToHeadings ? '🚀 ' : '';
  readme += `# ${titleEmoji}${repoInfo.name}\n\n`;
  
  const description = config.projectDescription || repoInfo.description || 
    `A modern ${analysis.projectType} project built with cutting-edge technologies`;
  readme += `### ${description}\n\n`;

  // Badges
  if (config.sections.badges) {
    readme += generateBadges(repoInfo, analysis, config);
  }

  if (config.headerAlignment !== 'left') {
    readme += `</div>\n\n`;
  }

  readme += `---\n\n`;

  // Table of Contents
  readme += generateTableOfContents(config);

  // About section
  readme += generateAboutSection(repoInfo, analysis, config);

  // Features
  if (config.sections.features) {
    readme += await generateFeaturesSection(repoInfo, analysis, config);
  }

  // Tech Stack
  if (config.sections.techStack) {
    readme += generateTechStackSection(analysis, config);
  }

  // Installation
  if (config.sections.installation) {
    readme += generateInstallationSection(repoInfo, analysis, config);
  }

  // Usage
  if (config.sections.usage) {
    readme += generateUsageSection(analysis, config);
  }

  // Project Structure
  if (config.sections.projectStructure) {
    readme += generateProjectStructureSection(repoInfo, analysis, config);
  }

  // Project Ideas
  if (config.sections.projectIdeas) {
    readme += await generateProjectIdeasSection(repoInfo, files, config);
  }

  // Roadmap
  if (config.sections.roadmap) {
    readme += await generateRoadmapSection(repoInfo, config);
  }

  // Contributing
  if (config.sections.contributors) {
    readme += generateContributingSection(config);
  }

  // License
  if (config.sections.license) {
    readme += generateLicenseSection(config);
  }

  // Acknowledgments
  if (config.sections.acknowledgments) {
    readme += generateAcknowledgmentsSection(config);
  }

  return readme;
}

function generateLogoSection(repoInfo: RepositoryInfo, analysis: any, config: ReadmeConfig): string {
  // Generate SVG logo based on project type and description
  const svgLogo = generateLogoForProject(repoInfo.name, analysis.projectType, repoInfo.description);
  return `${svgLogo}\n\n`;
}

function generateBadges(repoInfo: RepositoryInfo, analysis: any, config: ReadmeConfig): string {
  const style = config.badgeStyle;
  let badges = '';

  badges += `[![GitHub stars](https://img.shields.io/github/stars/${repoInfo.fullName}?style=${style}&logo=github)](https://github.com/${repoInfo.fullName}/stargazers) `;
  badges += `[![GitHub forks](https://img.shields.io/github/forks/${repoInfo.fullName}?style=${style}&logo=github)](https://github.com/${repoInfo.fullName}/network) `;
  badges += `[![GitHub issues](https://img.shields.io/github/issues/${repoInfo.fullName}?style=${style}&logo=github)](https://github.com/${repoInfo.fullName}/issues) `;
  badges += `[![GitHub license](https://img.shields.io/github/license/${repoInfo.fullName}?style=${style})](https://github.com/${repoInfo.fullName}/blob/main/LICENSE)`;

  if (repoInfo.language) {
    badges += ` [![Language](https://img.shields.io/badge/language-${repoInfo.language}-blue?style=${style}&logo=${repoInfo.language.toLowerCase()})]()`;
  }

  badges += `\n\n`;
  return badges;
}

function generateTableOfContents(config: ReadmeConfig): string {
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

// Analyze repository function (simplified version)
function analyzeRepository(repoInfo: RepositoryInfo, files: GitHubFile[]) {
  const packageManager = detectPackageManager(files, repoInfo.language);
  const projectType = detectProjectType(files, repoInfo.language);

  return {
    projectType: projectType,
    mainLanguage: repoInfo.language || "Unknown",
    packageManager: packageManager,
    frameworks: [],
    features: [],
    structure: files.filter(f => f.type === 'dir').map(f => f.name),
    hasTests: files.some(f => f.path.includes('test') || f.path.includes('spec')),
    hasDocumentation: files.some(f => f.name.toLowerCase().includes('readme') || f.path.includes('docs')),
    hasCI: files.some(f => f.path.includes('.github/workflows')),
    dependencies: [],
    scripts: [],
  };
}

function detectPackageManager(files: GitHubFile[], language: string): string {
  // Check for specific package manager files first
  if (files.some(f => f.name === 'requirements.txt' || f.name === 'pyproject.toml' || f.name === 'setup.py' || f.name === 'Pipfile')) return 'pip';
  if (files.some(f => f.name === 'Cargo.toml')) return 'Cargo';
  if (files.some(f => f.name === 'go.mod')) return 'Go Modules';
  if (files.some(f => f.name === 'yarn.lock')) return 'Yarn';
  if (files.some(f => f.name === 'pnpm-lock.yaml')) return 'pnpm';
  if (files.some(f => f.name === 'package-lock.json' || f.name === 'package.json')) return 'npm';

  // Fallback based on language - this is important for when files aren't detected
  if (language === 'Python') return 'pip';
  if (language === 'Rust') return 'Cargo';
  if (language === 'Go') return 'Go Modules';
  if (language === 'JavaScript' || language === 'TypeScript') return 'npm';
  if (language === 'Java') return 'Maven/Gradle';
  if (language === 'C#') return 'NuGet';
  if (language === 'Ruby') return 'Bundler';
  if (language === 'PHP') return 'Composer';

  return 'Manual Setup';
}

function detectProjectType(files: GitHubFile[], language: string): string {
  if (language === 'Python') {
    if (files.some(f => f.name === 'manage.py')) return 'Django Application';
    if (files.some(f => f.name === 'app.py' || f.name === 'main.py')) return 'Python Application';
    return 'Python Project';
  }

  if (language === 'JavaScript' || language === 'TypeScript') {
    if (files.some(f => f.name === 'next.config.js' || f.name === 'next.config.mjs')) return 'Next.js Application';
    if (files.some(f => f.path.includes('src/App.js') || f.path.includes('src/App.tsx'))) return 'React Application';
    if (files.some(f => f.name === 'vue.config.js' || f.path.includes('src/App.vue'))) return 'Vue.js Application';
    return 'Node.js Application';
  }

  if (language === 'Rust') return 'Rust Application';
  if (language === 'Go') return 'Go Application';
  if (language === 'Java') return 'Java Application';

  return `${language} Project`;
}

function generateAboutSection(repoInfo: RepositoryInfo, analysis: any, config: ReadmeConfig): string {
  const emoji = config.addEmojisToHeadings ? '📋 ' : '';
  let section = `## ${emoji}About\n\n`;
  
  const description = config.projectDescription || repoInfo.description || 
    `This is a ${analysis.projectType} project that demonstrates modern development practices and clean architecture.`;
  
  section += `${description}\n\n`;
  
  section += `### 🎯 Key Highlights\n\n`;
  section += `- **Language**: ${repoInfo.language}\n`;
  section += `- **Stars**: ${repoInfo.stars} ⭐\n`;
  section += `- **Forks**: ${repoInfo.forks} 🍴\n`;
  if (analysis.hasTests) section += `- **Testing**: ✅ Comprehensive test suite\n`;
  if (analysis.hasCI) section += `- **CI/CD**: ✅ Automated workflows\n`;
  
  return section + '\n';
}

async function generateFeaturesSection(repoInfo: RepositoryInfo, analysis: any, config: ReadmeConfig): Promise<string> {
  const emoji = config.addEmojisToHeadings ? '✨ ' : '';
  let section = `## ${emoji}Features\n\n`;

  if (config.customFeatures && config.customFeatures.length > 0) {
    config.customFeatures.forEach(feature => {
      section += `- 🚀 **${feature}**\n`;
    });
  } else {
    // Generate default features based on analysis
    section += `- 🚀 **Modern ${repoInfo.language}** - Built with latest ${repoInfo.language} features\n`;
    section += `- 📱 **Responsive Design** - Works on all devices\n`;
    section += `- ⚡ **High Performance** - Optimized for speed\n`;
    section += `- 🔧 **Easy Setup** - Quick installation and configuration\n`;
    
    if (analysis.hasTests) {
      section += `- 🧪 **Well Tested** - Comprehensive test coverage\n`;
    }
    if (analysis.hasCI) {
      section += `- 🔄 **CI/CD Ready** - Automated deployment pipeline\n`;
    }
  }

  return section + '\n';
}

function generateTechStackSection(analysis: any, config: ReadmeConfig): string {
  const emoji = config.addEmojisToHeadings ? '🛠️ ' : '';
  let section = `## ${emoji}Tech Stack\n\n`;

  if (config.customTechStack && config.customTechStack.length > 0) {
    config.customTechStack.forEach(tech => {
      section += `- **${tech}**\n`;
    });
  } else {
    section += `- **${analysis.mainLanguage}** - Primary programming language\n`;
    section += `- **Git** - Version control\n`;
    section += `- **GitHub** - Code hosting and collaboration\n`;
  }

  return section + '\n';
}

function generateInstallationSection(repoInfo: RepositoryInfo, analysis: any, config: ReadmeConfig): string {
  const emoji = config.addEmojisToHeadings ? '🚀 ' : '';
  let section = `## ${emoji}Getting Started\n\n`;

  section += `### Prerequisites\n\n`;
  section += generatePrerequisites(analysis);

  section += `\n### Installation\n\n`;
  section += `1. Clone the repository:\n`;
  section += `\`\`\`bash\n`;
  section += `git clone https://github.com/${repoInfo.fullName}.git\n`;
  section += `cd ${repoInfo.name}\n`;
  section += `\`\`\`\n\n`;

  section += `2. Install dependencies:\n`;
  section += `\`\`\`bash\n`;
  section += generateInstallCommands(analysis);
  section += `\`\`\`\n\n`;

  return section;
}

function generatePrerequisites(analysis: any): string {
  let prereqs = '';

  if (analysis.packageManager === 'pip') {
    prereqs += '- Python (3.8 or higher)\n';
    prereqs += '- pip (usually comes with Python)\n';
  } else if (analysis.packageManager === 'Cargo') {
    prereqs += '- Rust (1.60 or higher)\n';
    prereqs += '- Cargo (comes with Rust)\n';
  } else if (analysis.packageManager === 'Go Modules') {
    prereqs += '- Go (1.19 or higher)\n';
  } else if (analysis.packageManager === 'npm' || analysis.packageManager === 'yarn' || analysis.packageManager === 'pnpm') {
    prereqs += '- Node.js (v16 or higher)\n';
    prereqs += `- ${analysis.packageManager}\n`;
  } else if (analysis.packageManager === 'Maven/Gradle') {
    prereqs += '- Java (JDK 11 or higher)\n';
    prereqs += '- Maven or Gradle\n';
  } else if (analysis.packageManager === 'Manual Setup') {
    prereqs += `- ${analysis.mainLanguage} runtime/compiler\n`;
  }

  prereqs += '- Git\n';

  return prereqs;
}

function generateInstallCommands(analysis: any): string {
  const commands: Record<string, string> = {
    'pip': 'pip install -r requirements.txt\n# or if using virtual environment (recommended)\npython -m venv venv\nsource venv/bin/activate  # On Windows: venv\\Scripts\\activate\npip install -r requirements.txt',
    'Cargo': 'cargo build',
    'Go Modules': 'go mod download',
    'npm': 'npm install',
    'yarn': 'yarn install',
    'pnpm': 'pnpm install',
    'Maven/Gradle': '# For Maven\nmvn clean install\n# For Gradle\n./gradlew build',
    'Manual Setup': '# Follow project-specific installation instructions\n# Check the project documentation for setup steps',
  };

  return commands[analysis.packageManager] || '# Follow project-specific installation instructions';
}

function generateUsageSection(analysis: any, config: ReadmeConfig): string {
  const emoji = config.addEmojisToHeadings ? '💻 ' : '';
  let section = `## ${emoji}Usage\n\n`;

  section += `\`\`\`bash\n`;
  section += generateUsageCommands(analysis);
  section += `\`\`\`\n\n`;

  return section;
}

function generateUsageCommands(analysis: any): string {
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
  } else if (analysis.packageManager === 'Maven/Gradle') {
    return '# For Maven\nmvn spring-boot:run\n# For Gradle\n./gradlew bootRun';
  }

  return '# Run the application\n# Check project documentation for specific commands';
}

function generateProjectStructureSection(repoInfo: RepositoryInfo, analysis: any, config: ReadmeConfig): string {
  const emoji = config.addEmojisToHeadings ? '📁 ' : '';
  let section = `## ${emoji}Project Structure\n\n`;

  section += `\`\`\`\n`;
  section += `${repoInfo.name}/\n`;
  analysis.structure.slice(0, 8).forEach((dir: string) => {
    section += `├── ${dir}/\n`;
  });
  section += `└── README.md\n`;
  section += `\`\`\`\n\n`;

  return section;
}

async function generateProjectIdeasSection(repoInfo: RepositoryInfo, files: GitHubFile[], config: ReadmeConfig): Promise<string> {
  const emoji = config.addEmojisToHeadings ? '💡 ' : '';
  let section = `## ${emoji}Project Ideas\n\n`;

  try {
    if (config.aiProvider === 'local') {
      const localAI = new LocalAIProvider();
      const ideas = await localAI.generateProjectIdeas(repoInfo, files);

      if (ideas.length > 0) {
        ideas.forEach(idea => {
          section += `- ${idea}\n`;
        });
      } else {
        section += generateDefaultProjectIdeas(repoInfo);
      }
    } else if (config.aiProvider === 'huggingface') {
      const huggingface = new HuggingFaceProvider();
      const ideas = await huggingface.generateProjectIdeas(repoInfo, files);

      if (ideas.length > 0) {
        ideas.forEach(idea => {
          section += `- ${idea}\n`;
        });
      } else {
        section += generateDefaultProjectIdeas(repoInfo);
      }
    } else if (config.aiProvider === 'openai' && process.env.OPENAI_API_KEY) {
      const openai = new OpenAIProvider();
      const ideas = await openai.generateProjectIdeas(repoInfo, files);

      if (ideas.length > 0) {
        ideas.forEach(idea => {
          section += `- ${idea}\n`;
        });
      } else {
        section += generateDefaultProjectIdeas(repoInfo);
      }
    } else {
      section += generateDefaultProjectIdeas(repoInfo);
    }
  } catch (error) {
    section += generateDefaultProjectIdeas(repoInfo);
  }

  return section + '\n';
}

async function generateRoadmapSection(repoInfo: RepositoryInfo, config: ReadmeConfig): Promise<string> {
  const emoji = config.addEmojisToHeadings ? '🗺️ ' : '';
  let section = `## ${emoji}Roadmap\n\n`;

  try {
    if (config.aiProvider === 'local') {
      const localAI = new LocalAIProvider();
      const roadmapItems = await localAI.generateRoadmap(repoInfo);

      if (roadmapItems.length > 0) {
        roadmapItems.forEach((item, index) => {
          section += `- [ ] ${item}\n`;
        });
      } else {
        section += generateDefaultRoadmap();
      }
    } else if (config.aiProvider === 'huggingface') {
      const huggingface = new HuggingFaceProvider();
      const roadmapItems = await huggingface.generateRoadmap(repoInfo);

      if (roadmapItems.length > 0) {
        roadmapItems.forEach((item, index) => {
          section += `- [ ] ${item}\n`;
        });
      } else {
        section += generateDefaultRoadmap();
      }
    } else if (config.aiProvider === 'openai' && process.env.OPENAI_API_KEY) {
      const openai = new OpenAIProvider();
      const roadmapItems = await openai.generateRoadmap(repoInfo);

      if (roadmapItems.length > 0) {
        roadmapItems.forEach((item, index) => {
          section += `- [ ] ${item}\n`;
        });
      } else {
        section += generateDefaultRoadmap();
      }
    } else {
      section += generateDefaultRoadmap();
    }
  } catch (error) {
    section += generateDefaultRoadmap();
  }

  return section + '\n';
}

function generateDefaultProjectIdeas(repoInfo: RepositoryInfo): string {
  return `- Extend the project with additional features\n- Create a mobile version\n- Add API integration\n- Implement user authentication\n- Build a dashboard interface\n`;
}

function generateDefaultRoadmap(): string {
  return `- [ ] Improve documentation\n- [ ] Add more tests\n- [ ] Performance optimization\n- [ ] New feature development\n- [ ] Bug fixes and improvements\n`;
}

function generateContributingSection(config: ReadmeConfig): string {
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

function generateLicenseSection(config: ReadmeConfig): string {
  const emoji = config.addEmojisToHeadings ? '📄 ' : '';
  let section = `## ${emoji}License\n\n`;

  section += `This project is licensed under the ${config.licenseType} License - see the [LICENSE](LICENSE) file for details.\n\n`;

  return section;
}

function generateAcknowledgmentsSection(config: ReadmeConfig): string {
  const emoji = config.addEmojisToHeadings ? '🙏 ' : '';
  let section = `## ${emoji}Acknowledgments\n\n`;

  section += `- Thanks to all contributors who have helped shape this project\n`;
  section += `- Built with ❤️ using modern development practices\n`;
  section += `- Generated with [GitSpicefy](https://gitspicefy.com) 🚀\n\n`;

  return section;
}
