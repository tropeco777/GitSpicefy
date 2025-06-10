export interface GitHubFile {
  name: string;
  path: string;
  content?: string;
  type: "file" | "dir";
  size?: number;
}

export interface RepositoryInfo {
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  isPrivate: boolean;
  defaultBranch: string;
}

export class GitHubService {
  private baseUrl = 'https://api.github.com';
  private token?: string;

  constructor(token?: string) {
    this.token = token || process.env.GITHUB_TOKEN;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitSpicefy-App/1.0'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async fetchWithRetry(url: string, maxRetries: number = 2): Promise<Response> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: this.getHeaders()
        });

        // If rate limited and we have retries left, wait and retry
        if (response.status === 403 && attempt < maxRetries) {
          const rateLimitReset = response.headers.get('x-ratelimit-reset');
          const resetTime = rateLimitReset ? parseInt(rateLimitReset) * 1000 : Date.now() + 60000;
          const waitTime = Math.min(resetTime - Date.now(), 60000); // Max 1 minute wait

          if (waitTime > 0 && waitTime < 60000) {
            console.log(`Rate limited, waiting ${Math.round(waitTime / 1000)}s before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }

        return response;
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }

    throw new Error('Max retries exceeded');
  }

  async getRepositoryInfo(owner: string, repo: string): Promise<RepositoryInfo> {
    try {
      const url = `${this.baseUrl}/repos/${owner}/${repo}`;
      console.log(`Fetching repository info from: ${url}`);

      const response = await this.fetchWithRetry(url);

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GitHub API Error: ${response.status} - ${errorText}`);

        if (response.status === 404) {
          throw new Error(`Repository '${owner}/${repo}' not found. Please check the URL and ensure the repository is public.`);
        } else if (response.status === 403) {
          const rateLimitReset = response.headers.get('x-ratelimit-reset');
          const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000) : null;
          const resetMessage = resetTime ? ` Rate limit resets at ${resetTime.toLocaleTimeString()}.` : '';

          if (errorText.includes('rate limit')) {
            throw new Error(`GitHub API rate limit exceeded.${resetMessage} Please try again later or add a GitHub token to increase rate limits.`);
          } else {
            throw new Error(`Access forbidden. The repository might be private or require authentication.`);
          }
        } else if (response.status === 401) {
          throw new Error(`Authentication failed. Please check your GitHub token.`);
        } else {
          throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();

      return {
        name: data.name,
        fullName: data.full_name,
        description: data.description || "",
        language: data.language || "Unknown",
        stars: data.stargazers_count,
        forks: data.forks_count,
        isPrivate: data.private,
        defaultBranch: data.default_branch,
      };
    } catch (error) {
      throw new Error(`Failed to fetch repository info: ${error}`);
    }
  }

  async getRepositoryFiles(
    owner: string,
    repo: string,
    path: string = "",
    branch: string = "main"
  ): Promise<GitHubFile[]> {
    try {
      const url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch files`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          name: item.name,
          path: item.path,
          type: item.type as "file" | "dir",
          size: item.size,
        }));
      } else {
        return [
          {
            name: data.name,
            path: data.path,
            type: data.type as "file" | "dir",
            size: data.size,
          },
        ];
      }
    } catch (error) {
      throw new Error(`Failed to fetch repository files: ${error}`);
    }
  }

  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    branch: string = "main"
  ): Promise<string> {
    try {
      const url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch file content`);
      }

      const data = await response.json();

      if (data.content) {
        return Buffer.from(data.content, "base64").toString("utf-8");
      }

      throw new Error("File content not found");
    } catch (error) {
      throw new Error(`Failed to fetch file content: ${error}`);
    }
  }

  async getAllFiles(
    owner: string,
    repo: string,
    branch: string = "main",
    maxFiles: number = 50
  ): Promise<GitHubFile[]> {
    const allFiles: GitHubFile[] = [];
    const processedPaths = new Set<string>();

    const processDirectory = async (path: string = ""): Promise<void> => {
      if (allFiles.length >= maxFiles) return;

      try {
        const files = await this.getRepositoryFiles(owner, repo, path, branch);

        for (const file of files) {
          if (allFiles.length >= maxFiles) break;
          if (processedPaths.has(file.path)) continue;

          processedPaths.add(file.path);

          if (file.type === "file") {
            // Skip binary files and very large files
            if (this.shouldProcessFile(file.name) && (file.size || 0) < 100000) {
              try {
                const content = await this.getFileContent(owner, repo, file.path, branch);
                allFiles.push({
                  ...file,
                  content,
                });
              } catch (error) {
                // Skip files that can't be read
                console.warn(`Skipping file ${file.path}: ${error}`);
              }
            }
          } else if (file.type === "dir" && this.shouldProcessDirectory(file.name)) {
            await processDirectory(file.path);
          }
        }
      } catch (error) {
        console.warn(`Error processing directory ${path}: ${error}`);
      }
    };

    await processDirectory();
    return allFiles;
  }

  private shouldProcessFile(fileName: string): boolean {
    const allowedExtensions = [
      ".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".cpp", ".c", ".h",
      ".css", ".scss", ".html", ".vue", ".php", ".rb", ".go", ".rs",
      ".md", ".txt", ".json", ".xml", ".yml", ".yaml", ".toml",
      ".sh", ".bat", ".ps1", ".sql", ".r", ".swift", ".kt", ".dart",
    ];

    const allowedFiles = [
      "README", "LICENSE", "CHANGELOG", "CONTRIBUTING", "package.json",
      "composer.json", "Cargo.toml", "go.mod", "requirements.txt",
      "Dockerfile", "docker-compose.yml", ".gitignore", ".env.example",
    ];

    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
    const baseName = fileName.toLowerCase();

    return (
      allowedExtensions.includes(extension) ||
      allowedFiles.some((allowed) => baseName.includes(allowed.toLowerCase()))
    );
  }

  private shouldProcessDirectory(dirName: string): boolean {
    const skipDirectories = [
      "node_modules", ".git", ".next", "dist", "build", "target",
      "vendor", "__pycache__", ".vscode", ".idea", "coverage",
      ".nyc_output", "logs", "tmp", "temp", ".cache",
    ];

    return !skipDirectories.includes(dirName.toLowerCase());
  }
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    // Clean the URL
    const cleanUrl = url.trim().replace(/\/$/, ''); // Remove trailing slash

    // Multiple regex patterns to handle different GitHub URL formats
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/\?#]+)/,  // Standard format
      /^([^\/]+)\/([^\/\?#]+)$/,             // Just owner/repo
    ];

    for (const regex of patterns) {
      const match = cleanUrl.match(regex);
      if (match) {
        const owner = match[1];
        let repo = match[2];

        // Clean repo name
        repo = repo.replace(/\.git$/, ''); // Remove .git suffix
        repo = repo.split('?')[0]; // Remove query parameters
        repo = repo.split('#')[0]; // Remove hash fragments

        console.log(`Parsed GitHub URL: owner="${owner}", repo="${repo}"`);

        return { owner, repo };
      }
    }

    console.error(`Failed to parse GitHub URL: ${url}`);
    return null;
  } catch (error) {
    console.error(`Error parsing GitHub URL: ${error}`);
    return null;
  }
}
