
export enum Step {
  INPUT_TOPIC = 0,
  INTERPRETATION = 1,
  OUTLINE = 2,
  SKELETON = 3,
  WRITING = 4,
  EVALUATION = 5
}

export interface SkeletonPart {
  purpose: string;
  keyIdea: string;
  exampleType: string;
  goldenSentenceType: string;
}

export interface WritingState {
  topic: string;
  interpretation: string;
  outline: {
    introduction: string; // 起
    development: string;  // 承
    transition: string;   // 轉
    conclusion: string;   // 合
  };
  skeleton: {
    introduction: SkeletonPart;
    development: SkeletonPart;
    transition: SkeletonPart;
    conclusion: SkeletonPart;
  };
  fullEssay: string;
}

export interface Feedback {
  status: 'success' | 'warning' | 'info';
  message: string;
  suggestions: string[];
}

export interface EvaluationResult {
  dimensionScores: {
    meaning: number;      // 立意取材
    structure: number;    // 結構組織
    vocabulary: number;   // 遣詞造句
    grammar: number;      // 錯別字與標點
  };
  dimensionComments: {
    meaning: string;
    structure: string;
    vocabulary: string;
    grammar: string;
  };
  overallLevel: number;
  gradeBand: 'A' | 'B' | 'C';
  strengths: string[];
  weaknesses: string[];
  revisionTips: string[];
}
