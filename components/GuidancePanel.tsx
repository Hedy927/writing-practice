
import React from 'react';
import { Feedback } from '../types';
import { Sparkles, AlertCircle, Info } from 'lucide-react';

interface Props {
  feedback: Feedback | null;
  loading: boolean;
}

const GuidancePanel: React.FC<Props> = ({ feedback, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border p-6 shadow-sm animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-gray-100 rounded mb-2"></div>
        <div className="h-10 bg-gray-100 rounded mb-2"></div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col items-center justify-center text-gray-400">
        <Sparkles className="w-8 h-8 mb-2 opacity-20" />
        <p className="text-sm">點擊「檢查進度」讓 AI 教練給你一些靈感吧！</p>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (feedback.status) {
      case 'success': return <Sparkles className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusBg = () => {
    switch (feedback.status) {
      case 'success': return 'bg-green-50 border-green-100';
      case 'warning': return 'bg-amber-50 border-amber-100';
      default: return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className={`rounded-xl border p-6 shadow-sm ${getStatusBg()}`}>
      <div className="flex items-center gap-2 mb-3">
        {getStatusIcon()}
        <h3 className="font-bold text-gray-800">教練分析回饋</h3>
      </div>
      <p className="text-gray-700 mb-4 leading-relaxed">
        {feedback.message}
      </p>
      {feedback.suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">修正建議</p>
          <ul className="space-y-2">
            {feedback.suggestions.map((tip, i) => (
              <li key={i} className="flex gap-3 items-start text-sm text-gray-600 bg-white/50 p-2 rounded-lg border border-white/80">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GuidancePanel;
