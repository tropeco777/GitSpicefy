import OpenAI from 'openai';
import { RepositoryInfo, GitHubFile } from '../github';
import { ReadmeConfig } from '../../types/readme-config';

export class OpenAIProvider {
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY || '',
    });
  }

  async generateReadme(
    repoInfo: RepositoryInfo,
    files: GitHubFile[],
    config: ReadmeConfig
  ): Promise<string> {
    if (!this.client.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    const prompt = this.buildPrompt(repoInfo, files, config);

    try {
      const completion = await this.client.chat.completions.create({
        model: config.aiModel || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert technical writer specializing in creating comprehensive, professional README files for software projects. Generate detailed, well-structured documentation that follows best practices.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI generation error:', error);
      throw error;
    }
  }

  private buildPrompt(
    repoInfo: RepositoryInfo,
    files: GitHubFile[],
    config: ReadmeConfig
  ): string {
    const fileStructure = files
      .filter(f => f.type === 'file')
      .map(f => f.path)
      .slice(0, 20)
      .join('\n');

    const packageFiles = files.filter(f => 
      f.name === 'package.json' || 
      f.name === 'requirements.txt' || 
      f.name === 'Cargo.toml' ||
      f.name === 'go.mod'
    );

    let prompt = `Create a comprehensive README.md for the following GitHub repository:

**Repository Information:**
- Name: ${repoInfo.name}
- Description: ${repoInfo.description || 'No description provided'}
- Language: ${repoInfo.language}
- Stars: ${repoInfo.stars}
- Forks: ${repoInfo.forks}

**File Structure (first 20 files):**
${fileStructure}

**Configuration:**
- Header Alignment: ${config.headerAlignment}
- Include Emojis: ${config.addEmojisToHeadings}
- Badge Style: ${config.badgeStyle}
- License: ${config.licenseType}

**Sections to Include:**`;

    Object.entries(config.sections).forEach(([section, include]) => {
      if (include) {
        prompt += `\n- ${section}`;
      }
    });

    if (config.customPrompt) {
      prompt += `\n\n**Additional Instructions:**
${config.customPrompt}`;
    }

    prompt += `\n\n**Requirements:**
1. Use professional, clear language
2. Include relevant badges and shields
3. Provide comprehensive installation and usage instructions
4. Add appropriate emojis if enabled
5. Follow the specified alignment for headers
6. Make it engaging and informative
7. Include code examples where appropriate
8. Add a table of contents if the README is long
9. Use the specified badge style: ${config.badgeStyle}

Generate a complete, professional README.md file:`;

    return prompt;
  }

  async generateProjectIdeas(repoInfo: RepositoryInfo, files: GitHubFile[]): Promise<string[]> {
    if (!this.client.apiKey) {
      return [];
    }

    const prompt = `Based on this ${repoInfo.language} project "${repoInfo.name}", suggest 5 creative project ideas or extensions that could be built using similar technologies. Keep suggestions brief and practical.

Project: ${repoInfo.name}
Description: ${repoInfo.description}
Language: ${repoInfo.language}

Return as a simple list of ideas:`;

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.8,
      });

      const content = completion.choices[0]?.message?.content || '';

      return content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim())
        .slice(0, 5);
    } catch (error) {
      console.error('Project ideas generation error:', error);
      return [];
    }
  }

  async generateRoadmap(repoInfo: RepositoryInfo): Promise<string[]> {
    if (!this.client.apiKey) {
      return [];
    }

    const prompt = `Create a development roadmap for the project "${repoInfo.name}" (${repoInfo.language}).

Description: ${repoInfo.description}

Suggest 6-8 realistic development milestones or features that would enhance this project. Format as a simple list:`;

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content || '';

      return content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim())
        .slice(0, 8);
    } catch (error) {
      console.error('Roadmap generation error:', error);
      return [];
    }
  }
}
