"use client";
import { useState } from "react";
import { Github, AlertCircle, CheckCircle } from "lucide-react";
import { isValidGitHubUrl } from "@/lib/utils/validation";

interface GitHubUrlInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const GitHubUrlInput: React.FC<GitHubUrlInputProps> = ({
  value,
  onChange,
  onGenerate,
  isGenerating,
}) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  // Use the imported validation function

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.trim()) {
      setIsValid(isValidGitHubUrl(newValue.trim()));
    } else {
      setIsValid(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isValid && !isGenerating) {
      onGenerate();
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
          <Github className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </div>
        
        <input
          type="url"
          value={value}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="https://github.com/username/repository"
          disabled={isGenerating}
          className={`
            w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 text-sm sm:text-base
            bg-white dark:bg-dark-200
            border-2 rounded-lg
            text-gray-900 dark:text-white
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${isValid === false
              ? "border-red-500 focus:ring-red-500"
              : isValid === true
                ? "border-green-500 focus:ring-green-500"
                : "border-gray-300 dark:border-dark-700"
            }
          `}
        />
        
        <div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center">
          {isValid === false && (
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
          )}
          {isValid === true && (
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
          )}
        </div>
      </div>
      
      {isValid === false && (
        <p className="mt-2 text-sm text-red-500">
          Please enter a valid GitHub repository URL
        </p>
      )}
      
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Example: https://github.com/username/repository-name
      </p>
    </div>
  );
};

export default GitHubUrlInput;
