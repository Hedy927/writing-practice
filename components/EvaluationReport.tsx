
import React from 'react';
import { EvaluationResult } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Award, Target, Layout, Edit3, SpellCheck } from 'lucide-react';

interface Props {
  result: EvaluationResult;
}

const EvaluationReport: React.FC<Props> = ({ result }) => {
  const chartData = [
    { subject: '立意取材', A: result.dimensionScores.meaning, full: 6 },
    { subject: '結構組織', A: result.dimensionScores.structure, full: 6 },
    { subject: '遣詞造句', A: result.dimensionScores.vocabulary, full: 6 },
    { subject: '錯字標點', A: result.dimensionScores.grammar, full: 6 },
  ];

  const getLevelColor = (level: number) => {
    if (level >= 5) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (level >= 3) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Summary */}
      <div className="bg-white rounded-2xl border p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-black text-gray-900 mb-2">寫作評鑑報告</h2>
          <p className="text-gray-500">根據國中會考評分標準 (CAP-Aligned)</p>
          <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
            <div className={`px-6 py-3 rounded-2xl border-2 flex items-center gap-3 ${getLevelColor(result.overallLevel)}`}>
              <Award className="w-6 h-6" />
              <div>
                <div className="text-xs font-bold uppercase opacity-60">總體級分</div>
                <div className="text-2xl font-black">{result.overallLevel} / 6</div>
              </div>
            </div>
            <div className={`px-6 py-3 rounded-2xl border-2 flex items-center gap-3 ${getLevelColor(result.overallLevel)}`}>
              <Target className="w-6 h-6" />
              <div>
                <div className="text-xs font-bold uppercase opacity-60">等級分類</div>
                <div className="text-2xl font-black">{result.gradeBand} 級</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-64 h-64 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fontWeight: 700 }} />
              <Radar
                name="Score"
                dataKey="A"
                stroke="#4f46e5"
                fill="#4f46e5"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: '立意取材', icon: Target, score: result.dimensionScores.meaning, comment: result.dimensionComments.meaning, color: 'indigo' },
          { label: '結構組織', icon: Layout, score: result.dimensionScores.structure, comment: result.dimensionComments.structure, color: 'blue' },
          { label: '遣詞造句', icon: Edit3, score: result.dimensionScores.vocabulary, comment: result.dimensionComments.vocabulary, color: 'violet' },
          { label: '錯字標點', icon: SpellCheck, score: result.dimensionScores.grammar, comment: result.dimensionComments.grammar, color: 'emerald' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${item.color}-50 text-${item.color}-600`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-800">{item.label}</h4>
              </div>
              <div className="font-black text-xl text-gray-900">{item.score} <span className="text-xs font-normal text-gray-400">/ 6</span></div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed italic">「{item.comment}」</p>
          </div>
        ))}
      </div>

      {/* SWOT Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 border border-green-100 rounded-xl p-6">
          <h4 className="text-green-800 font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> 寫作亮點
          </h4>
          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="text-sm text-green-700 flex gap-2">
                <span className="text-green-400">•</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-6">
          <h4 className="text-amber-800 font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> 待改進處
          </h4>
          <ul className="space-y-2">
            {result.weaknesses.map((w, i) => (
              <li key={i} className="text-sm text-amber-700 flex gap-2">
                <span className="text-amber-400">•</span> {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Revision Guide */}
      <div className="bg-indigo-600 rounded-xl p-8 text-white shadow-xl shadow-indigo-100">
        <h4 className="text-xl font-bold mb-6">前進下一級分的關鍵建議</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {result.revisionTips.map((tip, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-3xl font-black mb-2 opacity-30">0{i+1}</div>
              <p className="text-sm font-medium leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Sparkles: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);

const AlertCircle: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);

export default EvaluationReport;
