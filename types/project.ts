// src/types/project.ts
export interface ScoreCategory {
  title: string;
  score: number;
  maxScore?: number;
}

export interface Project {
  id: string;
  name: string;
  score: number;
  category?: string;
  owner?: string;
  status?: string;
  budget?: number;
  description?: string;
  scoreBreakdown?: ScoreCategory[]; // 🎯 รายการคะแนนแยกตามหัวข้อ
}