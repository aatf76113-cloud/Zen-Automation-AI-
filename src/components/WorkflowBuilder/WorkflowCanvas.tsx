import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  Play,
  Wand2,
  Save,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  Layers,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Compass,
  RotateCcw
} from 'lucide-react';
import { WorkflowNode, WorkflowEdge, NodeType } from '../../types';
import { AVAILABLE_NODES, NodeDefinition, INITIAL_WORKFLOWS } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { NodeCard } from './NodeCard';
import { NodeConfigDrawer } from './NodeConfigDrawer';
import { AiWorkflowGeneratorModal } from './AiWorkflowGeneratorModal';
import { ExecutionSimulatorModal } from './ExecutionSimulatorModal';
import { CreateWorkflowModal } from '../Workflows/CreateWorkflowModal';

export const WorkflowCanvas: React.FC = () => {
  const {
    workflows,
    selectedWorkflow,
    setSelectedWorkflow,
    builderNodes,
    builderEdges,
    setBuilderNodes,
    setBuilderEdges,
    selectedNodeId,
    setSelectedNodeId,
    saveWorkflow,
    toggleWorkflowStatus,
    language,
    t
  } = useApp();

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [connectingFromNodeId, setConnectingFromNodeId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  const [isNodePaletteOpen, setIsNodePaletteOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSaveSuccessToast, setIsSaveSuccessToast] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<NodeType | 'all'>('all');

  // Drag node state
  const draggingNodeRef = useRef<{ id: string; startX: number; startY: number; initialNodeX: number; initialNodeY: number } | null>(null);
  const panStartRef = useRef<{ x: number; y: number; originX: number; originY: number }>({ x: 0, y: 0, originX: 0, originY: 0 });

  // Auto-fit nodes inside viewport so they never get lost off-screen
  const handleFitView = useCallback(() => {
    const nodes = builderNodes || [];
    const isMobile = window.innerWidth < 768;

    if (nodes.length === 0) {
      setZoom(isMobile ? 0.75 : 1);
      setPan({ x: isMobile ? 15 : 40, y: isMobile ? 25 : 40 });
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach((n) => {
      const px = n.position?.x ?? 50;
      const py = n.position?.y ?? 100;
      minX = Math.min(minX, px);
      minY = Math.min(minY, py);
      maxX = Math.max(maxX, px + 290);
      maxY = Math.max(maxY, py + 180);
    });

    const containerW = isMobile ? Math.max(window.innerWidth - 20, 320) : Math.max(window.innerWidth - 300, 400);
    const containerH = isMobile ? Math.max(window.innerHeight - 200, 300) : Math.max(window.innerHeight - 150, 400);

    const contentW = Math.max(maxX - minX, 300);
    const contentH = Math.max(maxY - minY, 200);

    const scaleX = (containerW * 0.9) / contentW;
    const scaleY = (containerH * 0.85) / contentH;
    let targetZoom = Math.min(scaleX, scaleY);
    targetZoom = Math.max(0.45, Math.min(isMobile ? 0.8 : 1.0, targetZoom));

    const targetPanX = (containerW - contentW * targetZoom) / 2 - minX * targetZoom + (isMobile ? 10 : 30);
    const targetPanY = Math.max(20, (containerH - contentH * targetZoom) / 2 - minY * targetZoom + (isMobile ? 20 : 40));

    setZoom(Number(targetZoom.toFixed(2)));
    setPan({ x: Math.round(targetPanX), y: Math.round(targetPanY) });
  }, [builderNodes]);

  // Ensure initial workflow and nodes are populated
  useEffect(() => {
    if ((!builderNodes || builderNodes.length === 0) && workflows && workflows.length > 0) {
      const wfToLoad = selectedWorkflow || workflows[0];
      if (wfToLoad && wfToLoad.nodes && wfToLoad.nodes.length > 0) {
        setBuilderNodes(wfToLoad.nodes);
        setBuilderEdges(wfToLoad.edges || []);
        if (!selectedWorkflow) setSelectedWorkflow(wfToLoad);
      }
    }
  }, [workflows, selectedWorkflow, builderNodes, setBuilderNodes, setBuilderEdges, setSelectedWorkflow]);

  // Auto-center on initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFitView();
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  const handleLoadSampleWorkflow = () => {
    const sample = (workflows && workflows.length > 0) ? workflows[0] : INITIAL_WORKFLOWS[0];
    if (sample) {
      setSelectedWorkflow(sample);
      setBuilderNodes(sample.nodes || []);
      setBuilderEdges(sample.edges || []);
      setTimeout(() => handleFitView(), 50);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const node = (builderNodes || []).find((n) => n.id === id);
    if (!node) return;

    const initialX = node.position?.x ?? 50;
    const initialY = node.position?.y ?? 100;

    draggingNodeRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialNodeX: initialX,
      initialNodeY: initialY
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!draggingNodeRef.current) return;
      const dx = (moveEvent.clientX - draggingNodeRef.current.startX) / zoom;
      const dy = (moveEvent.clientY - draggingNodeRef.current.startY) / zoom;

      setBuilderNodes((prev) =>
        prev.map((n) =>
          n.id === draggingNodeRef.current!.id
            ? {
                ...n,
                position: {
                  x: Math.max(20, Math.round(draggingNodeRef.current!.initialNodeX + dx)),
                  y: Math.max(20, Math.round(draggingNodeRef.current!.initialNodeY + dy))
                }
              }
            : n
        )
      );
    };

    const handleMouseUp = () => {
      draggingNodeRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    e.stopPropagation();
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const node = (builderNodes || []).find((n) => n.id === id);
    if (!node) return;

    const initialX = node.position?.x ?? 50;
    const initialY = node.position?.y ?? 100;

    draggingNodeRef.current = {
      id,
      startX: touch.clientX,
      startY: touch.clientY,
      initialNodeX: initialX,
      initialNodeY: initialY
    };

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!draggingNodeRef.current || moveEvent.touches.length !== 1) return;
      const t = moveEvent.touches[0];
      const dx = (t.clientX - draggingNodeRef.current.startX) / zoom;
      const dy = (t.clientY - draggingNodeRef.current.startY) / zoom;

      setBuilderNodes((prev) =>
        prev.map((n) =>
          n.id === draggingNodeRef.current!.id
            ? {
                ...n,
                position: {
                  x: Math.max(20, Math.round(draggingNodeRef.current!.initialNodeX + dx)),
                  y: Math.max(20, Math.round(draggingNodeRef.current!.initialNodeY + dy))
                }
              }
            : n
        )
      );
    };

    const handleTouchEnd = () => {
      draggingNodeRef.current = null;
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (connectingFromNodeId) {
      setConnectingFromNodeId(null);
      return;
    }
    setSelectedNodeId(null);
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      originX: pan.x,
      originY: pan.y
    };

    const handlePanMove = (me: MouseEvent) => {
      const dx = me.clientX - panStartRef.current.x;
      const dy = me.clientY - panStartRef.current.y;
      setPan({
        x: panStartRef.current.originX + dx,
        y: panStartRef.current.originY + dy
      });
    };

    const handlePanUp = () => {
      setIsPanning(false);
      window.removeEventListener('mousemove', handlePanMove);
      window.removeEventListener('mouseup', handlePanUp);
    };

    window.addEventListener('mousemove', handlePanMove);
    window.addEventListener('mouseup', handlePanUp);
  };

  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    if (connectingFromNodeId) {
      setConnectingFromNodeId(null);
      return;
    }
    const touch = e.touches[0];
    setSelectedNodeId(null);
    setIsPanning(true);
    panStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      originX: pan.x,
      originY: pan.y
    };

    const handlePanTouchMove = (te: TouchEvent) => {
      if (te.touches.length !== 1) return;
      const t = te.touches[0];
      const dx = t.clientX - panStartRef.current.x;
      const dy = t.clientY - panStartRef.current.y;
      setPan({
        x: panStartRef.current.originX + dx,
        y: panStartRef.current.originY + dy
      });
    };

    const handlePanTouchEnd = () => {
      setIsPanning(false);
      window.removeEventListener('touchmove', handlePanTouchMove);
      window.removeEventListener('touchend', handlePanTouchEnd);
    };

    window.addEventListener('touchmove', handlePanTouchMove, { passive: true });
    window.addEventListener('touchend', handlePanTouchEnd);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (connectingFromNodeId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      setMousePos({ x, y });
    }
  };

  const handleStartConnect = (sourceId: string) => {
    setConnectingFromNodeId(sourceId);
  };

  const handleEndConnect = (targetId: string) => {
    if (!connectingFromNodeId || connectingFromNodeId === targetId) {
      setConnectingFromNodeId(null);
      return;
    }
    const alreadyExists = builderEdges.some(
      (e) => e.source === connectingFromNodeId && e.target === targetId
    );
    if (!alreadyExists) {
      const newEdge: WorkflowEdge = {
        id: `e_${connectingFromNodeId}_${targetId}_${Date.now()}`,
        source: connectingFromNodeId,
        target: targetId
      };
      setBuilderEdges((prev) => [...prev, newEdge]);
    }
    setConnectingFromNodeId(null);
  };

  const handleDeleteEdge = (edgeId: string) => {
    setBuilderEdges((prev) => prev.filter((e) => e.id !== edgeId));
  };

  const handleResetView = () => {
    handleFitView();
  };

  const handleAddNodeFromPalette = (def: NodeDefinition) => {
    // Calculate new position offset
    const nodes = builderNodes || [];
    const lastNode = nodes[nodes.length - 1];
    const newX = lastNode ? (lastNode.position?.x ?? 50) + 300 : 80;
    const newY = lastNode ? (lastNode.position?.y ?? 100) : 150;

    const newNodeId = `node_${Date.now()}`;
    const newNode: WorkflowNode = {
      id: newNodeId,
      type: def.type,
      subType: def.subType,
      name: def.name,
      nameAr: def.nameAr,
      description: def.description,
      descriptionAr: def.descriptionAr,
      position: { x: newX, y: newY },
      config: { ...def.defaultConfig },
      icon: def.icon
    };

    setBuilderNodes((prev) => [...(prev || []), newNode]);

    // Connect to previous node if exists
    if (lastNode) {
      const newEdge: WorkflowEdge = {
        id: `e_${lastNode.id}_${newNodeId}`,
        source: lastNode.id,
        target: newNodeId
      };
      setBuilderEdges((prev) => [...(prev || []), newEdge]);
    }

    setSelectedNodeId(newNodeId);
    setIsNodePaletteOpen(false);
  };

  const handleDeleteNode = (id: string) => {
    setBuilderNodes((prev) => (prev || []).filter((n) => n.id !== id));
    setBuilderEdges((prev) => (prev || []).filter((e) => e.source !== id && e.target !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const handleDuplicateNode = (id: string) => {
    const original = (builderNodes || []).find((n) => n.id === id);
    if (!original) return;

    const originalX = original.position?.x ?? 50;
    const originalY = original.position?.y ?? 100;
    const newId = `node_${Date.now()}`;
    const duplicate: WorkflowNode = {
      ...original,
      id: newId,
      name: `${original.name} (Copy)`,
      nameAr: `${original.nameAr} (نسخة)`,
      position: { x: originalX + 40, y: originalY + 40 }
    };

    setBuilderNodes((prev) => [...(prev || []), duplicate]);
    setSelectedNodeId(newId);
  };

  const handleUpdateNode = (updated: WorkflowNode) => {
    setBuilderNodes((prev) => (prev || []).map((n) => (n.id === updated.id ? updated : n)));
  };

  const handleSaveCurrentWorkflow = () => {
    if (!selectedWorkflow) return;
    saveWorkflow({
      ...selectedWorkflow,
      nodes: builderNodes || [],
      edges: builderEdges || []
    });
    setIsSaveSuccessToast(true);
    setTimeout(() => setIsSaveSuccessToast(false), 2500);
  };

  const filteredPaletteNodes = activeCategoryFilter === 'all'
    ? AVAILABLE_NODES
    : AVAILABLE_NODES.filter((n) => n.type === activeCategoryFilter);

  // SVG Connector Line Generator
  const renderConnectorLines = () => {
    return (builderEdges || []).map((edge) => {
      const sourceNode = (builderNodes || []).find((n) => n.id === edge.source);
      const targetNode = (builderNodes || []).find((n) => n.id === edge.target);

      if (!sourceNode || !targetNode) return null;

      // Card dimensions (w-72 is 288px)
      const cardWidth = 288;
      const cardHeight = 130;

      // Source port: center bottom or right
      const startX = (sourceNode.position?.x ?? 50) + cardWidth / 2;
      const startY = (sourceNode.position?.y ?? 100) + cardHeight;

      // Target port: center top or left
      const endX = (targetNode.position?.x ?? 50) + cardWidth / 2;
      const endY = (targetNode.position?.y ?? 100);

      // Curvature
      const deltaY = endY - startY;
      const controlY1 = startY + Math.max(50, Math.abs(deltaY) * 0.5);
      const controlY2 = endY - Math.max(50, Math.abs(deltaY) * 0.5);

      const pathData = `M ${startX} ${startY} C ${startX} ${controlY1}, ${endX} ${controlY2}, ${endX} ${endY}`;

      const isConditional = edge.conditionBranch !== undefined;
      const isHovered = hoveredEdgeId === edge.id;

      return (
        <g
          key={edge.id}
          className="group cursor-pointer"
          onMouseEnter={() => setHoveredEdgeId(edge.id)}
          onMouseLeave={() => setHoveredEdgeId(null)}
        >
          {/* Thick transparent path for easier hover and click target */}
          <path
            d={pathData}
            fill="none"
            stroke="transparent"
            strokeWidth="18"
            className="pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteEdge(edge.id);
            }}
          />
          {/* Outer glow line */}
          <path
            d={pathData}
            fill="none"
            stroke={isHovered ? '#ef4444' : isConditional ? '#f59e0b' : '#10b981'}
            strokeWidth={isHovered ? '4' : '3'}
            strokeDasharray={isConditional ? '6 4' : 'none'}
            className="opacity-70 group-hover:opacity-100 transition-all pointer-events-none"
          />
          {/* Animated signal dots traveling along the cable */}
          <circle r="3.5" fill={isHovered ? '#ef4444' : isConditional ? '#f59e0b' : '#34d399'}>
            <animateMotion
              path={pathData}
              dur="2.4s"
              repeatCount="indefinite"
              rotate="auto"
            />
          </circle>

          {/* Label badge if branch */}
          {edge.label && (
            <text
              x={(startX + endX) / 2}
              y={(startY + endY) / 2 - 12}
              fill="#94a3b8"
              fontSize="11"
              fontWeight="600"
              textAnchor="middle"
              className="select-none bg-slate-900 pointer-events-none"
            >
              {edge.label}
            </text>
          )}

          {/* Delete edge button badge at midpoint */}
          <g
            className="pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteEdge(edge.id);
            }}
          >
            <circle
              cx={(startX + endX) / 2}
              cy={(startY + endY) / 2}
              r="10"
              className="fill-rose-600 hover:fill-rose-500 stroke-2 stroke-white shadow"
            />
            <text
              x={(startX + endX) / 2}
              y={(startY + endY) / 2 + 3.5}
              fill="white"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
              className="pointer-events-none select-none"
            >
              ×
            </text>
          </g>
        </g>
      );
    });
  };

  return (
    <div id="workflow_canvas_container" className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Top Toolbar */}
      <div className="min-h-14 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-2.5 py-2 sm:px-4 flex flex-wrap items-center justify-between gap-2 shrink-0 z-10">
        {/* Left: Workflow Title & Status & New Flow */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate max-w-[130px] sm:max-w-[200px] md:max-w-none">
                {language === 'ar'
                  ? selectedWorkflow?.nameAr || 'محرر مسارات العمل'
                  : selectedWorkflow?.name || 'Workflow Canvas'}
              </h2>
              <button
                onClick={() => selectedWorkflow && toggleWorkflowStatus(selectedWorkflow.id)}
                className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors shrink-0 ${
                  selectedWorkflow?.isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    selectedWorkflow?.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                <span>
                  {selectedWorkflow?.isActive
                    ? t('نشط', 'Active')
                    : t('متوقف', 'Inactive')}
                </span>
              </button>

              <button
                id="canvas_new_workflow_btn"
                onClick={() => setIsCreateModalOpen(true)}
                title={t('إنشاء مسار أتمتة جديد', 'Create New Automation Flow')}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-600 text-[10px] font-bold text-slate-600 dark:text-slate-300 transition-colors"
              >
                <Plus className="w-3 h-3 text-emerald-500" />
                <span>{t('مسار جديد', 'New Flow')}</span>
              </button>
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">
              {builderNodes.length} {t('عقد (Nodes)', 'Nodes')} • {builderEdges.length} {t('روابط (Connections)', 'Links')}
            </span>
          </div>
        </div>

        {/* Center: AI Generator CTA */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            id="builder_open_ai_generator_btn"
            onClick={() => setIsAiGeneratorOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[11px] sm:text-xs font-bold shadow-md shadow-purple-500/20 transition-all hover:scale-105"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('توليد مسار بالذكاء الاصطناعي', 'AI Workflow Generator')}</span>
            <span className="sm:hidden">{t('توليد AI', 'AI Gen')}</span>
          </button>

          <button
            id="builder_run_simulation_btn"
            onClick={() => setIsSimulatorOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs font-bold transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-emerald-500 fill-current" />
            <span className="hidden sm:inline">{t('اختبار وتشغيل المسار', 'Test & Run')}</span>
            <span className="sm:hidden">{t('اختبار', 'Test')}</span>
          </button>
        </div>

        {/* Right: Add Node, Zoom & Save */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            id="toggle_node_palette_btn"
            onClick={() => setIsNodePaletteOpen(!isNodePaletteOpen)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${
              isNodePaletteOpen
                ? 'bg-emerald-600 text-white'
                : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t('إضافة عقدة', 'Add Node')}</span>
            <span className="sm:hidden">{t('عقدة', 'Node')}</span>
          </button>

          <button
            id="save_workflow_canvas_btn"
            onClick={handleSaveCurrentWorkflow}
            className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] sm:text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('حفظ المسار', 'Save Flow')}</span>
            <span className="sm:hidden">{t('حفظ', 'Save')}</span>
          </button>
        </div>
      </div>

      {/* Main Visual Canvas Work Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Floating Connecting Helper Banner */}
        {connectingFromNodeId && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-amber-500 text-white font-bold text-xs shadow-xl flex items-center gap-3 z-30 animate-bounce">
            <span>
              {t(
                'انقر على نقطة الاستقبال أو العقدة الهدف لربطهما، أو انقر في الفراغ للإلغاء',
                'Click target node port to connect, or click empty space to cancel'
              )}
            </span>
            <button
              onClick={() => setConnectingFromNodeId(null)}
              className="px-2 py-0.5 rounded-full bg-black/20 hover:bg-black/40 text-[10px]"
            >
              {t('إلغاء', 'Cancel')}
            </button>
          </div>
        )}

        {/* Canvas Surface with Grid */}
        <div
          id="canvas_surface"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onTouchStart={handleCanvasTouchStart}
          className={`flex-1 overflow-hidden bg-slate-100 dark:bg-slate-950 bg-grid-pattern relative select-none touch-none ${
            isPanning ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* Pan & Zoom Wrapper */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'top left',
              minWidth: '3200px',
              minHeight: '2200px',
              position: 'relative'
            }}
          >
            {/* SVG Connecting Cables */}
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: '3200px', height: '2200px', zIndex: 1 }}
            >
              {renderConnectorLines()}

              {/* Active Connection Cable being drawn */}
              {connectingFromNodeId && (() => {
                const sourceNode = (builderNodes || []).find((n) => n.id === connectingFromNodeId);
                if (!sourceNode) return null;
                const startX = (sourceNode.position?.x ?? 50) + 144;
                const startY = (sourceNode.position?.y ?? 100) + 130;
                const endX = mousePos.x;
                const endY = mousePos.y;
                const deltaY = endY - startY;
                const controlY1 = startY + Math.max(40, Math.abs(deltaY) * 0.5);
                const controlY2 = endY - Math.max(40, Math.abs(deltaY) * 0.5);
                const pathData = `M ${startX} ${startY} C ${startX} ${controlY1}, ${endX} ${controlY2}, ${endX} ${endY}`;
                return (
                  <g>
                    <path
                      d={pathData}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      strokeDasharray="6 4"
                      className="animate-pulse"
                    />
                    <circle cx={endX} cy={endY} r="5" fill="#f59e0b" />
                  </g>
                );
              })()}
            </svg>

            {/* Nodes Container */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              {(builderNodes || []).map((node) => (
                <NodeCard
                  key={node.id}
                  node={node}
                  isSelected={selectedNodeId === node.id}
                  isConnectingFromMe={connectingFromNodeId === node.id}
                  canAcceptConnection={
                    connectingFromNodeId !== null &&
                    connectingFromNodeId !== node.id &&
                    node.type !== 'trigger'
                  }
                  onSelect={(id) => {
                    if (connectingFromNodeId && connectingFromNodeId !== id) {
                      handleEndConnect(id);
                    } else {
                      setSelectedNodeId(id);
                    }
                  }}
                  onDelete={handleDeleteNode}
                  onDuplicate={handleDuplicateNode}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  onStartConnect={handleStartConnect}
                  onEndConnect={handleEndConnect}
                />
              ))}
            </div>
          </div>

          {/* Empty State Banner if no nodes exist */}
          {(!builderNodes || builderNodes.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none z-10">
              <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur text-center pointer-events-auto">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                  <Layers className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {t('مساحة العمل فارغة حالياً', 'Canvas is Currently Empty')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                  {t(
                    'ابدأ بإنشاء مسارك المخصص عبر إضافة عقد من المكتبة أو تحميل مسار افتراضي بضغطة زر.',
                    'Start building your workflow by adding nodes from catalog or load a sample flow with one click.'
                  )}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('إنشاء مسار جديد', 'New Workflow')}</span>
                  </button>
                  <button
                    onClick={() => setIsNodePaletteOpen(true)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-emerald-500" />
                    <span>{t('إضافة عقدة', 'Add Node')}</span>
                  </button>
                  <button
                    onClick={handleLoadSampleWorkflow}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{t('تحميل مسار تجريبي', 'Load Sample Flow')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Floating Zoom & Pan Controls */}
          <div className="absolute bottom-5 left-5 rtl:right-5 rtl:left-auto flex items-center gap-1 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-lg backdrop-blur z-20 text-xs">
            <button
              onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-500">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.max(0.45, z - 0.1))}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleFitView}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title={t('توسيط وملاءمة الشاشة', 'Fit and Center')}
            >
              <Compass className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title={t('إعادة ضبط العرض والموضع', 'Reset View')}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Node Library Drawer (Slide-over drawer on Mobile, persistent side panel on Desktop) */}
        {isNodePaletteOpen && (
          <>
            {/* Mobile backdrop */}
            <div
              onClick={() => setIsNodePaletteOpen(false)}
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs lg:hidden animate-in fade-in"
              aria-hidden="true"
            />
            <aside
              id="node_library_palette"
              className="fixed inset-y-0 end-0 z-40 w-full sm:w-80 max-w-[85vw] lg:static lg:w-80 border-s border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl flex flex-col shrink-0 animate-in slide-in-from-right"
            >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('مكتبة العقد المتاحة', 'Node Catalog')}
                </h3>
              </div>
              <button
                onClick={() => setIsNodePaletteOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1 text-[11px]">
              <button
                onClick={() => setActiveCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  activeCategoryFilter === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {t('الكل', 'All')}
              </button>
              <button
                onClick={() => setActiveCategoryFilter('trigger')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  activeCategoryFilter === 'trigger'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                Triggers
              </button>
              <button
                onClick={() => setActiveCategoryFilter('ai')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  activeCategoryFilter === 'ai'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                }`}
              >
                AI Nodes
              </button>
              <button
                onClick={() => setActiveCategoryFilter('logic')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  activeCategoryFilter === 'logic'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
              >
                Logic
              </button>
              <button
                onClick={() => setActiveCategoryFilter('action')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  activeCategoryFilter === 'action'
                    ? 'bg-sky-600 text-white'
                    : 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                }`}
              >
                Actions
              </button>
            </div>

            {/* Nodes List */}
            <div className="p-3 space-y-2 overflow-y-auto flex-1">
              {filteredPaletteNodes.map((def, idx) => (
                <div
                  key={idx}
                  onClick={() => handleAddNodeFromPalette(def)}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                      {language === 'ar' ? def.nameAr : def.name}
                    </span>
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-500">
                      {def.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {language === 'ar' ? def.descriptionAr : def.description}
                  </p>
                </div>
              ))}
            </div>
          </aside>
          </>
        )}

        {/* Active Node Configuration Drawer */}
        {selectedNodeId && (
          <NodeConfigDrawer
            nodeId={selectedNodeId}
            onClose={() => setSelectedNodeId(null)}
            onUpdateNode={handleUpdateNode}
          />
        )}
      </div>

      {/* AI Workflow Generator Modal */}
      <AiWorkflowGeneratorModal
        isOpen={isAiGeneratorOpen}
        onClose={() => setIsAiGeneratorOpen(false)}
        onGenerated={(nodes, edges, name, nameAr) => {
          setBuilderNodes(nodes);
          setBuilderEdges(edges);
          if (selectedWorkflow) {
            saveWorkflow({
              ...selectedWorkflow,
              name,
              nameAr,
              nodes,
              edges
            });
          }
        }}
      />

      {/* Execution Simulator Modal */}
      <ExecutionSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        nodes={builderNodes}
        workflowName={selectedWorkflow?.nameAr || selectedWorkflow?.name || 'Workflow'}
      />

      {/* Create Workflow Modal */}
      <CreateWorkflowModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Save Success Toast */}
      {isSaveSuccessToast && (
        <div className="fixed bottom-6 right-6 rtl:left-6 rtl:right-auto px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-2 text-xs font-bold z-50 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{t('تم حفظ المسار بنجاح!', 'Workflow Saved Successfully!')}</span>
        </div>
      )}
    </div>
  );
};
