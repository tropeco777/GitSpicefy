/**
 * Validates if a URL is a valid GitHub repository URL
 */
export function isValidGitHubUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url.trim());
    
    // Check if it's a GitHub URL
    if (urlObj.hostname !== 'github.com') {
      return false;
    }

    // Check if it has the correct path structure: /username/repository
    const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
    
    // Should have exactly 2 parts: username and repository
    if (pathParts.length < 2) {
      return false;
    }

    const [username, repository] = pathParts;

    // Basic validation for username and repository name
    const validNamePattern = /^[a-zA-Z0-9._-]+$/;
    
    if (!validNamePattern.test(username) || !validNamePattern.test(repository)) {
      return false;
    }

    // Username and repository shouldn't be empty or just dots/dashes
    if (username.length === 0 || repository.length === 0) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Extracts owner and repo name from a GitHub URL
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  if (!isValidGitHubUrl(url)) {
    return null;
  }

  try {
    const urlObj = new URL(url.trim());
    const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
    
    return {
      owner: pathParts[0],
      repo: pathParts[1]
    };
  } catch (error) {
    return null;
  }
}

/**
 * Normalizes a GitHub URL to the standard format
 */
export function normalizeGitHubUrl(url: string): string | null {
  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    return null;
  }

  return `https://github.com/${parsed.owner}/${parsed.repo}`;
}
