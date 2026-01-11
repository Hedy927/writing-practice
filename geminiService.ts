
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "./constants";
import { Feedback, EvaluationResult, WritingState, SkeletonPart } from "./types";

/**
 * Gets feedback for a specific step in the writing process.
 */
export const getStepFeedback = async (stepName: string, context: string, topic: string): Promise<Feedback> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      題目：${topic}
      學生目前的${stepName}內容：${context}
      
      請以寫作教練的身分，分析學生的輸入是否符合邏輯，是否偏題。
      如果是「破題引導」，請檢查是否準確理解題目核心。
      如果是「大綱」，請檢查起承轉合的連貫性。
      請給予具體的回饋與三點修正建議。
    `,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING, description: "success, warning, or info" },
          message: { type: Type.STRING, description: "主要評語" },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "具體的修正建議"
          }
        },
        required: ["status", "message", "suggestions"]
      }
    }
  });

  try {
    const text = response.text.trim();
    return JSON.parse(text) as Feedback;
  } catch (e) {
    return { status: 'info', message: "目前無法解析分析結果，請根據目前內容繼續嘗試。", suggestions: [] };
  }
};

/**
 * Generates skeleton suggestions based on the topic and outline.
 */
export const generateSkeletonSuggestions = async (topic: string, outline: WritingState['outline']): Promise<WritingState['skeleton']> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      題目：${topic}
      大綱：
      起：${outline.introduction}
      承：${outline.development}
      轉：${outline.transition}
      合：${outline.conclusion}
      
      請針對以上大綱，為每一段產生「段落目的」、「核心想法」、「建議例證類型」、「金句類型建議」。
    `,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          introduction: {
            type: Type.OBJECT,
            properties: {
              purpose: { type: Type.STRING },
              keyIdea: { type: Type.STRING },
              exampleType: { type: Type.STRING },
              goldenSentenceType: { type: Type.STRING }
            },
            required: ["purpose", "keyIdea", "exampleType", "goldenSentenceType"]
          },
          development: {
            type: Type.OBJECT,
            properties: {
              purpose: { type: Type.STRING },
              keyIdea: { type: Type.STRING },
              exampleType: { type: Type.STRING },
              goldenSentenceType: { type: Type.STRING }
            },
            required: ["purpose", "keyIdea", "exampleType", "goldenSentenceType"]
          },
          transition: {
            type: Type.OBJECT,
            properties: {
              purpose: { type: Type.STRING },
              keyIdea: { type: Type.STRING },
              exampleType: { type: Type.STRING },
              goldenSentenceType: { type: Type.STRING }
            },
            required: ["purpose", "keyIdea", "exampleType", "goldenSentenceType"]
          },
          conclusion: {
            type: Type.OBJECT,
            properties: {
              purpose: { type: Type.STRING },
              keyIdea: { type: Type.STRING },
              exampleType: { type: Type.STRING },
              goldenSentenceType: { type: Type.STRING }
            },
            required: ["purpose", "keyIdea", "exampleType", "goldenSentenceType"]
          }
        },
        required: ["introduction", "development", "transition", "conclusion"]
      }
    }
  });

  return JSON.parse(response.text.trim());
};

/**
 * Evaluates the full essay based on CAP (國中會考) standards.
 */
export const evaluateEssay = async (state: WritingState): Promise<EvaluationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `
      題目：${state.topic}
      學生全文：${state.fullEssay}
      大綱參考：${JSON.stringify(state.outline)}
      骨架參考：${JSON.stringify(state.skeleton)}
      
      請根據國中會考標準評分。
      1. 立意取材 (1-6分)
      2. 結構組織 (1-6分)
      3. 遣詞造句 (1-6分)
      4. 錯別字與標點 (1-6分)
      總結級分 (1-6分)。
    `,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dimensionScores: {
            type: Type.OBJECT,
            properties: {
              meaning: { type: Type.NUMBER },
              structure: { type: Type.NUMBER },
              vocabulary: { type: Type.NUMBER },
              grammar: { type: Type.NUMBER }
            },
            required: ["meaning", "structure", "vocabulary", "grammar"]
          },
          dimensionComments: {
            type: Type.OBJECT,
            properties: {
              meaning: { type: Type.STRING },
              structure: { type: Type.STRING },
              vocabulary: { type: Type.STRING },
              grammar: { type: Type.STRING }
            },
            required: ["meaning", "structure", "vocabulary", "grammar"]
          },
          overallLevel: { type: Type.NUMBER },
          gradeBand: { type: Type.STRING, description: "A, B, or C" },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          revisionTips: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: [
          "dimensionScores", 
          "dimensionComments", 
          "overallLevel", 
          "gradeBand", 
          "strengths", 
          "weaknesses", 
          "revisionTips"
        ]
      }
    }
  });

  try {
    const text = response.text.trim();
    return JSON.parse(text) as EvaluationResult;
  } catch (e) {
    throw new Error("評分分析失敗，AI 回傳格式有誤，請稍後再試。");
  }
};
