export interface ReadmeConfig {
  // Basic Settings
  headerAlignment: 'left' | 'center' | 'right';
  tableOfContentsStyle: 'bullet' | 'numbered' | 'minimal';
  
  // Visual Options
  generateLogo: boolean;
  addEmojisToHeadings: boolean;
  
  // AI Provider Settings
  aiProvider: 'openai' | 'anthropic' | 'huggingface' | 'local';
  aiModel: string;
  customPrompt?: string;
  
  // Section Toggles
  sections: {
    features: boolean;
    projectStructure: boolean;
    projectIdeas: boolean;
    roadmap: boolean;
    contributors: boolean;
    license: boolean;
    acknowledgments: boolean;
    installation: boolean;
    usage: boolean;
    techStack: boolean;
    badges: boolean;
  };
  
  // Content Customization
  projectDescription?: string;
  customFeatures?: string[];
  customTechStack?: string[];
  licenseType: 'MIT' | 'Apache-2.0' | 'GPL-3.0' | 'BSD-3-Clause' | 'Custom';
  
  // Styling
  badgeStyle: 'flat' | 'flat-square' | 'for-the-badge' | 'plastic';
  colorScheme: 'default' | 'blue' | 'green' | 'purple' | 'custom';
}

export interface AIProviderConfig {
  name: string;
  apiKey?: string;
  baseUrl?: string;
  models: string[];
  maxTokens: number;
}

export interface GenerationOptions {
  config: ReadmeConfig;
  repositoryData: any;
  files: any[];
  useAI: boolean;
}

export const defaultReadmeConfig: ReadmeConfig = {
  headerAlignment: 'center',
  tableOfContentsStyle: 'bullet',
  generateLogo: false,
  addEmojisToHeadings: true,
  aiProvider: 'local',
  aiModel: 'intelligent-template',
  sections: {
    features: true,
    projectStructure: true,
    projectIdeas: false,
    roadmap: false,
    contributors: true,
    license: true,
    acknowledgments: true,
    installation: true,
    usage: true,
    techStack: true,
    badges: true,
  },
  licenseType: 'MIT',
  badgeStyle: 'for-the-badge',
  colorScheme: 'default',
};
