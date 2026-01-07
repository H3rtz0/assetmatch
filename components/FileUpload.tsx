import React, { ChangeEvent } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Edit2 } from 'lucide-react';
import { parseFile } from '../utils/fileParser';
import { FileData } from '../types';

interface FileUploadProps {
  systemName: string;
  onNameChange: (name: string) => void;
  onDataLoaded: (data: FileData) => void;
  currentFile: FileData | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ systemName, onNameChange, onDataLoaded, currentFile }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      setError(null);
      try {
        const file = e.target.files[0];
        const result = await parseFile(file);
        onDataLoaded(result);
      } catch (err) {
        setError("文件解析失败。请确保上传的是有效的 Excel 或 CSV 文件。");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full transition-all hover:shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 rounded-lg ${currentFile ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
          <FileSpreadsheet size={24} />
        </div>
        <div className="flex-1 relative group">
          <label className="text-xs text-slate-400 font-medium absolute -top-3 left-0 bg-white px-1">系统名称</label>
          <div className="flex items-center">
             <input 
                type="text" 
                value={systemName}
                onChange={(e) => onNameChange(e.target.value)}
                className="font-bold text-lg text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none w-full transition-colors placeholder-slate-300"
                placeholder="输入系统名称"
            />
            <Edit2 size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {!currentFile ? (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {loading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mb-3 text-slate-400" />
                  <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">点击上传</span></p>
                  <p className="text-xs text-slate-400">支持 .XLSX, .CSV 格式</p>
                </>
              )}
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept=".xlsx,.xls,.csv" 
              onChange={handleFileChange}
              disabled={loading}
            />
          </label>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="font-medium text-slate-700 truncate" title={currentFile.fileName}>{currentFile.fileName}</p>
            <p className="text-sm text-slate-500 mt-1">已读取 {currentFile.data.length.toLocaleString()} 行数据</p>
            <label className="block mt-4 text-sm text-blue-600 hover:text-blue-800 cursor-pointer font-medium">
              替换文件
              <input 
                type="file" 
                className="hidden" 
                accept=".xlsx,.xls,.csv" 
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};