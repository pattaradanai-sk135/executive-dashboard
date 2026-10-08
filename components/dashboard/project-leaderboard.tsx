// src/components/dashboard/project-leaderboard.tsx
'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  LabelList,
} from 'recharts';
import { Project } from '@/types/project';

interface ProjectLeaderboardProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

const getScoreColor = (score: number) => {
  if (score >= 70) return '#00ffaa'; // เขียว
  if (score >= 0) return '#ff0000'; // ฟ้า
  
  return '#EF4444'; // แดง
};

export const ProjectLeaderboard: React.FC<ProjectLeaderboardProps> = ({
  projects,
  onSelectProject,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 🎯 กำหนดความสูงต่อ 1 แถวแบบเน้นๆ (35px ต่อโครงการ)
  const rowHeight = 35;
  const chartHeight = Math.max(400, projects.length * rowHeight);

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            อันดับคะแนนประเมินโครงการ (Project Performance Ranking)
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            คลิกที่แท่งกราฟเพื่อดูรายละเอียดเชิงลึกของแต่ละโครงการ
          </p>
        </div>
      </div>

      {/* Container ยอมให้ขยายความสูงตามความจริงได้เต็มที่ */}
      <div className="w-full overflow-x-auto">
        <BarChart
          width={800} // จะขยายตามความกว้างพื้นที่
          height={chartHeight} // 🎯 บังคับความสูงจริงของกราฟตามจำนวนโครงการ x 80px
          data={projects}
          layout="vertical"
          margin={{ top: 10, right: 40, left: 20, bottom: 10 }}
          style={{ width: '100%' }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E4E4E7" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: '#71717A', fontSize: 13, fontWeight: 500 }}
            orientation="top"
          />
          <YAxis
            type="category"
            dataKey="name"
            width={260}
            interval={0}
            tick={{ fill: '#27272A', fontSize: 14, fontWeight: 400 }} // ตัวอักษรปกติ ไม่หนา
          />
          <Tooltip
            cursor={{ fill: 'rgba(244, 244, 245, 0.6)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as Project;
                return (
                  <div className="bg-zinc-900 text-white p-3.5 rounded-xl shadow-xl text-xs space-y-1">
                    <p className="font-semibold text-sm text-zinc-100">{data.name}</p>
                    <p className="text-emerald-400 font-bold text-sm">
                      คะแนน: {data.score} / 100
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="score"
            radius={[0, 8, 8, 0]}
            barSize={22} // ล็อกความหนาแท่งกราฟ ให้คงที่
            onClick={(entry) => onSelectProject(entry as unknown as Project)}
            className="cursor-pointer"
          >
            <LabelList
              dataKey="score"
              position="insideRight"
              fill="#FFFFFF"
              fontSize={12}
              fontWeight={600}
              dx={-8}
            />
            {projects.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getScoreColor(entry.score)}
                opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.45}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            ))}
          </Bar>
        </BarChart>
      </div>
    </div>
  );
};