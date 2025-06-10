import { RepositoryInfo, GitHubFile } from "./github";

export async function generateReadme(
  repoInfo: RepositoryInfo,
  files: GitHubFile[]
): Promise<string> {
  // Analyze the repository structure and content
  const analysis = analyzeRepository(repoInfo, files);
  
  // Generate README based on analysis
  return generateReadmeContent(repoInfo, analysis);
}

interface RepositoryAnalysis {
  projectType: string;
  mainLanguage: string;
  frameworks: string[];
  features: string[];
  structure: string[];
  hasTests: boolean;
  hasDocumentation: boolean;
  hasCI: boolean;
  dependencies: string[];
  scripts: string[];
}

function analyzeRepository(repoInfo: RepositoryInfo, files: GitHubFile[]): RepositoryAnalysis {
  const analysis: RepositoryAnalysis = {
    projectType: "Unknown",
    mainLanguage: repoInfo.language || "Unknown",
    frameworks: [],
    features: [],
    structure: [],
    hasTests: false,
    hasDocumentation: false,
    hasCI: false,
    dependencies: [],
    scripts: [],
  };

  // Analyze files
  for (const file of files) {
    const fileName = file.name.toLowerCase();
    const filePath = file.path.toLowerCase();
    const content = file.content || "";

    // Detect project type and frameworks
    if (fileName === "package.json") {
      analysis.projectType = "Node.js/JavaScript";
      const packageData = parsePackageJson(content);
      analysis.dependencies = packageData.dependencies;
      analysis.scripts = packageData.scripts;
      analysis.frameworks.push(...packageData.frameworks);
    } else if (fileName === "requirements.txt" || fileName === "pyproject.toml") {
      analysis.projectType = "Python";
    } else if (fileName === "cargo.toml") {
      analysis.projectType = "Rust";
    } else if (fileName === "go.mod") {
      analysis.projectType = "Go";
    } else if (fileName === "composer.json") {
      analysis.projectType = "PHP";
    } else if (fileName === "gemfile") {
      analysis.projectType = "Ruby";
    }

    // Detect frameworks and libraries
    if (content.includes("react") || content.includes("React")) {
      analysis.frameworks.push("React");
    }
    if (content.includes("vue") || content.includes("Vue")) {
      analysis.frameworks.push("Vue.js");
    }
    if (content.includes("angular") || content.includes("Angular")) {
      analysis.frameworks.push("Angular");
    }
    if (content.includes("express") || content.includes("Express")) {
      analysis.frameworks.push("Express.js");
    }
    if (content.includes("next") || content.includes("Next")) {
      analysis.frameworks.push("Next.js");
    }
    if (content.includes("django") || content.includes("Django")) {
      analysis.frameworks.push("Django");
    }
    if (content.includes("flask") || content.includes("Flask")) {
      analysis.frameworks.push("Flask");
    }

    // Check for tests
    if (filePath.includes("test") || filePath.includes("spec") || fileName.includes("test")) {
      analysis.hasTests = true;
    }

    // Check for documentation
    if (fileName.includes("readme") || fileName.includes("doc") || filePath.includes("docs")) {
      analysis.hasDocumentation = true;
    }

    // Check for CI/CD
    if (filePath.includes(".github/workflows") || fileName.includes("ci") || fileName.includes("pipeline")) {
      analysis.hasCI = true;
    }

    // Analyze structure
    if (file.type === "dir") {
      analysis.structure.push(file.name);
    }
  }

  // Remove duplicates
  analysis.frameworks = Array.from(new Set(analysis.frameworks));
  analysis.structure = Array.from(new Set(analysis.structure));

  return analysis;
}

function parsePackageJson(content: string): {
  dependencies: string[];
  scripts: string[];
  frameworks: string[];
} {
  try {
    const pkg = JSON.parse(content);
    const dependencies = Object.keys({
      ...pkg.dependencies,
      ...pkg.devDependencies,
    });
    
    const scripts = Object.keys(pkg.scripts || {});
    
    const frameworks: string[] = [];
    if (dependencies.includes("react")) frameworks.push("React");
    if (dependencies.includes("vue")) frameworks.push("Vue.js");
    if (dependencies.includes("angular")) frameworks.push("Angular");
    if (dependencies.includes("next")) frameworks.push("Next.js");
    if (dependencies.includes("express")) frameworks.push("Express.js");
    if (dependencies.includes("tailwindcss")) frameworks.push("Tailwind CSS");
    if (dependencies.includes("typescript")) frameworks.push("TypeScript");

    return { dependencies, scripts, frameworks };
  } catch {
    return { dependencies: [], scripts: [], frameworks: [] };
  }
}

function generateReadmeContent(repoInfo: RepositoryInfo, analysis: RepositoryAnalysis): string {
  const { name, description, language, stars, forks } = repoInfo;
  const { projectType, frameworks, features, hasTests, hasDocumentation, hasCI, scripts } = analysis;

  let readme = `<div align="center">\n\n`;
  readme += `# ${name}\n\n`;
  readme += `### ${description || `A modern ${projectType} project built with cutting-edge technologies`}\n\n`;

  // Add badges in a single line
  readme += `[![GitHub stars](https://img.shields.io/github/stars/${repoInfo.fullName}?style=for-the-badge&logo=github)](https://github.com/${repoInfo.fullName}/stargazers) `;
  readme += `[![GitHub forks](https://img.shields.io/github/forks/${repoInfo.fullName}?style=for-the-badge&logo=github)](https://github.com/${repoInfo.fullName}/network) `;
  readme += `[![GitHub issues](https://img.shields.io/github/issues/${repoInfo.fullName}?style=for-the-badge&logo=github)](https://github.com/${repoInfo.fullName}/issues) `;
  readme += `[![GitHub license](https://img.shields.io/github/license/${repoInfo.fullName}?style=for-the-badge)](https://github.com/${repoInfo.fullName}/blob/main/LICENSE)`;

  if (language) {
    readme += ` [![Language](https://img.shields.io/badge/language-${language}-blue?style=for-the-badge&logo=${language.toLowerCase()})]()`;
  }

  if (hasTests) readme += ` [![Tests](https://img.shields.io/badge/tests-passing-brightgreen?style=for-the-badge&logo=github-actions)]()`;
  if (hasCI) readme += ` [![CI/CD](https://img.shields.io/badge/CI%2FCD-enabled-blue?style=for-the-badge&logo=github-actions)]()`;

  readme += `\n</div>\n\n`;

  // Add a visual separator
  readme += `---\n\n`;

  // Table of Contents
  readme += `## 📚 Table of Contents\n\n`;
  readme += `- [📋 About](#-about)\n`;
  readme += `- [✨ Features](#-features)\n`;
  readme += `- [🛠️ Tech Stack](#️-tech-stack)\n`;
  readme += `- [🚀 Getting Started](#-getting-started)\n`;
  readme += `- [📁 Project Structure](#-project-structure)\n`;
  readme += `- [🤝 Contributing](#-contributing)\n`;
  readme += `- [📄 License](#-license)\n\n`;

  // About section with description
  readme += `## 📋 About\n\n`;
  if (description) {
    readme += `${description}\n\n`;
  } else {
    readme += `This is a ${projectType} project that demonstrates modern development practices and clean architecture. `;
    readme += `Built with ${language} and featuring ${frameworks.length > 0 ? frameworks.join(', ') : 'modern technologies'}, `;
    readme += `this project showcases best practices in software development.\n\n`;
  }

  // Key highlights
  readme += `### 🎯 Key Highlights\n\n`;
  readme += `- **Language**: ${language}\n`;
  readme += `- **Type**: ${projectType}\n`;
  if (frameworks.length > 0) readme += `- **Frameworks**: ${frameworks.join(', ')}\n`;
  readme += `- **Stars**: ${stars} ⭐\n`;
  readme += `- **Forks**: ${forks} 🍴\n`;
  if (hasTests) readme += `- **Testing**: ✅ Comprehensive test suite\n`;
  if (hasCI) readme += `- **CI/CD**: ✅ Automated workflows\n`;
  readme += `\n`;

  // Tech stack with icons
  if (frameworks.length > 0) {
    readme += `## 🛠️ Tech Stack\n\n`;
    readme += `<div align="center">\n\n`;

    // Create horizontal badges
    const badges = frameworks.map(framework => {
      const icon = getTechIcon(framework);
      return `![${framework}](https://img.shields.io/badge/${framework.replace(/\s+/g, '%20')}-${icon.color}?style=for-the-badge&logo=${icon.logo}&logoColor=white)`;
    });

    readme += badges.join(' ') + '\n\n';
    readme += `</div>\n\n`;

    readme += `### Technologies Used\n\n`;
    frameworks.forEach(framework => {
      readme += `- **${framework}** - ${getTechDescription(framework)}\n`;
    });
    readme += `\n`;
  }

  // Features (auto-generated based on analysis)
  readme += `## ✨ Features\n\n`;
  readme += `<div align="center">\n\n`;
  readme += `| Feature | Description | Status |\n`;
  readme += `|---------|-------------|--------|\n`;
  readme += `| 🚀 **Modern ${language}** | Built with latest ${language} features | ✅ |\n`;

  if (frameworks.includes("React")) {
    readme += `| ⚛️ **React UI** | Component-based architecture | ✅ |\n`;
  }
  if (frameworks.includes("TypeScript")) {
    readme += `| 📝 **Type Safety** | Full TypeScript support | ✅ |\n`;
  }
  if (frameworks.includes("Tailwind CSS")) {
    readme += `| 🎨 **Modern Styling** | Tailwind CSS for beautiful UI | ✅ |\n`;
  }
  if (frameworks.includes("Next.js")) {
    readme += `| ⚡ **Next.js** | Server-side rendering & optimization | ✅ |\n`;
  }
  if (hasTests) {
    readme += `| 🧪 **Testing** | Comprehensive test coverage | ✅ |\n`;
  }
  if (hasCI) {
    readme += `| 🔄 **CI/CD** | Automated workflows | ✅ |\n`;
  }

  readme += `| 📱 **Responsive** | Mobile-first design | ✅ |\n`;
  readme += `| ⚡ **Performance** | Optimized for speed | ✅ |\n`;
  readme += `| 🔧 **Maintainable** | Clean, documented code | ✅ |\n`;

  readme += `\n</div>\n\n`;

  // Additional feature highlights
  readme += `### 🎯 Core Capabilities\n\n`;
  const coreFeatures = generateCoreFeatures(analysis, frameworks);
  coreFeatures.forEach(feature => {
    readme += `- **${feature.title}**: ${feature.description}\n`;
  });
  readme += `\n`;

  // Installation
  readme += `## 🚀 Getting Started\n\n`;

  readme += `### 📋 Prerequisites\n\n`;
  readme += `Before you begin, ensure you have the following installed:\n\n`;

  if (projectType.includes("Node.js")) {
    readme += `- ![Node.js](https://img.shields.io/badge/Node.js-v16+-339933?style=flat&logo=node.js&logoColor=white) **Node.js** (v16 or higher)\n`;
    readme += `- ![npm](https://img.shields.io/badge/npm-latest-CB3837?style=flat&logo=npm&logoColor=white) **npm** or **yarn**\n`;
    readme += `- ![Git](https://img.shields.io/badge/Git-latest-F05032?style=flat&logo=git&logoColor=white) **Git**\n\n`;
  } else if (projectType === "Python") {
    readme += `- ![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=flat&logo=python&logoColor=white) **Python** (3.8 or higher)\n`;
    readme += `- ![pip](https://img.shields.io/badge/pip-latest-3776AB?style=flat&logo=python&logoColor=white) **pip**\n`;
    readme += `- ![Git](https://img.shields.io/badge/Git-latest-F05032?style=flat&logo=git&logoColor=white) **Git**\n\n`;
  } else if (projectType === "Go") {
    readme += `- ![Go](https://img.shields.io/badge/Go-1.19+-00ADD8?style=flat&logo=go&logoColor=white) **Go** (1.19 or higher)\n`;
    readme += `- ![Git](https://img.shields.io/badge/Git-latest-F05032?style=flat&logo=git&logoColor=white) **Git**\n\n`;
  } else if (projectType === "Rust") {
    readme += `- ![Rust](https://img.shields.io/badge/Rust-1.60+-000000?style=flat&logo=rust&logoColor=white) **Rust** (1.60 or higher)\n`;
    readme += `- ![Cargo](https://img.shields.io/badge/Cargo-latest-000000?style=flat&logo=rust&logoColor=white) **Cargo**\n`;
    readme += `- ![Git](https://img.shields.io/badge/Git-latest-F05032?style=flat&logo=git&logoColor=white) **Git**\n\n`;
  }

  readme += `### 📦 Installation\n\n`;
  readme += `Follow these steps to get the project running locally:\n\n`;

  readme += `#### 1️⃣ Clone the Repository\n\n`;
  readme += `\`\`\`bash\n`;
  readme += `# Clone the repository\n`;
  readme += `git clone https://github.com/${repoInfo.fullName}.git\n\n`;
  readme += `# Navigate to project directory\n`;
  readme += `cd ${name}\n`;
  readme += `\`\`\`\n\n`;

  readme += `#### 2️⃣ Install Dependencies\n\n`;
  readme += `\`\`\`bash\n`;
  if (projectType.includes("Node.js")) {
    readme += `# Using npm\n`;
    readme += `npm install\n\n`;
    readme += `# Or using yarn\n`;
    readme += `yarn install\n`;
  } else if (projectType === "Python") {
    readme += `# Create virtual environment (recommended)\n`;
    readme += `python -m venv venv\n`;
    readme += `source venv/bin/activate  # On Windows: venv\\Scripts\\activate\n\n`;
    readme += `# Install dependencies\n`;
    readme += `pip install -r requirements.txt\n`;
  } else if (projectType === "Go") {
    readme += `# Download dependencies\n`;
    readme += `go mod download\n`;
  } else if (projectType === "Rust") {
    readme += `# Build the project\n`;
    readme += `cargo build\n`;
  } else {
    readme += `# Install dependencies (check project documentation)\n`;
    readme += `# Follow the specific installation instructions for this project\n`;
  }
  readme += `\`\`\`\n\n`;

  // Usage
  readme += `#### 3️⃣ Start the Application\n\n`;
  readme += `\`\`\`bash\n`;
  if (scripts.includes("dev")) {
    readme += `# Start development server\n`;
    readme += `npm run dev\n\n`;
    readme += `# The application will be available at http://localhost:3000\n`;
  } else if (scripts.includes("start")) {
    readme += `# Start the application\n`;
    readme += `npm start\n`;
  } else if (projectType === "Python") {
    readme += `# Run the application\n`;
    readme += `python main.py\n`;
  } else if (projectType === "Go") {
    readme += `# Run the application\n`;
    readme += `go run main.go\n`;
  } else if (projectType === "Rust") {
    readme += `# Run the application\n`;
    readme += `cargo run\n`;
  } else {
    readme += `# Run the application (check project documentation)\n`;
    readme += `# Follow the specific run instructions for this project\n`;
  }
  readme += `\`\`\`\n\n`;

  // Quick start section
  readme += `### ⚡ Quick Start\n\n`;
  readme += `\`\`\`bash\n`;
  readme += `git clone https://github.com/${repoInfo.fullName}.git && cd ${name}`;
  if (projectType.includes("Node.js")) {
    readme += ` && npm install && npm run dev\n`;
  } else if (projectType === "Python") {
    readme += ` && pip install -r requirements.txt && python main.py\n`;
  } else if (projectType === "Go") {
    readme += ` && go mod download && go run main.go\n`;
  } else if (projectType === "Rust") {
    readme += ` && cargo run\n`;
  } else {
    readme += `\n# Follow the installation and run instructions above\n`;
  }
  readme += `\`\`\`\n\n`;

  // Project structure
  if (analysis.structure.length > 0) {
    readme += `## 📁 Project Structure\n\n`;
    readme += `\`\`\`\n`;
    readme += `${name}/\n`;
    analysis.structure.slice(0, 10).forEach(dir => {
      readme += `├── ${dir}/\n`;
    });
    readme += `└── README.md\n`;
    readme += `\`\`\`\n\n`;
  }

  // Scripts
  if (scripts.length > 0) {
    readme += `## 📜 Available Scripts\n\n`;
    scripts.forEach(script => {
      readme += `- \`npm run ${script}\` - ${getScriptDescription(script)}\n`;
    });
    readme += `\n`;
  }

  // Contributing
  readme += `## 🤝 Contributing\n\n`;
  readme += `Contributions are welcome! Please feel free to submit a Pull Request.\n\n`;
  readme += `1. Fork the project\n`;
  readme += `2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)\n`;
  readme += `3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)\n`;
  readme += `4. Push to the branch (\`git push origin feature/AmazingFeature\`)\n`;
  readme += `5. Open a Pull Request\n\n`;

  // License
  readme += `## 📄 License\n\n`;
  readme += `This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.\n\n`;

  // Acknowledgments
  readme += `## 🙏 Acknowledgments\n\n`;
  readme += `- Thanks to all contributors who have helped shape this project\n`;
  readme += `- Built with ❤️ using modern development practices\n`;
  readme += `- Generated with [GitSpicefy](https://gitspicefy.com) 🚀\n`;

  return readme;
}

function getScriptDescription(script: string): string {
  const descriptions: Record<string, string> = {
    dev: "Start development server",
    build: "Build for production",
    start: "Start production server",
    test: "Run tests",
    lint: "Run linter",
    format: "Format code",
    deploy: "Deploy application",
  };

  return descriptions[script] || `Run ${script} command`;
}

function getTechIcon(tech: string): { logo: string; color: string } {
  const icons: Record<string, { logo: string; color: string }> = {
    "React": { logo: "react", color: "61DAFB" },
    "Next.js": { logo: "next.js", color: "000000" },
    "Vue.js": { logo: "vue.js", color: "4FC08D" },
    "Angular": { logo: "angular", color: "DD0031" },
    "Express.js": { logo: "express", color: "000000" },
    "Django": { logo: "django", color: "092E20" },
    "Flask": { logo: "flask", color: "000000" },
    "TypeScript": { logo: "typescript", color: "3178C6" },
    "JavaScript": { logo: "javascript", color: "F7DF1E" },
    "Python": { logo: "python", color: "3776AB" },
    "Node.js": { logo: "node.js", color: "339933" },
    "Tailwind CSS": { logo: "tailwindcss", color: "06B6D4" },
  };

  return icons[tech] || { logo: tech.toLowerCase().replace(/\s+/g, ''), color: "666666" };
}

function getTechDescription(tech: string): string {
  const descriptions: Record<string, string> = {
    "React": "A JavaScript library for building user interfaces",
    "Next.js": "The React framework for production",
    "Vue.js": "The progressive JavaScript framework",
    "Angular": "Platform for building mobile and desktop web applications",
    "Express.js": "Fast, unopinionated, minimalist web framework for Node.js",
    "Django": "High-level Python web framework",
    "Flask": "Lightweight WSGI web application framework",
    "TypeScript": "JavaScript with syntax for types",
    "JavaScript": "Programming language of the web",
    "Python": "Programming language that lets you work quickly",
    "Node.js": "JavaScript runtime built on Chrome's V8 JavaScript engine",
    "Tailwind CSS": "Utility-first CSS framework",
  };

  return descriptions[tech] || `${tech} framework/library`;
}

function generateCoreFeatures(analysis: RepositoryAnalysis, frameworks: string[]): Array<{title: string, description: string}> {
  const features = [];

  if (frameworks.includes("React") || frameworks.includes("Vue.js") || frameworks.includes("Angular")) {
    features.push({
      title: "Component Architecture",
      description: "Modular, reusable components for maintainable code"
    });
  }

  if (frameworks.includes("Next.js")) {
    features.push({
      title: "Server-Side Rendering",
      description: "Fast initial page loads and SEO optimization"
    });
  }

  if (frameworks.includes("TypeScript")) {
    features.push({
      title: "Type Safety",
      description: "Catch errors at compile time with static typing"
    });
  }

  if (analysis.hasTests) {
    features.push({
      title: "Quality Assurance",
      description: "Comprehensive testing ensures reliability"
    });
  }

  if (analysis.hasCI) {
    features.push({
      title: "Automated Deployment",
      description: "Continuous integration and deployment pipeline"
    });
  }

  // Default features
  features.push({
    title: "Modern Development",
    description: `Built with ${analysis.mainLanguage} following best practices`
  });

  features.push({
    title: "Developer Experience",
    description: "Optimized tooling and development workflow"
  });

  return features;
}
