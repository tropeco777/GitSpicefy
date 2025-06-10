"use client";
import { useState } from "react";
import { Edit3, Eye } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className={`bg-white dark:bg-dark-200 rounded-xl border border-gray-200 dark:border-dark-700 overflow-hidden ${
      isFullscreen ? "fixed inset-4 z-50" : ""
    }`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <Edit3 className="w-4 h-4 ml-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Edit README.md
            </span>
          </div>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-dark-700 rounded-lg transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full p-6 bg-transparent text-gray-900 dark:text-gray-100 font-mono text-sm leading-relaxed resize-none focus:outline-none ${
            isFullscreen ? "h-[calc(100vh-8rem)]" : "h-96"
          }`}
          placeholder="Start editing your README.md content here..."
          spellCheck={false}
        />
        
        {/* Line numbers */}
        <div className="absolute left-0 top-0 p-6 pointer-events-none select-none">
          <div className="font-mono text-sm text-gray-400 dark:text-gray-600 leading-relaxed">
            {value.split('\n').map((_, index) => (
              <div key={index} className="text-right pr-4 min-w-[2rem]">
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-300">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span>Lines: {value.split('\n').length}</span>
            <span>Characters: {value.length}</span>
            <span>Words: {value.split(/\s+/).filter(word => word.length > 0).length}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>Markdown</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>
      
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsFullscreen(false)}
        />
      )}
    </div>
  );
};

export default MarkdownEditor;
