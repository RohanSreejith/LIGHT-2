import React, { useEffect, useRef } from 'react';

interface Log {
    timestamp: string;
    agent: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
}

interface NeuralLinkProps {
    logs: Log[];
}

// Agent color map using pastel palette
const AGENT_COLORS: Record<string, { border: string; dot: string; label: string }> = {
    System: { border: 'border-blue-400', dot: 'bg-blue-500', label: 'text-blue-600' },
    Legal: { border: 'border-amber-400', dot: 'bg-amber-500', label: 'text-amber-600' },
    Risk: { border: 'border-red-400', dot: 'bg-red-500', label: 'text-red-500' },
    Ethics: { border: 'border-purple-400', dot: 'bg-purple-500', label: 'text-purple-600' },
    Confidence: { border: 'border-cyan-400', dot: 'bg-cyan-500', label: 'text-cyan-600' },
};

const getAgentColors = (agent: string) =>
    AGENT_COLORS[agent] ?? { border: 'border-border-grey', dot: 'bg-slate-400', label: 'text-text-muted' };

// Renders a single log message — parses JSON into rich UI, falls back to plain text
const LogContent: React.FC<{ agent: string; msg: string }> = ({ agent, msg }) => {
    try {
        const jsonMatch = msg.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);

            if (agent === 'Legal') {
                return (
                    <div className="space-y-2 text-[11px] font-mono text-slate-700">
                        {parsed.sections && Array.isArray(parsed.sections) && (
                            <div>
                                <div className="text-amber-600 font-semibold mb-1">📋 Applicable Sections:</div>
                                <div className="pl-2 border-l-2 border-amber-200 ml-1 space-y-0.5">
                                    {parsed.sections.slice(0, 3).map((sec: string, i: number) => (
                                        <div key={i} className="text-slate-600">§ {sec}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {parsed.reasoning && (
                            <div>
                                <div className="text-blue-600 font-semibold mb-0.5">💡 Reasoning:</div>
                                <div className="pl-2 text-slate-600 leading-relaxed font-sans text-xs">{parsed.reasoning}</div>
                            </div>
                        )}
                    </div>
                );
            }

            if (agent === 'Risk') {
                return (
                    <div className="space-y-2 text-[11px] font-mono text-slate-700">
                        {parsed.severity && (
                            <div className="flex items-center gap-2">
                                <span className="text-red-500 font-semibold">⚠️ Severity:</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${parsed.severity.toLowerCase().includes('high') ? 'bg-red-100 text-red-600'
                                        : parsed.severity.toLowerCase().includes('med') ? 'bg-amber-100 text-amber-600'
                                            : 'bg-green-100 text-green-600'
                                    }`}>{parsed.severity}</span>
                            </div>
                        )}
                        {parsed.concerns && (
                            <div className="pl-2 border-l-2 border-red-200 ml-1 mt-1 text-slate-600">
                                {(Array.isArray(parsed.concerns) ? parsed.concerns : [parsed.concerns]).map((c: string, i: number) => (
                                    <div key={i} className="mb-1">• {c}</div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            }

            if (agent === 'Ethics') {
                return (
                    <div className="flex flex-col gap-1.5 text-[11px] font-mono text-slate-700">
                        <div className="flex items-center gap-2">
                            <span className="text-purple-600 font-semibold">🛡️ Veto:</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${parsed.veto ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                }`}>{parsed.veto ? 'BLOCKED' : 'APPROVED'}</span>
                        </div>
                        {parsed.reason && <div className="pl-2 border-l-2 border-purple-200 ml-1 text-slate-600">{parsed.reason}</div>}
                    </div>
                );
            }

            if (agent === 'Confidence') {
                const score = Number(parsed.score ?? 0);
                return (
                    <div className="space-y-2 text-[11px] font-mono text-slate-700">
                        <div className="flex items-center gap-2">
                            <span className="text-cyan-600 font-semibold">📊 Score:</span>
                            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                                <div
                                    className={`h-full transition-all ${score >= 70 ? 'bg-status-online' : score >= 40 ? 'bg-amber-400' : 'bg-red-500'}`}
                                    style={{ width: `${Math.min(score, 100)}%` }}
                                />
                            </div>
                            <span className="text-slate-800 font-bold">{score}%</span>
                        </div>
                        {parsed.reasoning && <div className="text-slate-600 pl-2 border-l-2 border-cyan-200 ml-1 leading-relaxed">{parsed.reasoning}</div>}
                    </div>
                );
            }

            // Fallback JSON display (other agents)
            return (
                <div className="text-[10px] font-mono text-slate-500 bg-slate-50 rounded p-2 border border-slate-100 leading-snug break-all">
                    {JSON.stringify(parsed)}
                </div>
            );
        }
    } catch { /* Not JSON — render as plain text */ }

    return <span className="break-words text-slate-600 font-mono text-[11px]">{msg}</span>;
};

export const NeuralLink: React.FC<NeuralLinkProps> = ({ logs }) => {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="h-full flex flex-col text-text-slate bg-primary-bg overflow-hidden relative">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border-grey bg-surface-white flex items-center gap-3 shrink-0 z-10 shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-accent-lavender/10 flex items-center justify-center text-[13px] text-accent-lavender font-mono font-bold shadow-sm">
                    {'{ }'}
                </div>
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-text-slate">Live Stream of Thought</div>
                    <div className="text-[9px] text-text-muted">Agent Workflow Graph</div>
                </div>
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-lavender shadow-[0_0_5px_rgba(124,58,237,0.5)] animate-pulse" />
            </div>

            {/* Log stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-0.5 custom-scrollbar relative">
                {/* Connecting Line Background */}
                <div className="absolute left-[27px] top-6 bottom-4 w-px bg-border-grey/60 z-0"></div>

                {logs.length === 0 && (
                    <div className="text-center mt-10 text-text-muted text-[10px] uppercase tracking-widest font-semibold opacity-60">
                        Awaiting pipeline activity...
                    </div>
                )}

                {logs.map((log, idx) => {
                    const colors = getAgentColors(log.agent);
                    return (
                        <div
                            key={idx}
                            className="relative pl-[38px] pb-4 animate-[shatter_0.4s_ease-out_reverse_forwards]"
                        >
                            {/* Dot on the connecting line */}
                            <div className={`absolute left-[7px] top-1.5 w-3 h-3 rounded-full border-2 border-primary-bg ${colors.dot} z-10 shadow-sm`} />

                            {/* Node Card */}
                            <div className={`bg-surface-white rounded-xl p-3 border shadow-sm ${colors.border}`}>
                                {/* Header */}
                                <div className="flex items-center justify-between mb-2 pb-2 border-b border-border-grey/50">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${colors.label}`}>
                                        {log.agent} Node
                                    </span>
                                    <span className="text-[9px] text-text-muted font-mono">{log.timestamp}</span>
                                </div>

                                {/* Content */}
                                <div>
                                    <LogContent agent={log.agent} msg={log.message} />
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div ref={endRef} />
            </div>
        </div>
    );
};
