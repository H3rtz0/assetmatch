import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ComparisonConfig } from './components/ComparisonConfig';
import { ResultsView } from './components/ResultsView';
import { SettingsModal } from './components/SettingsModal';
import { FileData, ComparisonResult, Step, AISettings } from './types';
import { ArrowRight, Layers, Settings } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState<Step>(Step.UPLOAD);
  
  // Custom System Names
  const [sys1Name, setSys1Name] = useState<string>("系统 A");
  const [sys2Name, setSys2Name] = useState<string>("系统 B");

  // AI Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiSettings, setAiSettings] = useState<AISettings>({
    apiKey: '',
    baseUrl: ''
  });

  // Load settings from local storage
  useEffect(() => {
    const saved = localStorage.getItem('assetmatch_ai_settings');
    if (saved) {
      try {
        setAiSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  const handleSaveSettings = (settings: AISettings) => {
    setAiSettings(settings);
    localStorage.setItem('assetmatch_ai_settings', JSON.stringify(settings));
  };

  const [tqFile, setTqFile] = useState<FileData | null>(null);
  const [ddrFile, setDdrFile] = useState<FileData | null>(null);
  const [results, setResults] = useState<ComparisonResult | null>(null);

  const handleComparison = (tqKey: string, ddrKey: string) => {
    if (!tqFile || !ddrFile) return;

    // Normalization helper (handle numbers vs strings, trimming)
    const normalize = (val: any) => String(val).trim().toLowerCase();

    // Create lookup set for DDR
    const ddrSet = new Set(ddrFile.data.map(row => normalize(row[ddrKey])));
    
    // Create lookup set for TQ
    const tqSet = new Set(tqFile.data.map(row => normalize(row[tqKey])));

    // Find items in TQ but not in DDR
    const inTqNotDdr = tqFile.data.filter(row => !ddrSet.has(normalize(row[tqKey])));

    // Find items in DDR but not in TQ
    const inDdrNotTq = ddrFile.data.filter(row => !tqSet.has(normalize(row[ddrKey])));

    setResults({
      inTqNotDdr,
      inDdrNotTq,
      tqKey,
      ddrKey,
      sys1Name,
      sys2Name
    });

    setStep(Step.RESULTS);
  };

  const handleReset = () => {
    setStep(Step.UPLOAD);
    setTqFile(null);
    setDdrFile(null);
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Layers size={20} />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800">AssetMatch <span className="text-indigo-600">Pro</span></h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-500">
              <span className={step === Step.UPLOAD ? "text-indigo-600" : ""}>1. 上传文件</span>
              <ArrowRight size={14} />
              <span className={step === Step.CONFIGURE ? "text-indigo-600" : ""}>2. 配置字段</span>
              <ArrowRight size={14} />
              <span className={step === Step.RESULTS ? "text-indigo-600" : ""}>3. 查看结果</span>
            </div>
            
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="设置 AI API"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {step === Step.UPLOAD && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">导入资产数据</h2>
              <p className="text-slate-500">分别上传两个系统的导出文件，您可以点击下方的标题重命名系统名称。</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 h-[400px]">
              <FileUpload 
                systemName={sys1Name}
                onNameChange={setSys1Name}
                currentFile={tqFile} 
                onDataLoaded={setTqFile} 
              />
              <FileUpload 
                systemName={sys2Name}
                onNameChange={setSys2Name}
                currentFile={ddrFile} 
                onDataLoaded={setDdrFile} 
              />
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setStep(Step.CONFIGURE)}
                disabled={!tqFile || !ddrFile}
                className={`px-8 py-3 rounded-full font-bold text-lg transition-all shadow-lg ${
                  tqFile && ddrFile 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                继续配置
              </button>
            </div>
          </div>
        )}

        {step === Step.CONFIGURE && tqFile && ddrFile && (
          <div className="animate-fade-in">
             <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">字段映射</h2>
              <p className="text-slate-500">选择包含唯一序列号或资产标签的列。</p>
            </div>
            <ComparisonConfig 
              tqFile={tqFile} 
              ddrFile={ddrFile} 
              sys1Name={sys1Name}
              sys2Name={sys2Name}
              onCompare={handleComparison} 
            />
             <div className="mt-4 text-center">
               <button onClick={() => setStep(Step.UPLOAD)} className="text-sm text-slate-500 hover:text-indigo-600">
                  返回上传
               </button>
             </div>
          </div>
        )}

        {step === Step.RESULTS && results && (
          <div className="animate-fade-in">
            <ResultsView 
              results={results} 
              onReset={handleReset} 
              aiSettings={aiSettings}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </div>
        )}
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSave={handleSaveSettings}
        initialSettings={aiSettings}
      />
    </div>
  );
}