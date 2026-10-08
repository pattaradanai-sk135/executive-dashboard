// src/lib/google-sheets.ts
import { Project } from '@/types/project';

const SHEET_ID = '1p75chueCv9D2nr26efnqdV8-lzt2SNt0jcA3uXwJfBk';
const DETAIL_SCORE_GID = '2035310313'; // ชีทที่ 5 (คะแนนย่อย Pop-up Col D-Y)

export const SHEETS_CONFIG = [
  { id: 'tab1', name: 'คะแนนรวมทุกโครงการ', gid: 'all' },
  { id: 'tab2', name: 'แผนงานที่ 1', gid: '1817361921' },
  { id: 'tab3', name: 'แผนงานที่ 2', gid: '1104895575' },
  { id: 'tab4', name: 'แผนงานที่ 3', gid: '555316467' },
];

export async function fetchProjectsFromSheetByGid(gid: string): Promise<Project[]> {
  let detailData = { byNameMap: new Map(), byIndexList: [] as { title: string; score: number }[][] };
  
  try {
    detailData = await fetchDetailScoresData();
  } catch (err) {
    console.error('Failed to fetch detail scores from Sheet 5:', err);
  }

  if (gid === 'all') {
    const targetGids = SHEETS_CONFIG.filter((s) => s.gid !== 'all').map((s) => s.gid);
    const results = await Promise.all(targetGids.map((g) => fetchSingleSheet(g, detailData)));
    const flatResults = results.flat();
    console.log(`[DEBUG] Total projects fetched for ALL: ${flatResults.length}`);
    return flatResults;
  }

  const result = await fetchSingleSheet(gid, detailData);
  console.log(`[DEBUG] Total projects fetched for GID ${gid}: ${result.length}`);
  return result;
}

function cleanText(text: string): string {
  return text ? text.replace(/\s+/g, '').toLowerCase() : '';
}

function parseScoreValue(val: any): number {
  if (val === undefined || val === null) return 0;
  const str = String(val).replace(/,/g, '').replace(/[^\d.-]/g, '').trim();
  const num = parseFloat(str);
  return !isNaN(num) ? num : 0;
}

// ----------------------------------------------------
// ชีท 1-4: ดึงคะแนนรวมจาก Column C (Index 2)
// ----------------------------------------------------
async function fetchSingleSheet(
  gid: string,
  detailData: { byNameMap: Map<string, { title: string; score: number }[]>; byIndexList: { title: string; score: number }[][] }
): Promise<Project[]> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${gid}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      console.error(`[ERROR] Fetch failed for GID ${gid}: ${response.statusText}`);
      return [];
    }

    const csvText = await response.text();
    const rows = parseRobustCSV(csvText);
    if (rows.length < 2) {
      console.warn(`[WARN] No data rows found in GID ${gid}`);
      return [];
    }

    const projects: Project[] = [];

    rows.slice(1).forEach((row, index) => {
      // เอาชื่อโครงการจาก Col B (Index 1) หรือ Col A (Index 0)
      const projectName = row[1]?.trim() || row[0]?.trim() || '';
      
      // ข้ามแถวที่ไม่ใช่ชื่อโครงการจริง
      if (!projectName || projectName.includes('คะแนนรวม') || projectName.includes('เกณฑ์') || projectName.includes('หัวข้อ')) return;

      // คะแนนรวมหลักเอาเฉพาะ Column C (Index 2)
      const scoreNum = parseScoreValue(row[2]); 
      const cleanedName = cleanText(projectName);

      // ดึงคะแนนย่อยจากชีท 5
      let scoreBreakdown = detailData.byNameMap.get(cleanedName);

      if (!scoreBreakdown || scoreBreakdown.length === 0) {
        for (const [key, value] of detailData.byNameMap.entries()) {
          if (key && (key.includes(cleanedName) || cleanedName.includes(key))) {
            scoreBreakdown = value;
            break;
          }
        }
      }

      if (!scoreBreakdown || scoreBreakdown.length === 0) {
        scoreBreakdown = detailData.byIndexList[index] || [];
      }

      projects.push({
        id: row[0]?.trim() || `proj-${gid}-${index}`,
        name: projectName,
        score: scoreNum,
        scoreBreakdown: Array.isArray(scoreBreakdown) ? scoreBreakdown : [],
      });
    });

    return projects;
  } catch (error) {
    console.error(`[CRITICAL] Error in fetchSingleSheet GID ${gid}:`, error);
    return [];
  }
}

// ----------------------------------------------------
// ชีท 5 (Pop-up): ดึงคะแนนย่อยจาก Column D ถึง Y (Index 3 ถึง 24)
// ----------------------------------------------------
async function fetchDetailScoresData() {
  const byNameMap = new Map<string, { title: string; score: number }[]>();
  const byIndexList: { title: string; score: number }[][] = [];

  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${DETAIL_SCORE_GID}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return { byNameMap, byIndexList };

    const csvText = await response.text();
    const rows = parseRobustCSV(csvText);
    if (rows.length < 2) return { byNameMap, byIndexList };

    // สแกนชื่อ Header จาก Column D (Index 3) ถึง Column Y (Index 24)
    const headers: string[] = [];
    for (let colIdx = 3; colIdx <= 24; colIdx++) {
      let headerTitle = '';
      for (let r = 0; r < Math.min(5, rows.length); r++) {
        const val = rows[r]?.[colIdx]?.trim();
        if (val && isNaN(parseFloat(val)) && val !== '-' && !val.includes('คะแนนเต็ม')) {
          headerTitle = val;
          break;
        }
      }
      headers[colIdx] = headerTitle || `หัวข้อที่ ${colIdx - 2}`;
    }

    rows.forEach((row) => {
      const nameCandidate = row[1]?.trim() || row[0]?.trim() || '';

      let hasValidScore = false;
      for (let colIdx = 3; colIdx <= 24; colIdx++) {
        if (row[colIdx] && !isNaN(parseFloat(row[colIdx].replace(/,/g, '')))) {
          hasValidScore = true;
          break;
        }
      }

      if (!hasValidScore) return;

      const mergedMap = new Map<string, number>();

      for (let colIdx = 3; colIdx <= 24; colIdx++) {
        const title = headers[colIdx];
        const scoreVal = parseScoreValue(row[colIdx]);

        if (title) {
          const currentScore = mergedMap.get(title) || 0;
          mergedMap.set(title, Math.round((currentScore + scoreVal) * 100) / 100);
        }
      }

      const breakdown = Array.from(mergedMap.entries()).map(([title, score]) => ({
        title: String(title),
        score: Number(score) || 0,
      }));

      if (breakdown.length > 0) {
        if (nameCandidate) {
          byNameMap.set(cleanText(nameCandidate), breakdown);
        }
        byIndexList.push(breakdown);
      }
    });
  } catch (error) {
    console.error('[ERROR] Error in fetchDetailScoresData:', error);
  }

  return { byNameMap, byIndexList };
}

function parseRobustCSV(text: string): string[][] {
  if (!text) return [];
  const result: string[][] = [];
  let row: string[] = [];
  let currCell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const nextC = text[i + 1];

    if (c === '"') {
      if (inQuotes && nextC === '"') {
        currCell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push(currCell.trim());
      currCell = '';
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && nextC === '\n') {
        i++;
      }
      row.push(currCell.trim());
      if (row.some((cell) => cell !== '')) {
        result.push(row);
      }
      row = [];
      currCell = '';
    } else {
      currCell += c;
    }
  }

  if (currCell || row.length > 0) {
    row.push(currCell.trim());
    if (row.some((cell) => cell !== '')) {
      result.push(row);
    }
  }

  return result;
}