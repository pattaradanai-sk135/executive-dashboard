// src/components/dashboard/project-detail-modal.tsx
'use client';

import React from 'react';
import { X, Award, CheckCircle2 } from 'lucide-react';
import { Project } from '@/types/project';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
}) => {
  if (!project) return null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
    return 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden p-6 md:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ปุ่มปิด */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* หัวข้อโครงการ */}
        <div className="pr-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 mb-2">
            รายละเอียดผลการประเมิน
          </span>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
            {project.name}
          </h3>
        </div>

        {/* แสดงคะแนนรวมอย่างเดียว */}
        <div className={`p-5 rounded-2xl border flex items-center justify-between ${getScoreColor(project.score)}`}>
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider opacity-75">คะแนนประเมินรวม</p>
              <p className="text-3xl font-extrabold tracking-tight">{project.score} <span className="text-base font-normal opacity-70">/ 100</span></p>
            </div>
          </div>
        </div>

        {/* ส่วนแสดงคะแนนแยกรายหัวข้อ (Breakdown) */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            คะแนนแยกตามหัวข้อการประเมิน
          </h4>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {project.scoreBreakdown && project.scoreBreakdown.length > 0 ? (
              project.scoreBreakdown.map((item, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800"
                >
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {item.title}
                  </span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-700 px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-600 shadow-sm">
                    {item.score} {item.maxScore ? `/ ${item.maxScore}` : 'คะแนน'}
                  </span>
                </div>
              ))
            ) : (
              // กรณีถ้ายังไม่มีข้อมูลแยกหัวข้อส่งมา ให้ใช้ mock/ตัวอย่างแสดงผล
              <div className="text-center py-6 text-sm text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                ไม่มีข้อมูลการแยกคะแนนรายหัวข้อ
              </div>
            )}
          </div>
        </div>

        {/* ปุ่มปิดด้านล่าง */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 font-semibold rounded-xl transition-colors shadow-sm"
        >
          ปิดหน้าต่าง
        </button>
      </div>
    </div>
  );
};