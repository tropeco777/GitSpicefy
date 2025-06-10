"use client";
import { motion } from "framer-motion";
import { FileText, Loader2, CheckCircle } from "lucide-react";

interface GenerationProgressProps {
  currentFile: string;
  progress: number;
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({
  currentFile,
  progress,
}) => {
  return (
    <div className="bg-white dark:bg-dark-200 rounded-xl border border-gray-200 dark:border-dark-700 p-8 mb-8">
      <div className="text-center mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="inline-block mb-4"
        >
          <Loader2 className="w-12 h-12 text-primary" />
        </motion.div>
        
        <h2 className="text-2xl font-bold mb-2">Analyzing Repository</h2>
        <p className="text-gray-600 dark:text-gray-400">
          AI is examining each file to understand your project structure and functionality
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(progress)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-primary to-purple-600 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Current File */}
      <motion.div
        key={currentFile}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-300 rounded-lg"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <span className="font-medium">Analyzing:</span>
        </div>
        
        <code className="text-sm bg-gray-200 dark:bg-dark-700 px-2 py-1 rounded">
          {currentFile}
        </code>
        
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="ml-auto"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full" />
        </motion.div>
      </motion.div>

      {/* Analysis Steps */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnalysisStep
          title="Code Structure"
          description="Understanding file organization and dependencies"
          isActive={progress > 20}
          isComplete={progress > 60}
        />
        
        <AnalysisStep
          title="Functionality"
          description="Analyzing what each component does"
          isActive={progress > 40}
          isComplete={progress > 80}
        />
        
        <AnalysisStep
          title="Documentation"
          description="Generating comprehensive README"
          isActive={progress > 70}
          isComplete={progress >= 100}
        />
      </div>
    </div>
  );
};

interface AnalysisStepProps {
  title: string;
  description: string;
  isActive: boolean;
  isComplete: boolean;
}

const AnalysisStep: React.FC<AnalysisStepProps> = ({
  title,
  description,
  isActive,
  isComplete,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ 
        opacity: isActive ? 1 : 0.5,
        scale: isActive ? 1.02 : 1
      }}
      transition={{ duration: 0.3 }}
      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
        isComplete
          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
          : isActive
          ? "border-primary bg-primary/5"
          : "border-gray-200 dark:border-dark-700"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {isComplete ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : isActive ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-5 h-5 text-primary" />
          </motion.div>
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
        )}
        
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      
      <p className="text-xs text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </motion.div>
  );
};

export default GenerationProgress;
