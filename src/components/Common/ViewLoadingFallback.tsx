import React from 'react';
import { Loader2, Zap } from 'lucide-react';

export const ViewLoadingFallback: React.FC<{ message?: string }> = ({
  message = 'جاري تحميل القسم...'
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] w-full p-8">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 animate-pulse">
          <Zap className="w-6 h-6 fill-current" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow">
          <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
        </div>
      </div>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        {message}
      </p>
    </div>
  );
};
