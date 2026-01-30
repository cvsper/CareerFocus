import React from 'react';
import { Info } from 'lucide-react';
interface AnnotationProps {
  children: React.ReactNode;
  className?: string;
}
export function Annotation({ children, className = '' }: AnnotationProps) {
  return (
    <div
      className={`
      relative group mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg 
      text-xs text-yellow-800 font-mono flex items-start gap-2
      hover:shadow-md transition-shadow cursor-help
      ${className}
    `}>

      <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
      <div>
        <span className="font-bold block text-yellow-900 mb-1">DEV NOTE:</span>
        {children}
      </div>
    </div>);

}