import React from 'react';
import { ArrowRightLeft, Search } from 'lucide-react';
import { FileData } from '../types';

interface ComparisonConfigProps {
  tqFile: FileData;
  ddrFile: FileData;
  sys1Name: string;
  sys2Name: string;
  onCompare: (tqKey: string, ddrKey: string) => void;
}

export const ComparisonConfig: React.FC<ComparisonConfigProps> = ({ tqFile, ddrFile, sys1Name, sys2Name, onCompare }) => {
  const [tqKey, setTqKey] = React.useState<string>('');
  const [ddrKey, setDdrKey] = React.useState<string>('');

  // Attempt to auto-select keys if they match common names
  React.useEffect(() => {
    const commonKeys = ['sn', 'serial', 'serialno', 'serial number', 'assetid', 'asset tag', '序列号', '资产编号'];
    
    if (!tqKey) {
      const match = tqFile.columns.find(c => commonKeys.includes(c.toLowerCase()));
      if (match) setTqKey(match);
    }
    
    if (!ddrKey) {
      const match = ddrFile.columns.find(c => commonKeys.includes(c.toLowerCase()));
      if (match) setDdrKey(match);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tqFile, ddrFile]);

  const isValid = tqKey && ddrKey;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-indigo-600 p-6 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ArrowRightLeft /> 配置比对逻辑
        </h2>
        <p className="text-indigo-100 mt-1 opacity-90">请选择每个文件中用于匹配资产的唯一标识列（如序列号）。</p>
      </div>

      <div className="p-8 grid md:grid-cols-3 gap-8 items-center">
        
        {/* System 1 Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700">
            {sys1Name} ({tqFile.fileName}) 中的关键字段
          </label>
          <div className="relative">
            <select 
              className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
              value={tqKey}
              onChange={(e) => setTqKey(e.target.value)}
            >
              <option value="" disabled>选择列...</option>
              {tqFile.columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-500">通常是“序列号”或“资产标签”</p>
        </div>

        {/* Separator / Icon */}
        <div className="flex justify-center text-slate-300">
          <ArrowRightLeft size={32} strokeWidth={1.5} />
        </div>

        {/* System 2 Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700">
             {sys2Name} ({ddrFile.fileName}) 中的关键字段
          </label>
          <div className="relative">
            <select 
              className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
              value={ddrKey}
              onChange={(e) => setDdrKey(e.target.value)}
            >
              <option value="" disabled>选择列...</option>
              {ddrFile.columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
           <p className="text-xs text-slate-500">该列的值必须能与 {sys1Name} 关键字段匹配</p>
        </div>
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
        <button
          onClick={() => isValid && onCompare(tqKey, ddrKey)}
          disabled={!isValid}
          className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
            isValid 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transform hover:-translate-y-0.5' 
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Search size={20} />
          开始比对
        </button>
      </div>
    </div>
  );
};