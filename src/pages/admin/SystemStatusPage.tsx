import { useState, useEffect } from 'react'
import {
  CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  Database, HardDrive, ShieldCheck, KeyRound, ExternalLink,
  BookOpen
} from 'lucide-react'
import { runSystemDiagnostics, type SystemHealthReport, type DiagnosticItem } from '../../lib/supabaseHealth'

export default function SystemStatusPage() {
  const [report, setReport] = useState<SystemHealthReport | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDiagnostics = async () => {
    setLoading(true)
    try {
      const res = await runSystemDiagnostics()
      setReport(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiagnostics()
  }, [])

  const getStatusBadge = (status: DiagnosticItem['status']) => {
    switch (status) {
      case 'ok':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-heading font-semibold">
            <CheckCircle2 size={12} />
            OK
          </span>
        )
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-heading font-semibold">
            <AlertTriangle size={12} />
            WARNING
          </span>
        )
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-heading font-semibold">
            <XCircle size={12} />
            ERROR
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-offwhite/50 text-xs font-heading">
            TESTING
          </span>
        )
    }
  }

  const databaseItems = report?.items.filter((i) => i.category === 'database') || []
  const storageItems = report?.items.filter((i) => i.category === 'storage') || []
  const authItems = report?.items.filter((i) => i.category === 'auth') || []
  const envItems = report?.items.filter((i) => i.category === 'environment') || []

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="px-2.5 py-1 rounded-md bg-orange/10 border border-orange/30 text-orange text-[10px] font-heading font-bold uppercase tracking-widest">
              Diagnostics
            </span>
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-offwhite">
              Supabase System Health
            </h1>
          </div>
          <p className="text-gray-muted text-xs sm:text-sm max-w-2xl">
            Live diagnostic inspection of database connectivity, schema tables, storage buckets, and authentication subsystems.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDiagnostics}
            disabled={loading}
            className="btn-primary rounded-xl text-xs px-4 py-2.5 flex items-center gap-2"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Testing...' : 'Re-test System'}</span>
          </button>
        </div>
      </div>

      {/* Overall Status Banner */}
      {report && (
        <div
          className={`rounded-2xl p-6 md:p-8 border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
            report.overallStatus === 'connected'
              ? 'bg-emerald-950/20 border-emerald-500/30'
              : report.overallStatus === 'unconfigured'
              ? 'bg-amber-950/20 border-amber-500/40'
              : 'bg-red-950/20 border-red-500/40'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                report.overallStatus === 'connected'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : report.overallStatus === 'unconfigured'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {report.overallStatus === 'connected' ? (
                <CheckCircle2 size={24} />
              ) : report.overallStatus === 'unconfigured' ? (
                <KeyRound size={24} />
              ) : (
                <AlertTriangle size={24} />
              )}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-heading font-bold text-xl text-offwhite uppercase">
                  {report.overallStatus === 'connected'
                    ? 'All Systems Operational'
                    : report.overallStatus === 'unconfigured'
                    ? 'Supabase Not Configured'
                    : 'System Requires Configuration / Migration'}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-offwhite/70 mt-1 max-w-2xl leading-relaxed">
                {report.overallStatus === 'connected'
                  ? 'Your Patizan Records web application is actively communicating with Supabase. Database tables and storage buckets are verified.'
                  : report.overallStatus === 'unconfigured'
                  ? 'The application is running with placeholder credentials. To connect to your Supabase project, follow the setup guide.'
                  : 'Some database tables or storage buckets are missing in your Supabase project. Run the master SQL setup script.'}
              </p>
              <p className="text-[11px] font-mono text-offwhite/40 mt-2">
                Project Endpoint: {report.supabaseUrl || 'None'}
              </p>
            </div>
          </div>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-offwhite text-xs font-heading font-semibold tracking-wider uppercase inline-flex items-center gap-2 shrink-0 transition-colors"
          >
            <span>Supabase Dashboard</span>
            <ExternalLink size={13} />
          </a>
        </div>
      )}

      {/* Grid of Subsystems */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Environment Credentials */}
        <div className="bg-charcoal border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <KeyRound size={18} className="text-orange" />
              <h3 className="font-heading font-bold text-sm text-offwhite uppercase">Environment</h3>
            </div>
            {envItems[0] && getStatusBadge(envItems[0].status)}
          </div>
          <p className="text-xs text-offwhite/60 leading-relaxed mb-3">
            {envItems[0]?.message || 'Checking environment credentials...'}
          </p>
          <div className="pt-3 border-t border-white/10 text-[11px] font-mono text-offwhite/40">
            .env ➔ VITE_SUPABASE_URL
          </div>
        </div>

        {/* Database Connectivity */}
        <div className="bg-charcoal border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database size={18} className="text-gold" />
              <h3 className="font-heading font-bold text-sm text-offwhite uppercase">Database</h3>
            </div>
            {databaseItems[0] && getStatusBadge(databaseItems[0].status)}
          </div>
          <p className="text-xs text-offwhite/60 leading-relaxed mb-3">
            {databaseItems[0]?.message || 'Testing PostgreSQL connection...'}
          </p>
          <div className="pt-3 border-t border-white/10 text-[11px] font-mono text-offwhite/40 flex items-center justify-between">
            <span>PostgreSQL Engine</span>
            {databaseItems[0]?.latencyMs !== undefined && (
              <span>{databaseItems[0].latencyMs}ms</span>
            )}
          </div>
        </div>

        {/* Authentication */}
        <div className="bg-charcoal border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              <h3 className="font-heading font-bold text-sm text-offwhite uppercase">Auth Service</h3>
            </div>
            {authItems[0] && getStatusBadge(authItems[0].status)}
          </div>
          <p className="text-xs text-offwhite/60 leading-relaxed mb-3">
            {authItems[0]?.message || 'Checking Supabase Auth API...'}
          </p>
          <div className="pt-3 border-t border-white/10 text-[11px] font-mono text-offwhite/40 flex items-center justify-between">
            <span>JWT / GoTrue</span>
            {authItems[0]?.latencyMs !== undefined && (
              <span>{authItems[0].latencyMs}ms</span>
            )}
          </div>
        </div>
      </div>

      {/* Database Tables Inventory */}
      <div className="bg-charcoal border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-orange" />
            <h3 className="font-heading font-bold text-base text-offwhite">
              Database Tables Inventory ({databaseItems.length - 1} Tables)
            </h3>
          </div>
          <span className="text-xs font-mono text-offwhite/40">PostgreSQL Schema Check</span>
        </div>

        <div className="divide-y divide-white/5">
          {databaseItems.slice(1).map((item) => (
            <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
              <div>
                <p className="font-heading font-semibold text-sm text-offwhite">{item.name}</p>
                <p className="text-xs text-offwhite/50">{item.message}</p>
                {item.details && (
                  <p className="text-[11px] text-amber-400/80 font-mono mt-0.5">{item.details}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {item.latencyMs !== undefined && (
                  <span className="text-[11px] font-mono text-offwhite/40">{item.latencyMs}ms</span>
                )}
                {getStatusBadge(item.status)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Storage Buckets Inventory */}
      <div className="bg-charcoal border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive size={16} className="text-gold" />
            <h3 className="font-heading font-bold text-base text-offwhite">
              Storage Buckets Inventory ({storageItems.length} Buckets)
            </h3>
          </div>
          <span className="text-xs font-mono text-offwhite/40">Supabase Storage</span>
        </div>

        <div className="divide-y divide-white/5">
          {storageItems.map((item) => (
            <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
              <div>
                <p className="font-heading font-semibold text-sm text-offwhite">{item.name}</p>
                <p className="text-xs text-offwhite/50">{item.message}</p>
                {item.details && (
                  <p className="text-[11px] text-amber-400/80 font-mono mt-0.5">{item.details}</p>
                )}
              </div>
              <div className="shrink-0">
                {getStatusBadge(item.status)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Setup Guide Link Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-navy via-charcoal to-black border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <BookOpen size={22} className="text-orange shrink-0 mt-1" />
          <div>
            <h4 className="font-heading font-bold text-base text-offwhite">
              Need to initialize or re-apply database migrations?
            </h4>
            <p className="text-xs text-offwhite/60 mt-1">
              Read <code className="text-orange font-mono">SUPABASE_SETUP.md</code> and run <code className="text-orange font-mono">supabase/setup_complete.sql</code> in your Supabase SQL Editor.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
