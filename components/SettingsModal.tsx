import React, { useState, useEffect } from 'react';
import { X, Save, Key, Globe } from 'lucide-react';
import { AISettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AISettings) => void;
  initialSettings: AISettings;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialSettings }) => {
  const [apiKey, setApiKey] = useState(initialSettings.apiKey);
  const [baseUrl, setBaseUrl] = useState(initialSettings.baseUrl);

  // Reset local state when modal opens with new initial settings
  useEffect(() => {
    if (isOpen) {
      setApiKey(initialSettings.apiKey);
      setBaseUrl(initialSettings.baseUrl);
    }
  }, [isOpen, initialSettings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ apiKey, baseUrl });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">AI 设置</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Key size={16} className="text-indigo-500" />
              API Key (密钥)
            </label>
            <input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="输入您的 Gemini API Key"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
            <p className="text-xs text-slate-500 mt-1">
              您的密钥仅存储在本地浏览器中。
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Globe size={16} className="text-indigo-500" />
              API Base URL (接口地址)
            </label>
            <input 
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="默认: https://generativelanguage.googleapis.com"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
             <p className="text-xs text-slate-500 mt-1">
              如果您使用代理或中转服务，请在此输入地址。
            </p>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Save size={18} />
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
};