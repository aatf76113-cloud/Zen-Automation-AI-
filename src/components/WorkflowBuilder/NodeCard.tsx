import React from 'react';
import {
  Webhook,
  Clock,
  UserPlus,
  FileText,
  MessageSquare,
  Mail,
  Bot,
  Smile,
  Sparkles,
  Tag,
  Wand2,
  Languages,
  GitBranch,
  Filter,
  Hourglass,
  Network,
  Send,
  MailCheck,
  UserCheck,
  BellRing,
  Globe,
  Database,
  Trash2,
  Copy,
  Settings2
} from 'lucide-react';
import { WorkflowNode, NodeType } from '../../types';
import { useApp } from '../../context/AppContext';

interface NodeCardProps {
  node: WorkflowNode;
  isSelected: boolean;
  isExecuting?: boolean;
  isConnectingFromMe?: boolean;
  canAcceptConnection?: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onTouchStart?: (e: React.TouchEvent, id: string) => void;
  onStartConnect?: (sourceNodeId: string) => void;
  onEndConnect?: (targetNodeId: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Webhook: <Webhook className="w-4 h-4" />,
  Clock: <Clock className="w-4 h-4" />,
  UserPlus: <UserPlus className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />,
  MessageSquare: <MessageSquare className="w-4 h-4" />,
  Mail: <Mail className="w-4 h-4" />,
  Bot: <Bot className="w-4 h-4" />,
  Smile: <Smile className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  Tag: <Tag className="w-4 h-4" />,
  Wand2: <Wand2 className="w-4 h-4" />,
  Languages: <Languages className="w-4 h-4" />,
  GitBranch: <GitBranch className="w-4 h-4" />,
  Filter: <Filter className="w-4 h-4" />,
  Hourglass: <Hourglass className="w-4 h-4" />,
  Network: <Network className="w-4 h-4" />,
  Send: <Send className="w-4 h-4" />,
  MailCheck: <MailCheck className="w-4 h-4" />,
  UserCheck: <UserCheck className="w-4 h-4" />,
  BellRing: <BellRing className="w-4 h-4" />,
  Globe: <Globe className="w-4 h-4" />,
  Database: <Database className="w-4 h-4" />
};

export const NodeCard: React.FC<NodeCardProps> = ({
  node,
  isSelected,
  isExecuting,
  isConnectingFromMe,
  canAcceptConnection,
  onSelect,
  onDelete,
  onDuplicate,
  onMouseDown,
  onTouchStart,
  onStartConnect,
  onEndConnect
}) => {
  const { language } = useApp();

  const getBadgeStyle = (type: NodeType) => {
    switch (type) {
      case 'trigger':
        return {
          border: 'border-emerald-500/30',
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-500 dark:text-emerald-400',
          label: language === 'ar' ? 'نقطة انطلاق (Trigger)' : 'TRIGGER',
          dotColor: 'bg-emerald-500'
        };
      case 'ai':
        return {
          border: 'border-purple-500/30',
          bg: 'bg-purple-500/10',
          text: 'text-purple-600 dark:text-purple-400',
          label: language === 'ar' ? 'معالجة ذكية (AI Node)' : 'AI COGNITION',
          dotColor: 'bg-purple-500'
        };
      case 'logic':
        return {
          border: 'border-amber-500/30',
          bg: 'bg-amber-500/10',
          text: 'text-amber-600 dark:text-amber-400',
          label: language === 'ar' ? 'شرط وتحكم (Logic)' : 'LOGIC & ROUTE',
          dotColor: 'bg-amber-500'
        };
      case 'action':
        return {
          border: 'border-sky-500/30',
          bg: 'bg-sky-500/10',
          text: 'text-sky-600 dark:text-sky-400',
          label: language === 'ar' ? 'إجراء تنفيذي (Action)' : 'ACTION',
          dotColor: 'bg-sky-500'
        };
      default:
        return {
          border: 'border-slate-500/30',
          bg: 'bg-slate-500/10',
          text: 'text-slate-600 dark:text-slate-400',
          label: language === 'ar' ? 'عقدة مخصصة' : 'CUSTOM',
          dotColor: 'bg-slate-500'
        };
    }
  };

  const badge = getBadgeStyle(node.type);
  const posX = node.position?.x ?? 50;
  const posY = node.position?.y ?? 100;

  return (
    <div
      id={`node_${node.id}`}
      style={{
        transform: `translate(${posX}px, ${posY}px)`,
        touchAction: 'none'
      }}
      className={`absolute w-72 rounded-2xl border shadow-lg cursor-grab active:cursor-grabbing transition-shadow select-none group ${
        isExecuting
          ? 'ring-4 ring-emerald-400 ring-offset-2 ring-offset-slate-900 border-emerald-400 shadow-emerald-500/40 animate-pulse'
          : isSelected
          ? 'ring-2 ring-emerald-500 border-emerald-500 dark:border-emerald-400 shadow-xl'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      onMouseDown={(e) => onMouseDown(e, node.id)}
      onTouchStart={(e) => onTouchStart && onTouchStart(e, node.id)}
    >
      {/* Input Port Connector */}
      {node.type !== 'trigger' && (
        <button
          type="button"
          title={language === 'ar' ? 'نقطة الاستقبال - انقر للربط' : 'Input port - Click to connect'}
          onClick={(e) => {
            e.stopPropagation();
            onEndConnect?.(node.id);
          }}
          className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center shadow-md z-10 touch-manipulation ${
            canAcceptConnection
              ? 'bg-emerald-500 border-white ring-4 ring-emerald-400/60 scale-125 animate-bounce'
              : 'bg-slate-100 dark:bg-slate-800 border-emerald-500 hover:bg-emerald-500/30 hover:scale-110 active:scale-125'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${canAcceptConnection ? 'bg-white' : 'bg-emerald-500'}`} />
        </button>
      )}

      {/* Output Port Connector */}
      <button
        type="button"
        title={language === 'ar' ? 'نقطة المخرج - انقر لبدء الربط' : 'Output port - Click to connect from here'}
        onClick={(e) => {
          e.stopPropagation();
          onStartConnect?.(node.id);
        }}
        className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center shadow-md z-10 touch-manipulation ${
          isConnectingFromMe
            ? 'bg-amber-500 border-white ring-4 ring-amber-400/50 scale-125'
            : 'bg-slate-100 dark:bg-slate-800 border-emerald-500 hover:bg-emerald-500/30 hover:scale-110 active:scale-125'
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${isConnectingFromMe ? 'bg-white' : 'bg-emerald-500'}`} />
      </button>

      {/* Node Header */}
      <div className="p-3.5 pb-2.5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center ${badge.bg} ${badge.text}`}
            >
              {(node.icon && ICON_MAP[node.icon]) || <Sparkles className="w-4 h-4" />}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {badge.label}
              </span>
            </div>
          </div>

          {/* Quick Node Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(node.id);
              }}
              title={language === 'ar' ? 'نسخ العقدة' : 'Duplicate'}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
              title={language === 'ar' ? 'حذف العقدة' : 'Delete'}
              className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Node Title & Description */}
        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
          {language === 'ar' ? (node.nameAr || node.name || 'عقدة جديدة') : (node.name || node.nameAr || 'Node')}
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
          {language === 'ar' ? (node.descriptionAr || node.description || '') : (node.description || node.descriptionAr || '')}
        </p>
      </div>

      {/* Node Config Preview Footer */}
      <div className="px-3.5 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-2xl flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
        <span className="font-mono truncate max-w-[170px]">
          {node.subType}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(node.id);
          }}
          className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
        >
          <Settings2 className="w-3 h-3" />
          <span>{language === 'ar' ? 'تعديل' : 'Config'}</span>
        </button>
      </div>
    </div>
  );
};
