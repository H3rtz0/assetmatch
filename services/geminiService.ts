import { GoogleGenAI } from "@google/genai";
import { ComparisonResult, AISettings } from "../types";

// Helper to format data for the prompt to avoid token limits
const formatSampleData = (data: any[], key: string): string => {
  // Take top 20 items as a sample
  const sample = data.slice(0, 20).map(item => JSON.stringify(item));
  return sample.join("\n");
};

export const analyzeDiscrepancies = async (
  result: ComparisonResult,
  settings?: AISettings
): Promise<string> => {
  // Priority: User Settings > Environment Variable
  const apiKey = settings?.apiKey || process.env.API_KEY;
  const baseUrl = settings?.baseUrl;

  if (!apiKey) {
    return "未配置 API Key，无法进行 AI 分析。请点击右上角设置图标进行配置。";
  }

  // Configure the client
  // Note: We cast the config object because types might be strict about baseUrl depending on version,
  // but standard Google clients support it.
  const clientConfig: any = { apiKey };
  if (baseUrl && baseUrl.trim() !== "") {
    clientConfig.baseUrl = baseUrl.trim();
  }

  try {
    const ai = new GoogleGenAI(clientConfig);

    const tqMissingCount = result.inTqNotDdr.length;
    const ddrMissingCount = result.inDdrNotTq.length;
    
    const tqSample = formatSampleData(result.inTqNotDdr, result.tqKey);
    const ddrSample = formatSampleData(result.inDdrNotTq, result.ddrKey);

    const prompt = `
      你是一位数据分析专家。我对比了两个资产表：${result.sys1Name} 和 ${result.sys2Name}。
      
      统计数据如下：
      - 在 ${result.sys1Name} 中存在但在 ${result.sys2Name} 中缺失的资产数：${tqMissingCount} 项。
      - 在 ${result.sys2Name} 中存在但在 ${result.sys1Name} 中缺失的资产数：${ddrMissingCount} 项。

      以下是仅在 ${result.sys1Name} 中发现（${result.sys2Name} 缺失）的样本数据：
      ${tqSample}

      以下是仅在 ${result.sys2Name} 中发现（${result.sys1Name} 缺失）的样本数据：
      ${ddrSample}

      请提供简要分析（请用中文回答）：
      1. 总结差异规模。
      2. 观察样本数据，找出可能解释为什么它们在另一个系统中缺失的常见模式（例如：特定部门、地点、旧型号、特定状态代码等）。
      3. 针对这些数据缺口提出潜在原因建议。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text || "未能生成分析结果。";
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    let errorMsg = "在使用 Gemini 分析数据时发生错误。";
    if (error.message) {
      errorMsg += ` (${error.message})`;
    }
    return errorMsg;
  }
};