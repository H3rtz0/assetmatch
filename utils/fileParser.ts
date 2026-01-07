import * as XLSX from 'xlsx';
import { FileData, AssetRow } from '../types';

export const parseFile = async (file: File): Promise<FileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("File is empty");

        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Parse to JSON
        const jsonData = XLSX.utils.sheet_to_json<AssetRow>(worksheet, { defval: "" });

        if (jsonData.length === 0) {
           resolve({
            fileName: file.name,
            columns: [],
            data: [],
          });
          return;
        }

        // Extract headers from the first row keys
        const columns = Object.keys(jsonData[0]);

        resolve({
          fileName: file.name,
          columns,
          data: jsonData,
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};