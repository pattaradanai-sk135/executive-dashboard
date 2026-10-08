// app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { fetchProjectsFromSheetByGid } from '@/lib/google-sheets';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gid = searchParams.get('gid') || 'all';

  try {
    const projects = await fetchProjectsFromSheetByGid(gid);
    return NextResponse.json(projects);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json([], { status: 500 });
  }
}