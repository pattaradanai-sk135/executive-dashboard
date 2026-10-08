// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { SHEETS_CONFIG } from '@/lib/google-sheets';
import { ProjectLeaderboard } from '@/components/dashboard/project-leaderboard';
import { ProjectDetailModal } from '@/components/dashboard/project-detail-modal';

export default function DashboardPage() {
  const [selectedGid, setSelectedGid] = useState<string>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const fetchProjects = async (gid: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects?gid=${gid}`);
      const data = await res.json();
      console.log('Fetched projects in UI:', data);
      
      if (Array.isArray(data)) {
        // เรียงลำดับคะแนนจากมากไปน้อย (Descending Order)
        const sortedData = [...data].sort((a, b) => (b.score || 0) - (a.score || 0));
        setProjects(sortedData);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching UI projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(selectedGid);
  }, [selectedGid]);

  // คำนวณภาพรวม
  const totalProjects = projects.length;
  const avgScore = totalProjects > 0 
    ? (projects.reduce((acc, p) => acc + (p.score || 0), 0) / totalProjects).toFixed(1)
    : '0.0';
  
  const topProject = projects.length > 0 
    ? [...projects].sort((a, b) => b.score - a.score)[0]
    : null;

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Refresh */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              สรุปภาพรวมและผลการดำเนินงานโครงการ
            </h1>
            <p className="text-slate-500 mt-1">
              Executive Dashboard สำหรับการนำเสนอในที่ประชุม
            </p>
          </div>
          <button
            onClick={() => fetchProjects(selectedGid)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl transition text-sm font-medium self-start md:self-auto"
          >
            <span>🔄</span> อัปเดตข้อมูลจาก Google Sheets
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4 overflow-x-auto">
          <span className="text-sm font-medium text-slate-500 whitespace-nowrap mr-2">
            เลือกมุมมอง:
          </span>
          {SHEETS_CONFIG.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedGid(tab.gid)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                selectedGid === tab.gid
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm font-medium text-slate-500">โครงการทั้งหมด</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {loading ? '...' : `${totalProjects} โครงการ`}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm font-medium text-slate-500">คะแนนเฉลี่ยภาพรวม</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">
              {loading ? '...' : `${avgScore} / 100`}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm font-medium text-slate-500">โครงการอันดับสูงสุด</p>
            <p className="text-lg font-bold text-slate-900 mt-2 truncate">
              {loading ? '...' : (topProject ? topProject.name : '-')}
            </p>
            <p className="text-sm font-medium text-emerald-600 mt-1">
              {loading ? '' : (topProject ? `คะแนน ${topProject.score} คะแนน` : 'คะแนน 0 คะแนน')}
            </p>
          </div>
        </div>

        {/* Ranking List / Leaderboard */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              อันดับคะแนนประเมินโครงการ (Project Performance Ranking)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              คลิกที่แท่งกราฟหรือการ์ดเพื่อดูรายละเอียดคะแนนย่อยเชิงลึกของแต่ละโครงการ
            </p>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">กำลังโหลดข้อมูล...</div>
          ) : projects.length === 0 ? (
            <div className="py-12 text-center text-slate-400">ไม่พบข้อมูลโครงการ</div>
          ) : (
            <ProjectLeaderboard
              projects={projects}
              onSelectProject={(project) => setSelectedProject(project)}
            />
          )}
        </div>

        {/* Modal รายละเอียดคะแนนย่อย */}
        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </div>
    </main>
  );
}