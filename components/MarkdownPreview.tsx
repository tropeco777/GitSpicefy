"use client";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { useTheme } from "next-themes";

interface MarkdownPreviewComponentProps {
  markdown: string;
  alignment: "left" | "center" | "right";
}

const MarkdownPreviewComponent: React.FC<MarkdownPreviewComponentProps> = ({
  markdown,
  alignment,
}) => {
  const { theme } = useTheme();

  const getAlignmentStyle = (): React.CSSProperties => {
    switch (alignment) {
      case "center":
        return { textAlign: "center" };
      case "right":
        return { textAlign: "right" };
      default:
        return { textAlign: "left" };
    }
  };

  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl border border-gray-200 dark:border-dark-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-300">
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="ml-4 text-sm font-medium text-gray-600 dark:text-gray-400">
            README.md Preview
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6" style={getAlignmentStyle()}>
        <MarkdownPreview
          source={markdown}
          data-color-mode={theme === 'dark' ? 'dark' : 'light'}
          style={{
            backgroundColor: 'transparent',
            padding: 0,
          }}
          wrapperElement={{
            "data-color-mode": theme === 'dark' ? 'dark' : 'light'
          }}
        />
      </div>
    </div>
  );
};

export default MarkdownPreviewComponent;
