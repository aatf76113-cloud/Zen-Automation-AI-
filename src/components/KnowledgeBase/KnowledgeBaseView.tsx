import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  Search,
  CheckCircle2,
  Trash2,
  Sparkles,
  Bot,
  Database,
  ArrowRight,
  Layers,
  Clock
} from 'lucide-react';
import { KnowledgeDoc } from '../../types';
import { useApp } from '../../context/AppContext';

export const KnowledgeBaseView: React.FC = () => {
  const { knowledgeDocs, addKnowledgeDoc, language, t } = useApp();

  const [search, setSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Semantic query tester
  const [testQuery, setTestQuery] = useState('');
  const [retrievalResult, setRetrievalResult] = useState<string | null>(null);

  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsUploading(false);

          const newDoc: KnowledgeDoc = {
            id: `kb_${Date.now()}`,
            title: 'دليل المنتجات والأسعار الجديد 2026.pdf',
            type: 'pdf',
            size: '3.4 MB',
            tokensCount: 45000,
            chunksCount: 148,
            lastUpdated: new Date().toISOString().split('T')[0],
            status: 'ready',
            assignedAgents: ['agent_sales_01', 'agent_support_02'],
            summary: 'Product specifications, pricing tiers, and terms of service.',
            summaryAr: 'مواصفات المنتجات وجداول الأسعار وسياسات الخصم وشروط الخدمة.'
          };
          addKnowledgeDoc(newDoc);
          return 0;
        }
        return p + 25;
      });
    }, 250);
  };

  const handleRunSemanticSearch = () => {
    if (!testQuery.trim()) return;
    setRetrievalResult(
      `[Vector Match - Chunk #14 / Similarity: 0.94]:\n"تتضمن باقة زين للأعمال دعماً فنياً على مدار الساعة 24/7 عبر الواتساب والـ Webhooks بضمان جاهزية 99.9%، مع خصم 20% عند الدفع السنوي."`
    );
  };

  const filtered = knowledgeDocs.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="knowledge_base_view" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold mb-2">
            <Database className="w-3.5 h-3.5" />
            <span>{t('تقنية الاسترجاع المعزز بالذكاء الاصطناعي (RAG)', 'Vector Embeddings & Semantic Search')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t('قاعدة المعرفة والمستندات (Knowledge Base)', 'Knowledge Base & Vectors')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t(
              'ارفع ملفات وسياسات شركتك لتدريب وكلاء الذكاء الاصطناعي لتقديم إجابات دقيقة وموثوقة 100%.',
              'Upload company PDFs, manuals, and spreadsheets to ground AI agents with accurate facts.'
            )}
          </p>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onClick={handleSimulatedUpload}
        className="p-8 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-purple-500/50 bg-white dark:bg-slate-900/60 text-center cursor-pointer transition-all space-y-3 group"
      >
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {isUploading
              ? t(`جارِ تجزئة وتشفير الملفات بالـ Vectors (${uploadProgress}%)...`, `Chunking & Vectorizing (${uploadProgress}%)...`)
              : t('انقر لرفع ملفات الشركة (PDF, DOCX, CSV, TXT)', 'Click or drag company files to upload')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {t('يقوم النظام تلقائيًا بتحويل الملفات إلى Vector Chunks وتمريرها لوكلاء الـ AI', 'Auto-chunking into semantic vectors for Gemini 2.5 grounding')}
          </p>
        </div>
      </div>

      {/* Semantic Search Tester Bar */}
      <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {t('فحص الاسترجاع الدلالي (Test Semantic Retrieval Query)', 'Semantic Retrieval Test')}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder={t('مثال: ما هي شروط الاسترجاع؟ أو ما هي أسعار باقة الشركات؟', 'e.g. What is the SLA guarantee or refund policy?')}
            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleRunSemanticSearch}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors"
          >
            {t('بحث في المعرفة', 'Test Query')}
          </button>
        </div>

        {retrievalResult && (
          <pre className="p-3 rounded-2xl bg-slate-950 text-purple-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800 animate-in fade-in">
            {retrievalResult}
          </pre>
        )}
      </div>

      {/* Uploaded Documents List */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {t('الملفات المفهرسة حالياً', 'Indexed Documents')} ({filtered.length})
          </h3>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('بحث في الملفات...', 'Search docs...')}
              className="w-full pl-8 rtl:pr-8 rtl:pl-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{doc.title}</h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 font-mono">
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span>{doc.chunksCount} Vector Chunks</span>
                    <span>•</span>
                    <span>{doc.lastUpdated}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Ready & Indexed
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
