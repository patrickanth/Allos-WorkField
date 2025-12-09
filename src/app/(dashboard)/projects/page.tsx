'use client';

import { useState, useEffect, useRef } from 'react';

interface ProjectNode {
  id: string;
  title: string;
  description: string;
  type: 'core' | 'module' | 'task' | 'milestone' | 'resource';
  status: 'planning' | 'active' | 'completed' | 'blocked';
  x: number;
  y: number;
  connections: { targetId: string; label: string }[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  dueDate?: string;
  assignee?: string;
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
  core: { bg: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/50', glow: 'shadow-cyan-500/30', text: 'text-cyan-400', hex: '#06b6d4' },
  module: { bg: 'from-violet-500/20 to-violet-600/10', border: 'border-violet-500/50', glow: 'shadow-violet-500/30', text: 'text-violet-400', hex: '#8b5cf6' },
  task: { bg: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/50', glow: 'shadow-emerald-500/30', text: 'text-emerald-400', hex: '#10b981' },
  milestone: { bg: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/50', glow: 'shadow-amber-500/30', text: 'text-amber-400', hex: '#f59e0b' },
  resource: { bg: 'from-rose-500/20 to-rose-600/10', border: 'border-rose-500/50', glow: 'shadow-rose-500/30', text: 'text-rose-400', hex: '#f43f5e' },
};

const statusColors = {
  planning: { bg: 'bg-blue-500', text: 'text-blue-400', label: 'Pianificato' },
  active: { bg: 'bg-green-500', text: 'text-green-400', label: 'In Corso' },
  completed: { bg: 'bg-emerald-500', text: 'text-emerald-400', label: 'Completato' },
  blocked: { bg: 'bg-red-500', text: 'text-red-400', label: 'Bloccato' },
};

const priorityLabels = {
  low: 'Bassa',
  medium: 'Media',
  high: 'Alta',
  critical: 'Critica',
};

const typeLabels = {
  core: 'Nucleo Centrale',
  module: 'Modulo',
  task: 'Attività',
  milestone: 'Milestone',
  resource: 'Risorsa',
};

export default function ProjectMapsPage() {
  const [maps, setMaps] = useState<ProjectMap[]>([]);
  const [activeMap, setActiveMap] = useState<ProjectMap | null>(null);
  const [nodes, setNodes] = useState<ProjectNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<ProjectNode | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [newNodeType, setNewNodeType] = useState<ProjectNode['type']>('task');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  // Modals
  const [showNewMapModal, setShowNewMapModal] = useState(false);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<{ fromId: string; toId: string } | null>(null);
  const [connectionLabel, setConnectionLabel] = useState('');

  // Form states
  const [newMapName, setNewMapName] = useState('');
  const [newMapDescription, setNewMapDescription] = useState('');
  const [nodeForm, setNodeForm] = useState({
    title: '',
    description: '',
    type: 'task' as ProjectNode['type'],
    status: 'planning' as ProjectNode['status'],
    priority: 'medium' as ProjectNode['priority'],
    progress: 0,
    dueDate: '',
    assignee: '',
  });

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
          setNodes(data.maps[0].nodes || []);
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
      description: newMapDescription,
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
      setNewMapDescription('');
      setShowNewMapModal(false);
    } catch (error) {
      console.error('Error creating map:', error);
    }
  };

  const deleteMap = async () => {
    if (!activeMap || !confirm('Eliminare questa mappa?')) return;
    try {
      await fetch(`/api/project-maps?id=${activeMap.id}`, { method: 'DELETE' });
      const newMaps = maps.filter(m => m.id !== activeMap.id);
      setMaps(newMaps);
      if (newMaps.length > 0) {
        setActiveMap(newMaps[0]);
        setNodes(newMaps[0].nodes || []);
      } else {
        setActiveMap(null);
        setNodes([]);
      }
    } catch (error) {
      console.error('Error deleting map:', error);
    }
  };

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
      if (connectingFrom !== nodeId) {
        setPendingConnection({ fromId: connectingFrom, toId: nodeId });
        setShowConnectionModal(true);
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

      setNodeForm({
        title: '',
        description: '',
        type: newNodeType,
        status: 'planning',
        priority: 'medium',
        progress: 0,
        dueDate: '',
        assignee: '',
      });
      const newNode: ProjectNode = {
        id: `node-${Date.now()}`,
        title: '',
        description: '',
        type: newNodeType,
        status: 'planning',
        x,
        y,
        connections: [],
        priority: 'medium',
        progress: 0,
      };
      setNodes([...nodes, newNode]);
      setSelectedNode(newNode);
      setIsCreatingNode(false);
      setShowNodeModal(true);
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
      connections: n.connections.filter(c => c.targetId !== nodeId)
    })));
    setSelectedNode(null);
    setShowNodeModal(false);
    saveMap();
  };

  const updateNode = (updates: Partial<ProjectNode>) => {
    if (!selectedNode) return;
    const updatedNodes = nodes.map(n => n.id === selectedNode.id ? { ...n, ...updates } : n);
    setNodes(updatedNodes);
    setSelectedNode({ ...selectedNode, ...updates });
  };

  const saveNodeChanges = () => {
    if (!selectedNode) return;
    updateNode({
      title: nodeForm.title,
      description: nodeForm.description,
      type: nodeForm.type,
      status: nodeForm.status,
      priority: nodeForm.priority,
      progress: nodeForm.progress,
      dueDate: nodeForm.dueDate || undefined,
      assignee: nodeForm.assignee || undefined,
    });
    setShowNodeModal(false);
    saveMap();
  };

  const openNodeEditor = (node: ProjectNode) => {
    setSelectedNode(node);
    setNodeForm({
      title: node.title,
      description: node.description,
      type: node.type,
      status: node.status,
      priority: node.priority,
      progress: node.progress,
      dueDate: node.dueDate || '',
      assignee: node.assignee || '',
    });
    setShowNodeModal(true);
  };

  const startConnection = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConnectingFrom(nodeId);
  };

  const addConnection = () => {
    if (!pendingConnection) return;
    setNodes(nodes.map(n =>
      n.id === pendingConnection.fromId
        ? { ...n, connections: [...n.connections, { targetId: pendingConnection.toId, label: connectionLabel }] }
        : n
    ));
    setPendingConnection(null);
    setConnectionLabel('');
    setShowConnectionModal(false);
    saveMap();
  };

  const removeConnection = (nodeId: string, targetId: string) => {
    setNodes(nodes.map(n =>
      n.id === nodeId
        ? { ...n, connections: n.connections.filter(c => c.targetId !== targetId) }
        : n
    ));
    saveMap();
  };

  const renderConnections = () => {
    return nodes.flatMap(node =>
      node.connections.map(conn => {
        const target = nodes.find(n => n.id === conn.targetId);
        if (!target) return null;

        const colors = nodeColors[node.type];
        const startX = node.x + 100;
        const startY = node.y + 50;
        const endX = target.x + 100;
        const endY = target.y + 50;
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;

        return (
          <g key={`${node.id}-${conn.targetId}`}>
            <defs>
              <linearGradient id={`gradient-${node.id}-${conn.targetId}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colors.hex} stopOpacity="0.8" />
                <stop offset="100%" stopColor={nodeColors[target.type].hex} stopOpacity="0.8" />
              </linearGradient>
              <marker id={`arrow-${node.id}`} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <path d="M0,0 L0,6 L9,3 z" fill={colors.hex} />
              </marker>
            </defs>
            <line
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={`url(#gradient-${node.id}-${conn.targetId})`}
              strokeWidth="2"
              markerEnd={`url(#arrow-${node.id})`}
              className="transition-all"
            />
            {conn.label && (
              <g>
                <rect
                  x={midX - 40}
                  y={midY - 10}
                  width="80"
                  height="20"
                  rx="4"
                  fill="rgba(0,0,0,0.8)"
                  stroke={colors.hex}
                  strokeWidth="1"
                />
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  fill={colors.hex}
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {conn.label.length > 12 ? conn.label.slice(0, 12) + '...' : conn.label}
                </text>
              </g>
            )}
            <circle r="3" fill={colors.hex}>
              <animateMotion
                dur="2s"
                repeatCount="indefinite"
                path={`M${startX},${startY} L${endX},${endY}`}
              />
            </circle>
          </g>
        );
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#030308] relative overflow-hidden">
      {/* Grid Background */}
      {showGrid && (
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
              transform: `translate(${pan.x % 50}px, ${pan.y % 50}px)`,
            }}
          />
        </div>
      )}

      {/* Mouse Glow */}
      <div
        className="absolute w-96 h-96 rounded-full pointer-events-none transition-all duration-300 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
          left: mousePos.x - 192,
          top: mousePos.y - 192,
        }}
      />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 py-4 bg-black/40 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Project Maps</h1>
                <p className="text-[10px] text-cyan-400/60 font-mono">Visualizza e pianifica i tuoi progetti</p>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-6">
              <select
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
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
              <button onClick={() => setShowNewMapModal(true)} className="p-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              {activeMap && (
                <button onClick={deleteMap} className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tutorial Button */}
            <button
              onClick={() => setShowTutorial(true)}
              className="p-2 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:border-cyan-500/50 transition-all"
              title="Tutorial"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Zoom */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
              <button onClick={() => setZoom(Math.max(zoom - 0.1, 0.3))} className="p-2 text-zinc-400 hover:text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-xs font-mono text-cyan-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(Math.min(zoom + 0.1, 3))} className="p-2 text-zinc-400 hover:text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Grid Toggle */}
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg border transition-all ${showGrid ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'border-white/10 text-zinc-400 hover:text-white'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 9h16M4 13h16M9 4v16M13 4v16" />
              </svg>
            </button>

            {/* Save */}
            <button onClick={saveMap} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:from-cyan-500/30 hover:to-violet-500/30 transition-all font-medium text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Salva
            </button>
          </div>
        </div>
      </div>

      {/* Node Toolbar */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20">
        <div className="bg-black/80 border border-white/10 rounded-2xl p-3 backdrop-blur-xl space-y-2">
          <p className="text-[9px] font-mono text-cyan-400/60 text-center mb-3 tracking-widest">NODI</p>
          {(['core', 'module', 'task', 'milestone', 'resource'] as const).map(type => (
            <button
              key={type}
              onClick={() => { setNewNodeType(type); setIsCreatingNode(true); }}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all relative group ${
                isCreatingNode && newNodeType === type
                  ? `bg-gradient-to-br ${nodeColors[type].bg} ${nodeColors[type].border} border-2 shadow-lg ${nodeColors[type].glow}`
                  : 'bg-white/5 border border-white/10 hover:border-white/20'
              }`}
            >
              {type === 'core' && <svg className={`w-5 h-5 ${nodeColors[type].text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>}
              {type === 'module' && <svg className={`w-5 h-5 ${nodeColors[type].text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
              {type === 'task' && <svg className={`w-5 h-5 ${nodeColors[type].text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
              {type === 'milestone' && <svg className={`w-5 h-5 ${nodeColors[type].text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>}
              {type === 'resource' && <svg className={`w-5 h-5 ${nodeColors[type].text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              <div className="absolute left-full ml-3 px-2 py-1 bg-black/90 border border-white/10 rounded text-[10px] font-mono text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {typeLabels[type]}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 overflow-hidden"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseDown={handleCanvasMouseDown}
        onMouseLeave={handleCanvasMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isCreatingNode ? 'crosshair' : isPanning ? 'grabbing' : 'default' }}
      >
        <div className="absolute origin-top-left transition-transform duration-75" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, width: '3000px', height: '2000px' }}>
          {/* Connections SVG */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
            {renderConnections()}
            {connectingFrom && (
              <line
                x1={nodes.find(n => n.id === connectingFrom)?.x! + 100}
                y1={nodes.find(n => n.id === connectingFrom)?.y! + 50}
                x2={(mousePos.x - pan.x) / zoom}
                y2={(mousePos.y - pan.y) / zoom}
                stroke="rgba(6, 182, 212, 0.5)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            )}
          </svg>

          {/* Nodes */}
          {nodes.map(node => {
            const colors = nodeColors[node.type];
            const isSelected = selectedNode?.id === node.id;

            return (
              <div
                key={node.id}
                className={`absolute w-[200px] transition-shadow duration-200 ${draggingNode === node.id ? 'z-50' : 'z-10'}`}
                style={{ left: node.x, top: node.y }}
                onMouseDown={(e) => handleNodeDragStart(node.id, e)}
                onDoubleClick={(e) => { e.stopPropagation(); openNodeEditor(node); }}
              >
                <div className={`absolute -inset-2 rounded-2xl bg-gradient-to-br ${colors.bg} blur-xl opacity-50 ${isSelected ? 'opacity-80' : ''}`} />
                <div className={`relative bg-gradient-to-br ${colors.bg} backdrop-blur-xl border-2 ${colors.border} rounded-2xl p-4 ${isSelected ? `shadow-2xl ${colors.glow}` : ''} transition-all duration-200 hover:scale-[1.02]`}>
                  <div className="absolute -top-1 -right-1 flex items-center gap-1">
                    <div className={`w-3 h-3 rounded-full ${statusColors[node.status].bg} animate-pulse`} />
                  </div>

                  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/30 border ${colors.border} mb-2`}>
                    <span className={`text-[9px] font-mono ${colors.text} tracking-wider`}>{typeLabels[node.type].toUpperCase()}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1 truncate">{node.title || 'Nuovo Nodo'}</h3>
                  <p className="text-[11px] text-zinc-400 mb-3 line-clamp-2">{node.description || 'Doppio click per modificare'}</p>

                  <div className="relative h-1.5 bg-black/30 rounded-full overflow-hidden mb-2">
                    <div className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500`} style={{ width: `${node.progress}%`, background: colors.hex }} />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono ${colors.text}`}>{node.progress}%</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                      node.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                      node.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      node.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>{priorityLabels[node.priority]}</span>
                  </div>

                  <button
                    onClick={(e) => startConnection(node.id, e)}
                    className={`absolute -right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black border-2 ${colors.border} flex items-center justify-center transition-transform hover:scale-125 ${connectingFrom === node.id ? 'scale-125 animate-pulse' : ''}`}
                    title="Crea connessione"
                  >
                    <div className={`w-2 h-2 rounded-full`} style={{ background: colors.hex }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 py-3 bg-black/60 border-t border-white/5 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-[10px] font-mono text-zinc-500">
            <span>NODI: <span className="text-cyan-400">{nodes.length}</span></span>
            <span>CONNESSIONI: <span className="text-violet-400">{nodes.reduce((acc, n) => acc + n.connections.length, 0)}</span></span>
            <span>ZOOM: <span className="text-emerald-400">{Math.round(zoom * 100)}%</span></span>
            {activeMap && <span>MAPPA: <span className="text-amber-400">{activeMap.name}</span></span>}
          </div>
          <div className="flex items-center gap-4">
            {isCreatingNode && <span className="text-[10px] font-mono text-amber-400 animate-pulse">CLICK PER POSIZIONARE {typeLabels[newNodeType].toUpperCase()}</span>}
            {connectingFrom && <span className="text-[10px] font-mono text-cyan-400 animate-pulse">CLICK SUL NODO DESTINAZIONE</span>}
          </div>
        </div>
      </div>

      {/* New Map Modal */}
      {showNewMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md" onClick={() => setShowNewMapModal(false)}>
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl shadow-cyan-500/10" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-2">Nuova Mappa Progetto</h2>
            <p className="text-sm text-zinc-500 mb-8">Crea un nuovo spazio di lavoro visuale</p>
            <div className="space-y-6">
              <div>
                <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-3 font-medium">Nome Mappa *</label>
                <input
                  type="text"
                  value={newMapName}
                  onChange={(e) => setNewMapName(e.target.value)}
                  placeholder="Es: Piano di Sviluppo Q1"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-3 font-medium">Descrizione</label>
                <textarea
                  value={newMapDescription}
                  onChange={(e) => setNewMapDescription(e.target.value)}
                  placeholder="Descrivi lo scopo di questa mappa..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-all min-h-[100px] resize-none"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowNewMapModal(false)} className="flex-1 py-3.5 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all font-medium">Annulla</button>
              <button onClick={createNewMap} disabled={!newMapName.trim()} className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl text-white font-medium hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25">Crea Mappa</button>
            </div>
          </div>
        </div>
      )}

      {/* Node Edit Modal */}
      {showNodeModal && selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md" onClick={() => setShowNodeModal(false)}>
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-white/10 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl shadow-cyan-500/10" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/80">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Modifica Nodo</h2>
                <p className="text-sm text-zinc-500">Configura le proprietà del nodo</p>
              </div>
              <button onClick={() => setShowNodeModal(false)} className="p-2.5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-8 py-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div>
                <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-3 font-medium">Titolo *</label>
                <input type="text" value={nodeForm.title} onChange={(e) => setNodeForm({ ...nodeForm, title: e.target.value })} placeholder="Nome del nodo" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-all" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-3 font-medium">Descrizione</label>
                <textarea value={nodeForm.description} onChange={(e) => setNodeForm({ ...nodeForm, description: e.target.value })} placeholder="Descrivi questo elemento..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-all min-h-[100px] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-3 font-medium">Tipo</label>
                  <select value={nodeForm.type} onChange={(e) => setNodeForm({ ...nodeForm, type: e.target.value as ProjectNode['type'] })} className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-500/50 transition-all">
                    {Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value} className="bg-zinc-800">{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-3 font-medium">Stato</label>
                  <select value={nodeForm.status} onChange={(e) => setNodeForm({ ...nodeForm, status: e.target.value as ProjectNode['status'] })} className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-500/50 transition-all">
                    {Object.entries(statusColors).map(([value, { label }]) => <option key={value} value={value} className="bg-zinc-800">{label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-3 font-medium">Priorità</label>
                  <select value={nodeForm.priority} onChange={(e) => setNodeForm({ ...nodeForm, priority: e.target.value as ProjectNode['priority'] })} className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-500/50 transition-all">
                    {Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value} className="bg-zinc-800">{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-3 font-medium">Progresso: {nodeForm.progress}%</label>
                  <input type="range" min="0" max="100" value={nodeForm.progress} onChange={(e) => setNodeForm({ ...nodeForm, progress: parseInt(e.target.value) })} className="w-full accent-cyan-500 mt-3 h-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-3 font-medium">Scadenza</label>
                  <input type="date" value={nodeForm.dueDate} onChange={(e) => setNodeForm({ ...nodeForm, dueDate: e.target.value })} className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-cyan-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-3 font-medium">Assegnato a</label>
                  <input type="text" value={nodeForm.assignee} onChange={(e) => setNodeForm({ ...nodeForm, assignee: e.target.value })} placeholder="Nome persona" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-all" />
                </div>
              </div>

              {/* Connections */}
              {selectedNode.connections.length > 0 && (
                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-3 font-medium">Connessioni ({selectedNode.connections.length})</label>
                  <div className="space-y-2.5">
                    {selectedNode.connections.map(conn => {
                      const target = nodes.find(n => n.id === conn.targetId);
                      return (
                        <div key={conn.targetId} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                          <div>
                            <span className="text-sm text-white font-medium">{target?.title || 'Nodo'}</span>
                            {conn.label && <span className="text-xs text-cyan-400 ml-3 px-2 py-0.5 bg-cyan-500/10 rounded-lg">({conn.label})</span>}
                          </div>
                          <button onClick={() => removeConnection(selectedNode.id, conn.targetId)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="px-8 py-5 border-t border-white/10 flex gap-4 bg-zinc-900/50">
              <button onClick={() => deleteNode(selectedNode.id)} className="py-3 px-5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 transition-all font-medium">Elimina</button>
              <div className="flex-1" />
              <button onClick={() => setShowNodeModal(false)} className="py-3 px-6 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all font-medium">Annulla</button>
              <button onClick={saveNodeChanges} className="py-3 px-6 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl text-white font-medium hover:opacity-90 transition-all shadow-lg shadow-cyan-500/25">Salva</button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Label Modal */}
      {showConnectionModal && pendingConnection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md" onClick={() => { setShowConnectionModal(false); setPendingConnection(null); }}>
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-white/10 rounded-3xl p-8 w-full max-w-sm shadow-2xl shadow-cyan-500/10" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-2">Nuova Connessione</h2>
            <p className="text-sm text-zinc-500 mb-6">Collega due nodi tra loro</p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 space-y-2">
              <p className="text-sm text-zinc-400">
                Da: <span className="text-cyan-400 font-medium">{nodes.find(n => n.id === pendingConnection.fromId)?.title || 'Nodo'}</span>
              </p>
              <p className="text-sm text-zinc-400">
                A: <span className="text-violet-400 font-medium">{nodes.find(n => n.id === pendingConnection.toId)?.title || 'Nodo'}</span>
              </p>
            </div>
            <div className="mb-8">
              <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-3 font-medium">Etichetta (opzionale)</label>
              <input
                type="text"
                value={connectionLabel}
                onChange={(e) => setConnectionLabel(e.target.value)}
                placeholder="Es: dipende da, blocca, richiede..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-all"
                autoFocus
              />
            </div>
            <div className="flex gap-4">
              <button onClick={() => { setShowConnectionModal(false); setPendingConnection(null); }} className="flex-1 py-3.5 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all font-medium">Annulla</button>
              <button onClick={addConnection} className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl text-white font-medium hover:opacity-90 transition-all shadow-lg shadow-cyan-500/25">Connetti</button>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md" onClick={() => setShowTutorial(false)}>
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl shadow-cyan-500/10" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/80 backdrop-blur-sm">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Come usare Project Maps</h2>
                <p className="text-sm text-zinc-500">Guida rapida per iniziare</p>
              </div>
              <button onClick={() => setShowTutorial(false)} className="p-2.5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-8 py-8 space-y-7 overflow-y-auto max-h-[calc(85vh-100px)]">
              {/* Step 1 */}
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-cyan-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold shrink-0 shadow-lg shadow-cyan-500/20">1</div>
                <div className="pt-1 flex-1">
                  <h3 className="text-white font-semibold text-[15px] mb-2">Crea una Mappa</h3>
                  <p className="text-[13px] text-zinc-400 leading-relaxed">Clicca sul pulsante "+" accanto al selettore mappe per creare una nuova mappa progetto. Ogni mappa rappresenta un progetto o un'area di lavoro.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/30 to-violet-600/10 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold shrink-0 shadow-lg shadow-violet-500/20">2</div>
                <div className="pt-1 flex-1">
                  <h3 className="text-white font-semibold text-[15px] mb-2">Aggiungi Nodi</h3>
                  <p className="text-[13px] text-zinc-400 leading-relaxed mb-4">Usa la barra laterale per selezionare il tipo di nodo, poi clicca sulla mappa per posizionarlo:</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      <span className="text-[12px]"><span className="text-cyan-400 font-medium">Core:</span> <span className="text-zinc-500">Elementi centrali</span></span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                      <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                      <span className="text-[12px]"><span className="text-violet-400 font-medium">Module:</span> <span className="text-zinc-500">Sottosistemi</span></span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="text-[12px]"><span className="text-emerald-400 font-medium">Task:</span> <span className="text-zinc-500">Attività</span></span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span className="text-[12px]"><span className="text-amber-400 font-medium">Milestone:</span> <span className="text-zinc-500">Traguardi</span></span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 col-span-2">
                      <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                      <span className="text-[12px]"><span className="text-rose-400 font-medium">Resource:</span> <span className="text-zinc-500">Risorse umane o materiali</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0 shadow-lg shadow-emerald-500/20">3</div>
                <div className="pt-1 flex-1">
                  <h3 className="text-white font-semibold text-[15px] mb-2">Modifica i Nodi</h3>
                  <p className="text-[13px] text-zinc-400 leading-relaxed">Fai doppio click su un nodo per aprire l'editor. Puoi modificare titolo, descrizione, stato, priorità, progresso, scadenza e assegnatario.</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shrink-0 shadow-lg shadow-amber-500/20">4</div>
                <div className="pt-1 flex-1">
                  <h3 className="text-white font-semibold text-[15px] mb-2">Crea Connessioni</h3>
                  <p className="text-[13px] text-zinc-400 leading-relaxed">Clicca sul pallino a destra di un nodo, poi clicca su un altro nodo per creare una connessione. Puoi aggiungere un'etichetta (es: "dipende da", "blocca", "richiede").</p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/30 to-rose-600/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold shrink-0 shadow-lg shadow-rose-500/20">5</div>
                <div className="pt-1 flex-1">
                  <h3 className="text-white font-semibold text-[15px] mb-2">Naviga la Mappa</h3>
                  <p className="text-[13px] text-zinc-400 leading-relaxed">Usa la rotella del mouse per zoomare. Tieni premuto Alt + click sinistro e trascina per muovere la vista. Trascina i nodi per riposizionarli.</p>
                </div>
              </div>

              {/* Tip */}
              <div className="bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-500/30 rounded-2xl p-5 mt-2">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-cyan-400 mb-1">Suggerimento</p>
                    <p className="text-[13px] text-zinc-400">Ricorda di salvare spesso le tue modifiche cliccando sul pulsante "Salva" in alto a destra.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
