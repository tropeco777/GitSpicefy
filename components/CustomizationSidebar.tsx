"use client";
import { useState } from "react";
import { ReadmeConfig, defaultReadmeConfig } from "../types/readme-config";
import {
  Settings,
  Palette,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronRight
} from "lucide-react";

interface CustomizationSidebarProps {
  config: ReadmeConfig;
  onConfigChange: (config: ReadmeConfig) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export default function CustomizationSidebar({
  config,
  onConfigChange,
  onGenerate,
  isGenerating
}: CustomizationSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    styling: true,
    sections: true,
    premium: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateConfig = (updates: Partial<ReadmeConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const updateSections = (sectionKey: keyof ReadmeConfig['sections'], value: boolean) => {
    onConfigChange({
      ...config,
      sections: {
        ...config.sections,
        [sectionKey]: value
      }
    });
  };

  return (
    <div className="w-full h-full">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Customize README</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tailor your documentation
            </p>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full mb-6 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate README
            </>
          )}
        </button>

        {/* Styling Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('styling')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-300 rounded-lg mb-3 hover:bg-gray-100 dark:hover:bg-dark-400 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="font-medium">Styling</span>
            </div>
            {expandedSections.styling ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {expandedSections.styling && (
            <div className="space-y-4 pl-4">
              {/* Header Alignment */}
              <div>
                <label className="block text-sm font-medium mb-2">Header Alignment</label>
                <div className="flex gap-2">
                  {(['left', 'center', 'right'] as const).map((alignment) => (
                    <button
                      key={alignment}
                      onClick={() => updateConfig({ headerAlignment: alignment })}
                      className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                        config.headerAlignment === alignment
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white dark:bg-dark-300 border-gray-300 dark:border-gray-600 hover:border-primary'
                      }`}
                    >
                      {alignment.charAt(0).toUpperCase() + alignment.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table of Contents Style */}
              <div>
                <label className="block text-sm font-medium mb-2">Table of Contents Style</label>
                <select
                  value={config.tableOfContentsStyle}
                  onChange={(e) => updateConfig({ tableOfContentsStyle: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-300 text-sm"
                >
                  <option value="bullet">• Bullet</option>
                  <option value="numbered">1. Numbered</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>

              {/* Badge Style */}
              <div>
                <label className="block text-sm font-medium mb-2">Badge Style</label>
                <select
                  value={config.badgeStyle}
                  onChange={(e) => updateConfig({ badgeStyle: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-300 text-sm"
                >
                  <option value="flat">Flat</option>
                  <option value="flat-square">Flat Square</option>
                  <option value="for-the-badge">For The Badge</option>
                  <option value="plastic">Plastic</option>
                </select>
              </div>

              {/* Visual Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Generate Logo</label>
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <button
                    disabled
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-gray-300 dark:bg-gray-600 opacity-50 cursor-not-allowed"
                  >
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Add Emojis to Headings</label>
                  <button
                    onClick={() => updateConfig({ addEmojisToHeadings: !config.addEmojisToHeadings })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.addEmojisToHeadings ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.addEmojisToHeadings ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sections */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('sections')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-300 rounded-lg mb-3 hover:bg-gray-100 dark:hover:bg-dark-400 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="font-medium">Detail Sections</span>
            </div>
            {expandedSections.sections ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {expandedSections.sections && (
            <div className="space-y-3 pl-4">
              {Object.entries(config.sections).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <button
                    onClick={() => updateSections(key as keyof ReadmeConfig['sections'], !value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>



        {/* Premium Sections */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('premium')}
            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg mb-3 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-purple-700 dark:text-purple-300">Premium Sections</span>
            </div>
            {expandedSections.premium ? (
              <ChevronDown className="w-4 h-4 text-purple-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-purple-600" />
            )}
          </button>

          {expandedSections.premium && (
            <div className="space-y-4 pl-4">
              <div>
                <label className="block text-sm font-medium mb-2">License Type</label>
                <select
                  value={config.licenseType}
                  onChange={(e) => updateConfig({ licenseType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-300 text-sm"
                >
                  <option value="MIT">MIT License</option>
                  <option value="Apache-2.0">Apache 2.0</option>
                  <option value="GPL-3.0">GPL 3.0</option>
                  <option value="BSD-3-Clause">BSD 3-Clause</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Custom Features</label>
                <textarea
                  value={config.customFeatures?.join('\n') || ''}
                  onChange={(e) => updateConfig({ 
                    customFeatures: e.target.value.split('\n').filter(f => f.trim()) 
                  })}
                  placeholder="Enter custom features (one per line)..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-300 text-sm resize-none"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Custom Tech Stack</label>
                <textarea
                  value={config.customTechStack?.join('\n') || ''}
                  onChange={(e) => updateConfig({ 
                    customTechStack: e.target.value.split('\n').filter(t => t.trim()) 
                  })}
                  placeholder="Enter technologies (one per line)..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-300 text-sm resize-none"
                  rows={4}
                />
              </div>
            </div>
          )}
        </div>

        {/* Reset Button */}
        <button
          onClick={() => onConfigChange(defaultReadmeConfig)}
          className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
