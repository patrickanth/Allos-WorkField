'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

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

const nodeColors = {
  core: { bg: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/50', glow: 'shadow-cyan-500/30', text: 'text-cyan-400' },
  module: { bg: 'from-violet-500/20 to-violet-600/10', border: 'border-violet-500/50', glow: 'shadow-violet-500/30', text: 'text-violet-400' },
  task: { bg: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/50', glow: 'shadow-emerald-500/30', text: 'text-emerald-400' },
  milestone: { bg: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/50', glow: 'shadow-amber-500/30', text: 'text-amber-400' },
  resource: { bg: 'from-rose-500/20 to-rose-600/10', border: 'border-rose-500/50', glow: 'shadow-rose-500/30', text: 'text-rose-400' },
};

const statusColors = {
  planning: 'bg-blue-500',
  active: 'bg-green-500',
  completed: 'bg-emerald-500',
  blocked: 'bg-red-500',
};

const defaultNodes: ProjectNode[] = [
  {
    id: 'node-1',
    title: 'Core System',
    description: 'Nucleo principale del progetto',
    type: 'core',
    status: 'active',
    x: 400,
    y: 250,
    connections: ['node-2', 'node-3', 'node-4'],
    color: '#06b6d4',
    priority: 'critical',
    progress: 75,
  },
  {
    id: 'node-2',
    title: 'Frontend Module',
    description: 'Interfaccia utente React',
    type: 'module',
    status: 'active',
    x: 150,
    y: 100,
    connections: ['node-5'],
    color: '#8b5cf6',
    priority: 'high',
    progress: 60,
  },
  {
    id: 'node-3',
    title: 'Backend API',
    description: 'Server Node.js + Express',
    type: 'module',
    status: 'active',
    x: 650,
    y: 100,
    connections: ['node-6'],
    color: '#8b5cf6',
    priority: 'high',
    progress: 80,
  },
  {
    id: 'node-4',
    title: 'Database Layer',
    description: 'PostgreSQL + Redis cache',
    type: 'module',
    status: 'completed',
    x: 400,
    y: 450,
    connections: [],
    color: '#8b5cf6',
    priority: 'high',
    progress: 100,
  },
  {
    id: 'node-5',
    title: 'UI Components',
    description: 'Design system completo',
    type: 'task',
    status: 'planning',
    x: 50,
    y: 280,
    connections: [],
    color: '#10b981',
    priority: 'medium',
    progress: 25,
  },
  {
    id: 'node-6',
    title: 'Alpha Release',
    description: 'Prima release pubblica',
    type: 'milestone',
    status: 'planning',
    x: 750,
    y: 280,
    connections: [],
    color: '#f59e0b',
    priority: 'critical',
    progress: 0,
  },
];

export default function ProjectMapsPage() {
  const [maps, setMaps] = useState<ProjectMap[]>([]);
  const [activeMap, setActiveMap] = useState<ProjectMap | null>(null);
  const [nodes, setNodes] = useState<ProjectNode[]>(defaultNodes);
  const [selectedNode, setSelectedNode] = useState<ProjectNode | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [newNodeType, setNewNodeType] = useState<ProjectNode['type']>('task');
  const [showNewMapModal, setShowNewMapModal] = useState(false);
  const [newMapName, setNewMapName] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  // Load maps from API
  useEffect(() => {
    loadMaps();
  }, []);

  const loadMaps = async () => {
    try {
      const res = await fetch('/api/project-maps');
      if (res.ok) {
        const data = await res.json();
        setMaps(data.maps || []);
        if (data.maps?.length > 0) {
          setActiveMap(data.maps[0]);
          setNodes(data.maps[0].nodes || defaultNodes);
        }
      }
    } catch (error) {
      console.error('Error loading maps:', error);
    }
  };

  const saveMap = async () => {
    if (!activeMap) return;
    try {
      await fetch('/api/project-maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...activeMap, nodes }),
      });
    } catch (error) {
      console.error('Error saving map:', error);
    }
  };

  const createNewMap = async () => {
    if (!newMapName.trim()) return;
    const newMap: ProjectMap = {
      id: `map-${Date.now()}`,
      name: newMapName,
      description: '',
      nodes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await fetch('/api/project-maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMap),
      });
      setMaps([...maps, newMap]);
      setActiveMap(newMap);
      setNodes([]);
      setNewMapName('');
      setShowNewMapModal(false);
    } catch (error) {
      console.error('Error creating map:', error);
    }
  };

  // Mouse tracking for sci-fi effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleNodeDragStart = (nodeId: string, e: React.MouseEvent) => {
    if (connectingFrom) {
      // Complete connection
      if (connectingFrom !== nodeId) {
        setNodes(nodes.map(n =>
          n.id === connectingFrom
            ? { ...n, connections: [...n.connections, nodeId] }
            : n
        ));
      }
      setConnectingFrom(null);
      return;
    }
    e.stopPropagation();
    setDraggingNode(nodeId);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      setNodes(nodes.map(n => n.id === draggingNode ? { ...n, x, y } : n));
    }
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPan({ x: pan.x + dx, y: pan.y + dy });
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseUp = () => {
    if (draggingNode) {
      saveMap();
    }
    setDraggingNode(null);
    setIsPanning(false);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isCreatingNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;

      const newNode: ProjectNode = {
        id: `node-${Date.now()}`,
        title: 'Nuovo Nodo',
        description: 'Clicca per modificare',
        type: newNodeType,
        status: 'planning',
        x,
        y,
        connections: [],
        color: nodeColors[newNodeType].text,
        priority: 'medium',
        progress: 0,
      };
      setNodes([...nodes, newNode]);
      setIsCreatingNode(false);
      setSelectedNode(newNode);
    } else {
      setSelectedNode(null);
      setConnectingFrom(null);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(Math.min(Math.max(zoom * delta, 0.3), 3));
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId).map(n => ({
      ...n,
      connections: n.connections.filter(c => c !== nodeId)
    })));
    setSelectedNode(null);
    saveMap();
  };

  const updateNode = (nodeId: string, updates: Partial<ProjectNode>) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n));
  };

  const startConnection = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConnectingFrom(nodeId);
  };

  // Render connection lines
  const renderConnections = () => {
    return nodes.flatMap(node =>
      node.connections.map(targetId => {
        const target = nodes.find(n => n.id === targetId);
        if (!target) return null;

        const colors = nodeColors[node.type];

        return (
          <svg
            key={`${node.id}-${targetId}`}
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%' }}
          >
            <defs>
              <linearGradient id={`gradient-${node.id}-${targetId}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={node.color} stopOpacity="0.8" />
                <stop offset="50%" stopColor="#fff" stopOpacity="0.3" />
                <stop offset="100%" stopColor={target.color || node.color} stopOpacity="0.8" />
              </linearGradient>
              <filter id={`glow-${node.id}`}>
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <line
              x1={node.x + 100}
              y1={node.y + 40}
              x2={target.x + 100}
              y2={target.y + 40}
              stroke={`url(#gradient-${node.id}-${targetId})`}
              strokeWidth="2"
              filter={`url(#glow-${node.id})`}
              className="animate-pulse"
            />
            {/* Animated particle */}
            <circle r="4" fill={node.color} filter={`url(#glow-${node.id})`}>
              <animateMotion
                dur="3s"
                repeatCount="indefinite"
                path={`M${node.x + 100},${node.y + 40} L${target.x + 100},${target.y + 40}`}
              />
            </circle>
          </svg>
        );
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#030308] relative overflow-hidden">
      {/* Animated Grid Background */}
      {showGrid && (
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              transform: `translate(${pan.x % 50}px, ${pan.y % 50}px)`,
            }}
          />
          {/* Scanlines */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
            }}
          />
        </div>
      )}

      {/* Glow effect following mouse */}
      <div
        className="absolute w-96 h-96 rounded-full pointer-events-none transition-all duration-300 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
          left: mousePos.x - 192,
          top: mousePos.y - 192,
        }}
      />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 opacity-30 blur animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">PROJECT MAPS</h1>
                <p className="text-[10px] text-cyan-400/60 font-mono tracking-widest">NEURAL NETWORK PLANNER v2.0</p>
              </div>
            </div>

            {/* Map Selector */}
            <div className="flex items-center gap-2 ml-8">
              <select
                className="bg-white/5 border border-cyan-500/30 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 backdrop-blur-xl"
                value={activeMap?.id || ''}
                onChange={(e) => {
                  const map = maps.find(m => m.id === e.target.value);
                  if (map) {
                    setActiveMap(map);
                    setNodes(map.nodes || []);
                  }
                }}
              >
                <option value="">Seleziona Mappa</option>
                {maps.map(map => (
                  <option key={map.id} value={map.id}>{map.name}</option>
                ))}
              </select>
              <button
                onClick={() => setShowNewMapModal(true)}
                className="p-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1 backdrop-blur-xl">
              <button
                onClick={() => setZoom(Math.max(zoom - 0.1, 0.3))}
                className="p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-xs font-mono text-cyan-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(Math.min(zoom + 0.1, 3))}
                className="p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Grid Toggle */}
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg border transition-all ${
                showGrid
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 9h16M4 13h16M4 17h16M9 4v16M13 4v16M17 4v16" />
              </svg>
            </button>

            {/* Save Button */}
            <button
              onClick={saveMap}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:from-cyan-500/30 hover:to-violet-500/30 transition-all font-medium text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              SAVE
            </button>
          </div>
        </div>
      </div>

      {/* Node Type Toolbar */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20">
        <div className="bg-black/60 border border-white/10 rounded-2xl p-3 backdrop-blur-xl space-y-2">
          <p className="text-[9px] font-mono text-cyan-400/60 text-center mb-3 tracking-widest">NODES</p>
          {(['core', 'module', 'task', 'milestone', 'resource'] as const).map(type => (
            <button
              key={type}
              onClick={() => {
                setNewNodeType(type);
                setIsCreatingNode(true);
              }}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all relative group ${
                isCreatingNode && newNodeType === type
                  ? `bg-gradient-to-br ${nodeColors[type].bg} ${nodeColors[type].border} border-2 shadow-lg ${nodeColors[type].glow}`
                  : 'bg-white/5 border border-white/10 hover:border-white/20'
              }`}
            >
              {type === 'core' && (
                <svg className={`w-5 h-5 ${nodeColors[type].text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              )}
              {type === 'module' && (
                <svg className={`w-5 h-5 ${nodeColors[type].text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              )}
              {type === 'task' && (
                <svg className={`w-5 h-5 ${nodeColors[type].text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              )}
              {type === 'milestone' && (
                <svg className={`w-5 h-5 ${nodeColors[type].text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
              )}
              {type === 'resource' && (
                <svg className={`w-5 h-5 ${nodeColors[type].text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
              {/* Tooltip */}
              <div className="absolute left-full ml-3 px-2 py-1 bg-black/90 border border-white/10 rounded text-[10px] font-mono text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {type.toUpperCase()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair overflow-hidden"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseDown={handleCanvasMouseDown}
        onMouseLeave={handleCanvasMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isCreatingNode ? 'crosshair' : isPanning ? 'grabbing' : 'default' }}
      >
        <div
          className="absolute origin-top-left transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            width: '3000px',
            height: '2000px',
          }}
        >
          {/* Connection Lines */}
          {renderConnections()}

          {/* Connecting Line Preview */}
          {connectingFrom && (
            <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
              <line
                x1={nodes.find(n => n.id === connectingFrom)?.x! + 100}
                y1={nodes.find(n => n.id === connectingFrom)?.y! + 40}
                x2={(mousePos.x - pan.x) / zoom}
                y2={(mousePos.y - pan.y) / zoom}
                stroke="rgba(6, 182, 212, 0.5)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>
          )}

          {/* Nodes */}
          {nodes.map(node => {
            const colors = nodeColors[node.type];
            const isSelected = selectedNode?.id === node.id;

            return (
              <div
                key={node.id}
                className={`absolute w-[200px] transition-shadow duration-200 ${
                  draggingNode === node.id ? 'z-50' : 'z-10'
                }`}
                style={{ left: node.x, top: node.y }}
                onMouseDown={(e) => handleNodeDragStart(node.id, e)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(node);
                }}
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-2 rounded-2xl bg-gradient-to-br ${colors.bg} blur-xl opacity-50 ${isSelected ? 'opacity-80' : ''}`} />

                {/* Card */}
                <div className={`relative bg-gradient-to-br ${colors.bg} backdrop-blur-xl border-2 ${colors.border} rounded-2xl p-4 ${isSelected ? `shadow-2xl ${colors.glow}` : ''} transition-all duration-200 hover:scale-[1.02]`}>
                  {/* Status Indicator */}
                  <div className="absolute -top-1 -right-1 flex items-center gap-1">
                    <div className={`w-3 h-3 rounded-full ${statusColors[node.status]} animate-pulse`} />
                  </div>

                  {/* Type Badge */}
                  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/30 border ${colors.border} mb-2`}>
                    <span className={`text-[9px] font-mono ${colors.text} tracking-wider`}>{node.type.toUpperCase()}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-white mb-1 truncate">{node.title}</h3>
                  <p className="text-[11px] text-zinc-400 mb-3 line-clamp-2">{node.description}</p>

                  {/* Progress Bar */}
                  <div className="relative h-1.5 bg-black/30 rounded-full overflow-hidden mb-2">
                    <div
                      className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colors.bg.replace('/20', '/80').replace('/10', '/60')} rounded-full transition-all duration-500`}
                      style={{ width: `${node.progress}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 bg-white/20 rounded-full animate-pulse"
                      style={{ width: `${node.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono ${colors.text}`}>{node.progress}%</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                      node.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                      node.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      node.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {node.priority.toUpperCase()}
                    </span>
                  </div>

                  {/* Connection Button */}
                  <button
                    onClick={(e) => startConnection(node.id, e)}
                    className={`absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black border-2 ${colors.border} flex items-center justify-center transition-transform hover:scale-125 ${
                      connectingFrom === node.id ? 'scale-125 animate-pulse' : ''
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${colors.text.replace('text-', 'bg-')}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Node Editor Panel */}
      {selectedNode && (
        <div className="absolute right-6 top-24 bottom-6 w-80 z-30">
          <div className="h-full bg-black/80 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-violet-500/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-cyan-400 tracking-widest">NODE EDITOR</span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 text-zinc-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                value={selectedNode.title}
                onChange={(e) => updateNode(selectedNode.id, { title: e.target.value })}
                className="w-full bg-transparent text-lg font-bold text-white border-none focus:outline-none"
              />
            </div>

            {/* Content */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {/* Description */}
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 mb-1 tracking-wider">DESCRIZIONE</label>
                <textarea
                  value={selectedNode.description}
                  onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
                  className="w-full h-20 bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white resize-none focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 mb-1 tracking-wider">TIPO</label>
                <select
                  value={selectedNode.type}
                  onChange={(e) => updateNode(selectedNode.id, { type: e.target.value as ProjectNode['type'] })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="core">Core</option>
                  <option value="module">Module</option>
                  <option value="task">Task</option>
                  <option value="milestone">Milestone</option>
                  <option value="resource">Resource</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 mb-1 tracking-wider">STATUS</label>
                <select
                  value={selectedNode.status}
                  onChange={(e) => updateNode(selectedNode.id, { status: e.target.value as ProjectNode['status'] })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 mb-1 tracking-wider">PRIORITÀ</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['low', 'medium', 'high', 'critical'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => updateNode(selectedNode.id, { priority: p })}
                      className={`py-2 rounded-lg text-[10px] font-mono transition-all ${
                        selectedNode.priority === p
                          ? p === 'critical' ? 'bg-red-500/30 text-red-400 border border-red-500/50' :
                            p === 'high' ? 'bg-orange-500/30 text-orange-400 border border-orange-500/50' :
                            p === 'medium' ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500/50' :
                            'bg-green-500/30 text-green-400 border border-green-500/50'
                          : 'bg-white/5 text-zinc-400 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      {p.charAt(0).toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 mb-1 tracking-wider">PROGRESSO: {selectedNode.progress}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedNode.progress}
                  onChange={(e) => updateNode(selectedNode.id, { progress: parseInt(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Connections */}
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 mb-2 tracking-wider">CONNESSIONI ({selectedNode.connections.length})</label>
                <div className="space-y-1">
                  {selectedNode.connections.map(connId => {
                    const connNode = nodes.find(n => n.id === connId);
                    if (!connNode) return null;
                    return (
                      <div key={connId} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-xs text-zinc-300">{connNode.title}</span>
                        <button
                          onClick={() => updateNode(selectedNode.id, {
                            connections: selectedNode.connections.filter(c => c !== connId)
                          })}
                          className="text-red-400 hover:text-red-300"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => deleteNode(selectedNode.id)}
                className="w-full py-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-all text-sm font-medium"
              >
                Elimina Nodo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Map Modal */}
      {showNewMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-96">
            <h2 className="text-lg font-bold text-white mb-4">Nuova Mappa Progetto</h2>
            <input
              type="text"
              value={newMapName}
              onChange={(e) => setNewMapName(e.target.value)}
              placeholder="Nome della mappa..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white mb-4 focus:outline-none focus:border-cyan-500/50"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewMapModal(false)}
                className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-lg text-zinc-400 hover:text-white transition-all"
              >
                Annulla
              </button>
              <button
                onClick={createNewMap}
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-lg text-white font-medium hover:opacity-90 transition-all"
              >
                Crea
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 py-3 bg-black/60 border-t border-white/5 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-[10px] font-mono text-zinc-500">
            <span>NODES: <span className="text-cyan-400">{nodes.length}</span></span>
            <span>CONNECTIONS: <span className="text-violet-400">{nodes.reduce((acc, n) => acc + n.connections.length, 0)}</span></span>
            <span>ZOOM: <span className="text-emerald-400">{Math.round(zoom * 100)}%</span></span>
          </div>
          <div className="flex items-center gap-4">
            {isCreatingNode && (
              <span className="text-[10px] font-mono text-amber-400 animate-pulse">
                CLICK TO PLACE {newNodeType.toUpperCase()} NODE
              </span>
            )}
            {connectingFrom && (
              <span className="text-[10px] font-mono text-cyan-400 animate-pulse">
                CLICK TARGET NODE TO CONNECT
              </span>
            )}
            <span className="text-[10px] font-mono text-zinc-600">
              {new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
