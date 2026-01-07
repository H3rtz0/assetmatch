export interface AssetRow {
  [key: string]: any;
}

export interface FileData {
  fileName: string;
  columns: string[];
  data: AssetRow[];
}

export interface ComparisonResult {
  inTqNotDdr: AssetRow[]; // Logic maps TQ -> System 1
  inDdrNotTq: AssetRow[]; // Logic maps DDR -> System 2
  tqKey: string;
  ddrKey: string;
  sys1Name: string;
  sys2Name: string;
}

export interface AISettings {
  apiKey: string;
  baseUrl: string;
}

export enum Step {
  UPLOAD = 0,
  CONFIGURE = 1,
  RESULTS = 2,
}