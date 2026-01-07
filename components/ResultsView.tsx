import React, { useState } from 'react';
import { ComparisonResult, AISettings } from '../types';
import { FileWarning, Database, Sparkles, ChevronLeft, Download } from 'lucide-react';
import { analyzeDiscrepancies } from '../services/geminiService';
import * as XLSX from 'xlsx';

interface ResultsViewProps {
  results: ComparisonResult;
  onReset: () => void;
  aiSettings: AISettings;
  onOpenSettings: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ results, onReset, aiSettings, onOpenSettings }) => {
  const [activeTab, setActiveTab] = useState<'sys1_only' | 'sys2_only'>('sys1_only');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const activeData = activeTab === 'sys1_only' ? results.inTqNotDdr : results.inDdrNotTq;
  const activeKey = activeTab === 'sys1_only' ? results.tqKey : results.ddrKey;
  const activeSysName = activeTab === 'sys1_only' ? results.sys1Name : results.sys2Name;
  const otherSysName = activeTab === 'sys1_only' ? results.sys2Name : results.sys1Name;

  const handleAnalyze = async () => {
    if (!aiSettings.apiKey && !process.env.API_KEY) {
        onOpenSettings();
        return;
    }

    setAnalyzing(true);
    const resultText = await analyzeDiscrepancies(results, aiSettings);
    setAnalysis(resultText);
    setAnalyzing(false);
  };

  const downloadReport = () => {
    const wb = XLSX.utils.book_new();
    
    if (results.inTqNotDdr.length > 0) {
      const ws1 = XLSX.utils.json_to_sheet(results.inTqNotDdr);
      XLSX.utils.book_append_sheet(wb, ws1, `仅 ${results.sys1Name} 有`);
    }
    
    if (results.inDdrNotTq.length > 0) {
      const ws2 = XLSX.utils.json_to_sheet(results.inDdrNotTq);
      XLSX.utils.book_append_sheet(wb, ws2, `仅 ${results.sys2Name} 有`);
    }

    XLSX.writeFile(wb, "资产比对报告.xlsx");
  };

  return (
    <div className="space-y-6">
      
      {/* Header Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <button 
          onClick={() => setActiveTab('sys1_only')}
          className={`p-6 rounded-xl border-2 transition-all text-left relative overflow-hidden group ${
            activeTab === 'sys1_only' ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-white bg-white hover:border-orange-200'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <Database size={24} />
            </div>
            <span className="text-2xl font-bold text-slate-800">{results.inTqNotDdr.length}</span>
          </div>
          <h3 className="font-semibold text-slate-700">仅在 {results.sys1Name} 中</h3>
          <p className="text-sm text-slate-500">{results.sys2Name} 系统中缺失</p>
        </button>

        <button 
          onClick={() => setActiveTab('sys2_only')}
          className={`p-6 rounded-xl border-2 transition-all text-left relative overflow-hidden group ${
            activeTab === 'sys2_only' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-white bg-white hover:border-blue-200'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <FileWarning size={24} />
            </div>
            <span className="text-2xl font-bold text-slate-800">{results.inDdrNotTq.length}</span>
          </div>
          <h3 className="font-semibold text-slate-700">仅在 {results.sys2Name} 中</h3>
          <p className="text-sm text-slate-500">{results.sys1Name} 系统中缺失</p>
        </button>
      </div>

      {/* AI Analysis Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white">
          <div className="flex items-center gap-2 text-purple-700 font-semibold">
            <Sparkles size={20} />
            AI 智能分析
          </div>
          {!analysis && (
            <button 
              onClick={handleAnalyze}
              disabled={analyzing}
              className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-md hover:bg-purple-700 transition disabled:opacity-50"
            >
              {analyzing ? '分析中...' : '分析差异模式'}
            </button>
          )}
        </div>
        {analysis && (
          <div className="p-6 bg-slate-50 text-slate-700 text-sm leading-relaxed whitespace-pre-line">
            {analysis}
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">
            在 {activeSysName} 中发现的资产（{otherSysName} 缺失）
          </h3>
          <div className="flex gap-2">
            <button 
                onClick={downloadReport}
                className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 border border-slate-300 rounded-md hover:bg-slate-50"
            >
                <Download size={16} /> 导出 Excel
            </button>
            <button 
                onClick={onReset}
                className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 border border-slate-300 rounded-md hover:bg-slate-50"
            >
                <ChevronLeft size={16} /> 新建比对
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto flex-1 p-4">
          {activeData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <CheckCircleIcon size={48} className="mb-4 text-green-500 opacity-50" />
              <p>此分类下未发现差异。</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">匹配键值 ({activeKey})</th>
                  {Object.keys(activeData[0] || {}).filter(k => k !== activeKey).slice(0, 5).map(header => (
                    <th key={header} className="px-4 py-3">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeData.slice(0, 100).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-indigo-600">{row[activeKey]}</td>
                    {Object.keys(row).filter(k => k !== activeKey).slice(0, 5).map(key => (
                      <td key={key} className="px-4 py-3 text-slate-600 truncate max-w-[200px]">{String(row[key])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeData.length > 100 && (
            <div className="text-center p-4 text-xs text-slate-400 border-t border-slate-100">
              仅显示前 100 行。请导出以查看完整详情。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CheckCircleIcon = ({size, className}: {size: number, className: string}) => (
    <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);