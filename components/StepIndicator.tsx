
import React from 'react';
import { STEP_LABELS } from '../constants';
import { Step } from '../types';

interface Props {
  currentStep: Step;
}

const StepIndicator: React.FC<Props> = ({ currentStep }) => {
  return (
    <div className="w-full py-4 border-b bg-white sticky top-0 z-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {STEP_LABELS.map((label, index) => (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center flex-1">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  index <= currentStep ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index + 1}
              </div>
              <span className={`mt-1 text-[10px] md:text-xs font-medium ${
                index === currentStep ? 'text-indigo-600' : 'text-gray-400'
              }`}>
                {label}
              </span>
            </div>
            {index < STEP_LABELS.length - 1 && (
              <div className={`h-[2px] w-full flex-grow mx-1 md:mx-2 ${
                index < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
