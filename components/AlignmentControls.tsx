"use client";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";

interface AlignmentControlsProps {
  alignment: "left" | "center" | "right";
  onAlignmentChange: (alignment: "left" | "center" | "right") => void;
}

const AlignmentControls: React.FC<AlignmentControlsProps> = ({
  alignment,
  onAlignmentChange,
}) => {
  const alignmentOptions = [
    { value: "left" as const, icon: AlignLeft, label: "Left" },
    { value: "center" as const, icon: AlignCenter, label: "Center" },
    { value: "right" as const, icon: AlignRight, label: "Right" },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
        Alignment:
      </span>
      
      <div className="flex bg-gray-100 dark:bg-dark-300 rounded-lg p-1">
        {alignmentOptions.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => onAlignmentChange(value)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              alignment === value
                ? "bg-white dark:bg-dark-200 text-primary shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
            title={`Align ${label.toLowerCase()}`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AlignmentControls;
