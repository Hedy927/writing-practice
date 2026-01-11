
import React, { useState, useEffect } from 'react';
import { Step, WritingState, Feedback, EvaluationResult, SkeletonPart } from './types';
import StepIndicator from './components/StepIndicator';
import GuidancePanel from './components/GuidancePanel';
import EvaluationReport from './components/EvaluationReport';
import { getStepFeedback, evaluateEssay, generateSkeletonSuggestions } from './geminiService';
import { ChevronRight, ChevronLeft, CheckCircle2, RotateCcw, Loader2, Wand2 } from 'lucide-react';

const emptySkeletonPart: SkeletonPart = {
  purpose: '',
  keyIdea: '',
  exampleType: '',
  goldenSentenceType: ''
};

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.INPUT_TOPIC);
  const [state, setState] = useState<WritingState>({
    topic: '',
    interpretation: '',
    outline: { introduction: '', development: '', transition: '', conclusion: '' },
    skeleton: {
      introduction: { ...emptySkeletonPart },
      development: { ...emptySkeletonPart },
      transition: { ...emptySkeletonPart },
      conclusion: { ...emptySkeletonPart }
    },
    fullEssay: ''
  });
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  const handleNext = async () => {
    if (currentStep === Step.OUTLINE) {
      // Before moving to Skeleton, optionally trigger generation if empty
      setLoading(true);
      try {
        const suggestions = await generateSkeletonSuggestions(state.topic, state.outline);
        setState(prev => ({ ...prev, skeleton: suggestions }));
        setCurrentStep(Step.SKELETON);
      } catch (e) {
        console.error("Failed to generate skeleton:", e);
        setCurrentStep(Step.SKELETON);
      } finally {
        setLoading(false);
      }
    } else if (currentStep === Step.WRITING) {
      setLoading(true);
      try {
        const result = await evaluateEssay(state);
        setEvaluation(result);
        setCurrentStep(Step.EVALUATION);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    } else if (currentStep < Step.EVALUATION) {
      setCurrentStep(prev => prev + 1);
      setFeedback(null);
    }
  };

  const handleBack = () => {
    if (currentStep > Step.INPUT_TOPIC) {
      setCurrentStep(prev => prev - 1);
      setFeedback(null);
    }
  };

  const handleCheck = async () => {
    setLoading(true);
    let context = '';
    let stepName = '';

    switch (currentStep) {
      case Step.INTERPRETATION:
        context = state.interpretation;
        stepName = '破題引導';
        break;
      case Step.OUTLINE:
        context = JSON.stringify(state.outline);
        stepName = '起承轉合大綱';
        break;
      case Step.SKELETON:
        context = JSON.stringify(state.skeleton);
        stepName = '段落骨架';
        break;
      case Step.WRITING:
        context = state.fullEssay;
        stepName = '全文內容';
        break;
    }

    try {
      const fb = await getStepFeedback(stepName, context, state.topic);
      setFeedback(fb);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderRecap = () => {
    if (currentStep === Step.INPUT_TOPIC) return null;
    return (
      <div className="mb-6 px-4 py-2 bg-slate-50 border-l-4 border-indigo-400 rounded-r-lg text-sm text-slate-600 italic">
        {currentStep >= Step.INTERPRETATION && <p><strong>題目：</strong>{state.topic}</p>}
        {currentStep >= Step.OUTLINE && <p className="truncate"><strong>解讀：</strong>{state.interpretation}</p>}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case Step.INPUT_TOPIC:
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-3xl font-black text-gray-900">歡迎！教練準備好了。</h1>
            <p className="text-gray-500">請輸入你今天想要練習的作文題目。</p>
            <div className="relative">
              <input
                type="text"
                className="w-full text-xl p-6 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all placeholder:text-gray-300"
                placeholder="例如：我從同學身上學到的事"
                value={state.topic}
                onChange={e => setState({ ...state, topic: e.target.value })}
              />
            </div>
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
              <h4 className="text-indigo-800 font-bold mb-2 flex items-center gap-2">教練小提示：</h4>
              <p className="text-indigo-700 text-sm leading-relaxed">
                題目是文章的靈魂。輸入後，我會引導你從解讀題目開始，一步步建立起屬於你的精采文章。
              </p>
            </div>
          </div>
        );

      case Step.INTERPRETATION:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Step 1: 破題引導</h2>
            <p className="text-gray-600">請用自己的話，簡單解釋你認為這個題目在問什麼？重點在哪裡？</p>
            <textarea
              className="w-full h-40 p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="我覺得這個題目是要我分享..."
              value={state.interpretation}
              onChange={e => setState({ ...state, interpretation: e.target.value })}
            />
          </div>
        );

      case Step.OUTLINE:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Step 2: 起承轉合大綱</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'introduction', label: '起 (開頭引出)', placeholder: '敘述背景或第一印象...' },
                { key: 'development', label: '承 (內容擴展)', placeholder: '進一步細寫過程或現象...' },
                { key: 'transition', label: '轉 (關鍵轉折)', placeholder: '遇到的困難、改變或省思...' },
                { key: 'conclusion', label: '合 (結尾啟示)', placeholder: '呼應開頭、總結體會...' },
              ].map(item => (
                <div key={item.key} className="p-4 border rounded-xl bg-white shadow-sm">
                  <label className="block text-sm font-bold text-gray-500 mb-2">{item.label}</label>
                  <input
                    type="text"
                    className="w-full p-2 border-b focus:border-indigo-500 outline-none"
                    placeholder={item.placeholder}
                    value={(state.outline as any)[item.key]}
                    onChange={e => setState({
                      ...state,
                      outline: { ...state.outline, [item.key]: e.target.value }
                    })}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case Step.SKELETON:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Step 3: 段落骨架 (自動生成)</h2>
              <button 
                onClick={async () => {
                   setLoading(true);
                   try {
                     const sug = await generateSkeletonSuggestions(state.topic, state.outline);
                     setState(p => ({ ...p, skeleton: sug }));
                   } finally { setLoading(false); }
                }}
                className="text-xs flex items-center gap-1 text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors"
              >
                <Wand2 className="w-3 h-3" /> 重新生成建議
              </button>
            </div>
            <p className="text-sm text-gray-500">教練根據你的大綱預想了寫作路徑，你可以微調這些設定：</p>
            <div className="space-y-6">
              {[
                { key: 'introduction', label: '第一段 (起)', base: state.outline.introduction },
                { key: 'development', label: '第二段 (承)', base: state.outline.development },
                { key: 'transition', label: '第三段 (轉)', base: state.outline.transition },
                { key: 'conclusion', label: '第四段 (合)', base: state.outline.conclusion },
              ].map(item => (
                <div key={item.key} className="p-5 border rounded-2xl bg-white shadow-sm space-y-4">
                  <div className="border-b pb-2 flex justify-between items-center">
                    <span className="text-sm font-black text-indigo-600">{item.label}</span>
                    <span className="text-xs text-gray-400">主題：{item.base}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase">段落目的</label>
                      <input
                        className="w-full p-2 text-sm border-b focus:border-indigo-500 outline-none"
                        value={(state.skeleton as any)[item.key].purpose}
                        onChange={e => {
                          const newSkel = { ...state.skeleton };
                          (newSkel as any)[item.key].purpose = e.target.value;
                          setState({ ...state, skeleton: newSkel });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase">核心想法</label>
                      <input
                        className="w-full p-2 text-sm border-b focus:border-indigo-500 outline-none"
                        value={(state.skeleton as any)[item.key].keyIdea}
                        onChange={e => {
                          const newSkel = { ...state.skeleton };
                          (newSkel as any)[item.key].keyIdea = e.target.value;
                          setState({ ...state, skeleton: newSkel });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase">建議例證類型</label>
                      <input
                        className="w-full p-2 text-sm border-b focus:border-indigo-500 outline-none"
                        value={(state.skeleton as any)[item.key].exampleType}
                        onChange={e => {
                          const newSkel = { ...state.skeleton };
                          (newSkel as any)[item.key].exampleType = e.target.value;
                          setState({ ...state, skeleton: newSkel });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase">金句建議方向</label>
                      <input
                        className="w-full p-2 text-sm border-b focus:border-indigo-500 outline-none"
                        value={(state.skeleton as any)[item.key].goldenSentenceType}
                        onChange={e => {
                          const newSkel = { ...state.skeleton };
                          (newSkel as any)[item.key].goldenSentenceType = e.target.value;
                          setState({ ...state, skeleton: newSkel });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case Step.WRITING:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Final Step: 填寫完整文章</h2>
              <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-400">建議字數: 400-600字</span>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-xs text-amber-800 mb-4">
              <strong>寫作提示：</strong>請依照先前規劃的骨架，將想法擴充為流暢的文字。
            </div>
            <textarea
              className="w-full h-[500px] p-6 border-2 border-indigo-50 rounded-2xl focus:border-indigo-500 outline-none leading-relaxed font-serif text-lg shadow-inner"
              placeholder="在這裡開始你的創作..."
              value={state.fullEssay}
              onChange={e => setState({ ...state, fullEssay: e.target.value })}
            />
          </div>
        );

      case Step.EVALUATION:
        return evaluation ? <EvaluationReport result={evaluation} /> : null;

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case Step.INPUT_TOPIC: return state.topic.length > 2;
      case Step.INTERPRETATION: return state.interpretation.length > 5;
      case Step.OUTLINE: return Object.values(state.outline).every(v => (v as string).length > 0);
      case Step.SKELETON: return Object.values(state.skeleton).every(part => (part as SkeletonPart).purpose.length > 0);
      case Step.WRITING: return state.fullEssay.length > 50;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <StepIndicator currentStep={currentStep} />

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Main Column: Editor/Input */}
        <div className={`lg:col-span-2 ${currentStep === Step.EVALUATION ? 'lg:col-span-3' : ''}`}>
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-white/50 relative overflow-hidden">
            {renderRecap()}
            {renderStepContent()}

            {/* Actions Bar */}
            {currentStep !== Step.EVALUATION && (
              <div className="mt-12 flex items-center justify-between border-t pt-8">
                <button
                  onClick={handleBack}
                  disabled={currentStep === Step.INPUT_TOPIC}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    currentStep === Step.INPUT_TOPIC ? 'text-gray-300 pointer-events-none' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" /> 上一步
                </button>

                <div className="flex gap-4">
                  {currentStep !== Step.INPUT_TOPIC && (
                    <button
                      onClick={handleCheck}
                      disabled={loading || !isStepValid()}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5 text-indigo-500" />}
                      檢查進度
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={!isStepValid() || loading}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:grayscale"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        {currentStep === Step.WRITING ? '提交評分' : '下一步'}
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {currentStep === Step.EVALUATION && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => {
                    setCurrentStep(Step.WRITING);
                    setEvaluation(null);
                  }}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
                >
                  <RotateCcw className="w-6 h-6" /> 針對建議進行修正
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Coaching/Context */}
        {currentStep !== Step.EVALUATION && (
          <aside className="space-y-6">
            <GuidancePanel feedback={feedback} loading={loading} />
            
            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <h4 className="font-black text-gray-800 mb-4 text-sm uppercase tracking-widest">寫作進度狀態</h4>
              <div className="space-y-2">
                {[
                  { s: Step.INPUT_TOPIC, l: '題目設定', v: !!state.topic },
                  { s: Step.INTERPRETATION, l: '破題理解', v: !!state.interpretation },
                  { s: Step.OUTLINE, l: '結構大綱', v: !!state.outline.introduction },
                  { s: Step.SKELETON, l: '細節骨架', v: !!state.skeleton.introduction.purpose },
                  { s: Step.WRITING, l: '全文寫作', v: !!state.fullEssay },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1">
                    <span className={currentStep === item.s ? 'text-indigo-600 font-bold' : 'text-gray-500'}>{item.l}</span>
                    {item.v ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-gray-200" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <h4 className="font-black text-gray-800 mb-4 text-sm uppercase tracking-widest">會考評分錦囊</h4>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-xs font-bold text-gray-400 mb-1">立意取材</p>
                  <p className="text-sm text-gray-600">避免寫大家都會寫的內容，試著挖掘特別的觀察點。</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-xs font-bold text-gray-400 mb-1">結構組織</p>
                  <p className="text-sm text-gray-600">起承轉合要連貫，每一段都要有其存在的意義。</p>
                </div>
              </div>
            </div>
          </aside>
        )}
      </main>

      <footer className="py-6 text-center text-gray-400 text-xs">
        &copy; 2024 會考寫作 AI 教練 | 助力每一位考生的夢想
      </footer>
    </div>
  );
};

export default App;
