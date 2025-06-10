export interface LogoConfig {
  projectName: string;
  primaryColor?: string;
  secondaryColor?: string;
  style?: 'modern' | 'minimal' | 'gradient' | 'tech' | 'creative';
  width?: number;
  height?: number;
}

export function generateSVGLogo(config: LogoConfig): string {
  const {
    projectName,
    primaryColor = '#4F46E5',
    secondaryColor = '#7C3AED',
    style = 'modern',
    width = 200,
    height = 80
  } = config;

  const initials = getInitials(projectName);
  
  switch (style) {
    case 'minimal':
      return generateMinimalLogo(projectName, initials, primaryColor, width, height);
    case 'gradient':
      return generateGradientLogo(projectName, initials, primaryColor, secondaryColor, width, height);
    case 'tech':
      return generateTechLogo(projectName, initials, primaryColor, width, height);
    case 'creative':
      return generateCreativeLogo(projectName, initials, primaryColor, secondaryColor, width, height);
    default:
      return generateModernLogo(projectName, initials, primaryColor, width, height);
  }
}

function getInitials(projectName: string): string {
  return projectName
    .split(/[\s-_]+/)
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

function generateModernLogo(name: string, initials: string, color: string, width: number, height: number): string {
  const icon = getProjectIcon(name);

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="modernGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${adjustColor(color, -20)};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="${color}" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Background circle -->
  <circle cx="40" cy="40" r="30" fill="url(#modernGrad)" filter="url(#shadow)"/>

  <!-- Icon or Initials -->
  ${icon ?
    `<g transform="translate(25, 25)">${icon}</g>` :
    `<text x="40" y="48" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>`
  }

  <!-- Project name -->
  <text x="85" y="35" font-family="Arial, sans-serif" font-size="16" font-weight="600" fill="${color}">${name}</text>
  <text x="85" y="50" font-family="Arial, sans-serif" font-size="10" fill="#666">Modern Solution</text>
</svg>`;
}

function generateMinimalLogo(name: string, initials: string, color: string, width: number, height: number): string {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Simple rectangle -->
  <rect x="5" y="20" width="50" height="40" rx="8" fill="none" stroke="${color}" stroke-width="2"/>
  
  <!-- Initials -->
  <text x="30" y="45" font-family="Arial, sans-serif" font-size="18" font-weight="300" text-anchor="middle" fill="${color}">${initials}</text>
  
  <!-- Project name -->
  <text x="70" y="45" font-family="Arial, sans-serif" font-size="18" font-weight="300" fill="${color}">${name}</text>
</svg>`;
}

function generateGradientLogo(name: string, initials: string, primaryColor: string, secondaryColor: string, width: number, height: number): string {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradientBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${secondaryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${adjustColor(primaryColor, 30)};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background shape -->
  <path d="M10 20 L60 10 L70 50 L20 60 Z" fill="url(#gradientBg)" opacity="0.9"/>
  
  <!-- Initials -->
  <text x="40" y="40" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
  
  <!-- Project name -->
  <text x="85" y="40" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="url(#textGrad)">${name}</text>
</svg>`;
}

function generateTechLogo(name: string, initials: string, color: string, width: number, height: number): string {
  const icon = getProjectIcon(name);

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.3"/>
    </pattern>
  </defs>

  <!-- Grid background -->
  <rect width="${width}" height="${height}" fill="url(#grid)"/>

  <!-- Tech hexagon -->
  <polygon points="30,15 50,15 60,35 50,55 30,55 20,35" fill="${color}" opacity="0.1" stroke="${color}" stroke-width="2"/>

  <!-- Inner elements -->
  <circle cx="40" cy="35" r="12" fill="${color}"/>

  <!-- Icon or Initials -->
  ${icon ?
    `<g transform="translate(28, 23)">${icon.replace(/white/g, 'white').replace(/#333/g, color)}</g>` :
    `<text x="40" y="39" font-family="Courier, monospace" font-size="10" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>`
  }

  <!-- Project name -->
  <text x="75" y="30" font-family="Courier, monospace" font-size="14" font-weight="bold" fill="${color}">${name}</text>
  <text x="75" y="45" font-family="Courier, monospace" font-size="8" fill="#666">&lt;/&gt; TECH</text>
</svg>`;
}

function generateCreativeLogo(name: string, initials: string, primaryColor: string, secondaryColor: string, width: number, height: number): string {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="creativeGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:0.8" />
      <stop offset="70%" style="stop-color:${secondaryColor};stop-opacity:0.6" />
      <stop offset="100%" style="stop-color:${adjustColor(primaryColor, 40)};stop-opacity:0.4" />
    </radialGradient>
  </defs>
  
  <!-- Creative shapes -->
  <circle cx="25" cy="25" r="15" fill="${primaryColor}" opacity="0.7"/>
  <circle cx="45" cy="35" r="12" fill="${secondaryColor}" opacity="0.6"/>
  <circle cx="35" cy="50" r="10" fill="${adjustColor(primaryColor, 30)}" opacity="0.5"/>
  
  <!-- Central element -->
  <circle cx="35" cy="35" r="18" fill="url(#creativeGrad)"/>
  
  <!-- Initials -->
  <text x="35" y="42" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
  
  <!-- Project name -->
  <text x="70" y="30" font-family="Arial, sans-serif" font-size="16" font-weight="600" fill="${primaryColor}">${name}</text>
  <text x="70" y="45" font-family="Arial, sans-serif" font-size="10" fill="${secondaryColor}">Creative Solutions</text>
</svg>`;
}

function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function getProjectIcon(projectName: string): string | null {
  const name = projectName.toLowerCase();

  // Chat/Communication icons
  if (name.includes('chat') || name.includes('message') || name.includes('talk')) {
    return `<path d="M8 12l-4-4 4-4m8 8l4-4-4-4" stroke="white" stroke-width="2" fill="none"/>
            <circle cx="15" cy="8" r="2" fill="white"/>`;
  }

  // Dashboard/Admin icons
  if (name.includes('dashboard') || name.includes('admin') || name.includes('panel')) {
    return `<rect x="2" y="2" width="6" height="6" fill="white" rx="1"/>
            <rect x="10" y="2" width="6" height="6" fill="white" rx="1"/>
            <rect x="2" y="10" width="6" height="6" fill="white" rx="1"/>
            <rect x="10" y="10" width="6" height="6" fill="white" rx="1"/>`;
  }

  // Blog/News icons
  if (name.includes('blog') || name.includes('news') || name.includes('article')) {
    return `<rect x="3" y="2" width="12" height="16" fill="white" rx="2"/>
            <line x1="6" y1="6" x2="12" y2="6" stroke="#333" stroke-width="1"/>
            <line x1="6" y1="9" x2="14" y2="9" stroke="#333" stroke-width="1"/>
            <line x1="6" y1="12" x2="11" y2="12" stroke="#333" stroke-width="1"/>`;
  }

  // Music/Audio icons
  if (name.includes('music') || name.includes('audio') || name.includes('sound')) {
    return `<circle cx="9" cy="9" r="7" fill="white"/>
            <circle cx="9" cy="9" r="3" fill="#333"/>
            <path d="M15 6.5v8a2.5 2.5 0 0 1-2.5 2.5" stroke="#333" stroke-width="1.5" fill="none"/>`;
  }

  // Photo/Image icons
  if (name.includes('photo') || name.includes('image') || name.includes('gallery')) {
    return `<rect x="2" y="3" width="14" height="12" fill="white" rx="2"/>
            <circle cx="8.5" cy="8.5" r="2.5" fill="#333"/>
            <path d="M14.5 14L12 11.5 8.5 15 6 12.5 2.5 16" stroke="#333" stroke-width="1" fill="none"/>`;
  }

  // Shopping/E-commerce icons
  if (name.includes('shop') || name.includes('store') || name.includes('cart') || name.includes('buy')) {
    return `<path d="M6 2L3 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6l-3-4z" fill="white"/>
            <line x1="3" y1="6" x2="17" y2="6" stroke="#333" stroke-width="1"/>
            <path d="M8 10v4" stroke="#333" stroke-width="1"/>
            <path d="M12 10v4" stroke="#333" stroke-width="1"/>`;
  }

  // Task/Productivity icons
  if (name.includes('task') || name.includes('todo') || name.includes('manage')) {
    return `<rect x="3" y="2" width="12" height="16" fill="white" rx="2"/>
            <path d="M7 10l2 2 4-4" stroke="#333" stroke-width="1.5" fill="none"/>
            <line x1="6" y1="6" x2="12" y2="6" stroke="#333" stroke-width="1"/>
            <line x1="6" y1="14" x2="10" y2="14" stroke="#333" stroke-width="1"/>`;
  }

  // API/Code icons
  if (name.includes('api') || name.includes('code') || name.includes('dev')) {
    return `<path d="M16 18l6-6-6-6" stroke="white" stroke-width="2" fill="none"/>
            <path d="M8 6l-6 6 6 6" stroke="white" stroke-width="2" fill="none"/>`;
  }

  // Game icons
  if (name.includes('game') || name.includes('play') || name.includes('arcade')) {
    return `<rect x="2" y="6" width="16" height="8" fill="white" rx="3"/>
            <circle cx="6" cy="10" r="1.5" fill="#333"/>
            <circle cx="14" cy="8" r="1" fill="#333"/>
            <circle cx="16" cy="10" r="1" fill="#333"/>`;
  }

  return null; // No specific icon found, will use initials
}

export function generateLogoForProject(projectName: string, projectType?: string, description?: string): string {
  const analysis = analyzeProjectForLogo(projectName, projectType, description);

  return generateSVGLogo({
    projectName,
    primaryColor: analysis.primaryColor,
    secondaryColor: analysis.secondaryColor,
    style: analysis.style,
    width: 200,
    height: 80
  });
}

function analyzeProjectForLogo(projectName: string, projectType?: string, description?: string) {
  let style: LogoConfig['style'] = 'modern';
  let primaryColor = '#4F46E5';
  let secondaryColor = '#7C3AED';

  const nameWords = projectName.toLowerCase().split(/[\s-_]+/);
  const descWords = description?.toLowerCase().split(/\s+/) || [];
  const allWords = [...nameWords, ...descWords];

  // Analyze project name and description for themes
  const themes = {
    tech: ['api', 'code', 'dev', 'tech', 'software', 'app', 'web', 'digital', 'cyber', 'data', 'ai', 'ml', 'bot'],
    creative: ['design', 'art', 'creative', 'studio', 'media', 'graphics', 'visual', 'ui', 'ux', 'brand'],
    business: ['business', 'enterprise', 'corporate', 'finance', 'commerce', 'trade', 'market', 'sales'],
    gaming: ['game', 'gaming', 'play', 'arcade', 'quest', 'adventure', 'rpg', 'strategy'],
    social: ['social', 'chat', 'community', 'network', 'connect', 'share', 'friend', 'message'],
    education: ['learn', 'education', 'school', 'course', 'tutorial', 'study', 'knowledge', 'teach'],
    health: ['health', 'medical', 'fitness', 'wellness', 'care', 'doctor', 'hospital', 'medicine'],
    finance: ['finance', 'bank', 'money', 'payment', 'wallet', 'crypto', 'coin', 'invest'],
    ecommerce: ['shop', 'store', 'cart', 'buy', 'sell', 'market', 'commerce', 'retail'],
    productivity: ['task', 'todo', 'manage', 'organize', 'plan', 'schedule', 'productivity', 'work']
  };

  // Determine theme based on words
  let detectedTheme = 'tech'; // default
  let maxMatches = 0;

  for (const [theme, keywords] of Object.entries(themes)) {
    const matches = keywords.filter(keyword =>
      allWords.some(word => word.includes(keyword) || keyword.includes(word))
    ).length;

    if (matches > maxMatches) {
      maxMatches = matches;
      detectedTheme = theme;
    }
  }

  // Set colors and style based on detected theme and project type
  if (projectType?.includes('React') || projectType?.includes('Next.js')) {
    style = 'tech';
    primaryColor = '#61DAFB';
    secondaryColor = '#21232A';
  } else if (projectType?.includes('Vue')) {
    style = 'gradient';
    primaryColor = '#4FC08D';
    secondaryColor = '#34495E';
  } else if (projectType?.includes('Python')) {
    style = detectedTheme === 'creative' ? 'creative' : 'tech';
    primaryColor = '#3776AB';
    secondaryColor = '#FFD43B';
  } else if (projectType?.includes('Rust')) {
    style = 'tech';
    primaryColor = '#CE422B';
    secondaryColor = '#000000';
  } else if (projectType?.includes('Go')) {
    style = 'minimal';
    primaryColor = '#00ADD8';
    secondaryColor = '#FFFFFF';
  } else {
    // Use detected theme for styling
    switch (detectedTheme) {
      case 'creative':
        style = 'creative';
        primaryColor = '#FF6B6B';
        secondaryColor = '#4ECDC4';
        break;
      case 'business':
        style = 'minimal';
        primaryColor = '#2C3E50';
        secondaryColor = '#3498DB';
        break;
      case 'gaming':
        style = 'gradient';
        primaryColor = '#9B59B6';
        secondaryColor = '#E74C3C';
        break;
      case 'social':
        style = 'creative';
        primaryColor = '#3B82F6';
        secondaryColor = '#10B981';
        break;
      case 'education':
        style = 'modern';
        primaryColor = '#F59E0B';
        secondaryColor = '#EF4444';
        break;
      case 'health':
        style = 'minimal';
        primaryColor = '#10B981';
        secondaryColor = '#06B6D4';
        break;
      case 'finance':
        style = 'tech';
        primaryColor = '#059669';
        secondaryColor = '#1F2937';
        break;
      case 'ecommerce':
        style = 'gradient';
        primaryColor = '#F59E0B';
        secondaryColor = '#EF4444';
        break;
      case 'productivity':
        style = 'modern';
        primaryColor = '#6366F1';
        secondaryColor = '#8B5CF6';
        break;
      default: // tech
        style = 'tech';
        primaryColor = '#4F46E5';
        secondaryColor = '#7C3AED';
    }
  }

  // Special name-based overrides
  if (nameWords.some(word => ['chat', 'message', 'talk'].includes(word))) {
    primaryColor = '#10B981';
    secondaryColor = '#3B82F6';
    style = 'creative';
  } else if (nameWords.some(word => ['dashboard', 'admin', 'panel'].includes(word))) {
    primaryColor = '#1F2937';
    secondaryColor = '#6B7280';
    style = 'minimal';
  } else if (nameWords.some(word => ['blog', 'news', 'article'].includes(word))) {
    primaryColor = '#F59E0B';
    secondaryColor = '#EF4444';
    style = 'modern';
  } else if (nameWords.some(word => ['music', 'audio', 'sound'].includes(word))) {
    primaryColor = '#8B5CF6';
    secondaryColor = '#EC4899';
    style = 'gradient';
  } else if (nameWords.some(word => ['photo', 'image', 'gallery'].includes(word))) {
    primaryColor = '#06B6D4';
    secondaryColor = '#8B5CF6';
    style = 'creative';
  }

  return { style, primaryColor, secondaryColor };
}
