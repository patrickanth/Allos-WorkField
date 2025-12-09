import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const MAPS_FILE = path.join(DATA_DIR, 'project-maps.json');

interface ProjectNode {
  id: string;
  title: string;
  description: string;
  type: 'core' | 'module' | 'task' | 'milestone' | 'resource';
  status: 'planning' | 'active' | 'completed' | 'blocked';
  x: number;
  y: number;
  connections: string[];
  color: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
}

interface ProjectMap {
  id: string;
  name: string;
  description: string;
  nodes: ProjectNode[];
  createdAt: string;
  updatedAt: string;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getMaps(): ProjectMap[] {
  ensureDataDir();
  if (!fs.existsSync(MAPS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(MAPS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveMaps(maps: ProjectMap[]) {
  ensureDataDir();
  fs.writeFileSync(MAPS_FILE, JSON.stringify(maps, null, 2));
}

// GET - Fetch all project maps
export async function GET() {
  try {
    const maps = getMaps();
    return NextResponse.json({ maps });
  } catch (error) {
    console.error('Error fetching project maps:', error);
    return NextResponse.json({ error: 'Failed to fetch maps' }, { status: 500 });
  }
}

// POST - Create or update a project map
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const maps = getMaps();

    const existingIndex = maps.findIndex(m => m.id === body.id);

    if (existingIndex >= 0) {
      // Update existing map
      maps[existingIndex] = {
        ...maps[existingIndex],
        ...body,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Create new map
      maps.push({
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    saveMaps(maps);

    return NextResponse.json({ success: true, map: body });
  } catch (error) {
    console.error('Error saving project map:', error);
    return NextResponse.json({ error: 'Failed to save map' }, { status: 500 });
  }
}

// DELETE - Delete a project map
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mapId = searchParams.get('id');

    if (!mapId) {
      return NextResponse.json({ error: 'Map ID required' }, { status: 400 });
    }

    const maps = getMaps();
    const filteredMaps = maps.filter(m => m.id !== mapId);
    saveMaps(filteredMaps);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project map:', error);
    return NextResponse.json({ error: 'Failed to delete map' }, { status: 500 });
  }
}
