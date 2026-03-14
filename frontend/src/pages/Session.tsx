import React, { useState, useRef, useEffect } from 'react';
import { useSession } from '../state/SessionContext';
import { Send, AlertTriangle, Shield, Mic, Volume2, RefreshCw, CheckCircle2, BookOpen, Download, Paperclip, X, Printer, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { NeuralLink } from '../components/NeuralLink';



// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Renders a single assistant message
// -----------------------------------------------------------------------------
const FormattedMessage: React.FC<{
    text: string;
    onSpeak?: (text: string) => void;
    questions?: string[];
    sections?: string[];
    downloadUrl?: string;
    qrCode?: string;
}> = ({ text, onSpeak, questions, sections, downloadUrl, qrCode }) => {

    if (questions && questions.length > 0) {
        return (
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-gov-gold text-xs font-bold uppercase tracking-widest">
                    <RefreshCw size={13} className="animate-spin" />
                    Additional information needed
                </div>
                <div className="space-y-2">
                    {questions.map((q, i) => (
                        <div key={i} className="p-3 bg-accent-lavender/5 border border-accent-lavender/20 rounded-lg text-text-slate text-sm leading-relaxed">
                            {q}
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-text-muted">Please reply with the details above.</p>
            </div>
        );
    }

    if (!text) return <div className="text-text-muted text-sm italic">Processing...</div>;

    const renderInline = (txt: string, key: number): React.ReactNode => {
        const parts = txt.split(/(\*\*[^*]+\*\*)/g);
        return (
            <span key={key}>
                {parts.map((p: string, pi: number) =>
                    p.startsWith('**') && p.endsWith('**')
                        ? <strong key={pi} className="text-text-slate font-semibold">{p.slice(2, -2)}</strong>
                        : <span key={pi}>{p}</span>
                )}
            </span>
        );
    };

    const renderMarkdown = (raw: string): React.ReactNode => {
        const lines2 = raw.split('\n');
        const elems: React.ReactNode[] = [];
        const items: React.ReactNode[] = [];
        let ltype: 'ol' | 'ul' | null = null;
        const flush = (): void => {
            if (items.length) {
                elems.push(ltype === 'ol'
                    ? <ol key={`l${elems.length} `} className="list-decimal pl-5 space-y-0.5 my-1 text-sm text-text-slate">{[...items]}</ol>
                    : <ul key={`l${elems.length} `} className="list-disc pl-5 space-y-0.5 my-1 text-sm text-text-slate">{[...items]}</ul>);
                items.length = 0; ltype = null;
            }
        };
        lines2.forEach((line: string, i: number) => {
            const nm = line.match(/^(\d+)\.\s+(.*)/);
            const bm = line.match(/^[-*]\s+(.*)/);
            if (nm) { if (ltype !== 'ol') { flush(); ltype = 'ol'; } items.push(<li key={i}>{renderInline(nm[2], i)}</li>); }
            else if (bm) { if (ltype !== 'ul') { flush(); ltype = 'ul'; } items.push(<li key={i}>{renderInline(bm[1], i)}</li>); }
            else { flush(); if (line.trim()) elems.push(<p key={i} className="text-sm text-text-slate leading-relaxed">{renderInline(line, i)}</p>); }
        });
        flush();
        return <div className="space-y-1">{elems}</div>;
    };

    return (
        <div className="flex flex-col gap-3">
            {renderMarkdown(text)}

            {sections && sections.length > 0 && (
                <div className="mt-1 p-3 bg-white/5 border border-white/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <BookOpen size={11} className="text-gov-gold" />
                        <span className="text-[9px] uppercase tracking-widest text-gov-gold font-bold">Applicable Statutes</span>
                    </div>
                    <ul className="space-y-1">
                        {sections.slice(0, 4).map((s, i) => (
                            <li key={i} className="text-[11px] text-gov-text-muted leading-snug flex gap-2">
                                <span className="text-gov-gold shrink-0">�</span>
                                <span>{s}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {qrCode && (
                <div className="mt-2 p-3 bg-white border border-gov-gold/30 rounded-lg flex flex-col items-center gap-2">
                    <img src={qrCode} alt="Scan to Phone" className="w-32 h-32" />
                    <span className="text-[10px] text-gov-navy font-bold uppercase">Scan to get on Phone</span>
                </div>
            )}

            {(qrCode || downloadUrl) && (
                <div className="mt-3 p-3 bg-gov-navy/20 border border-gov-gold/20 rounded-lg flex flex-col gap-2">
                    <span className="text-[9px] uppercase tracking-widest text-gov-gold font-bold">Share via SMS</span>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="+91 Phone Number"
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-gov-text outline-none focus:border-gov-gold/50 flex-1"
                            id={`sms - phone - ${downloadUrl || 'inst'} `}
                        />
                        <button
                            onClick={async () => {
                                const input = document.getElementById(`sms - phone - ${downloadUrl || 'inst'} `) as HTMLInputElement;
                                const phone = input?.value;
                                if (!phone) return alert("Please enter a phone number");

                                const msg = `L.I.G.H.T Update: ${text.slice(0, 100)}... ${downloadUrl ? `Download Link: http://${window.location.hostname}:8000${downloadUrl}` : ''} `;

                                try {
                                    const res = await fetch('/api/share-sms', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ phone, message: msg })
                                    });
                                    if (res.ok) {
                                        alert("Instructions shared successfully!");
                                        input.value = "";
                                    }
                                } catch (e) { console.error("SMS failed", e); }
                            }}
                            className="bg-gov-gold text-gov-navy px-3 py-1 rounded text-[10px] font-bold uppercase hover:bg-yellow-400 transition-colors flex items-center gap-1"
                        >
                            <Send size={10} /> Share
                        </button>
                    </div>
                </div>
            )}

            {downloadUrl && !qrCode && (
                <div className="flex flex-row gap-2 mt-2">
                    <a
                        href={`http://localhost:8000${downloadUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-accent-lavender text-white px-5 py-2.5 rounded-full font-bold text-xs uppercase hover:bg-violet-500 transition-colors shadow-sm"
                    >
                        <Download size={13} /> Download
                    </a>
                    <button
                        onClick={() => alert("Printing service initialized (Mock)")}
                        className="inline-flex items-center gap-2 bg-surface-white text-text-slate border border-border-grey px-5 py-2.5 rounded-full font-bold text-xs uppercase hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <Printer size={13} /> Print
                    </button>
                </div>
            )}

            <button
                onClick={() => onSpeak?.(text)}
                className="mt-2 self-start text-[10px] text-accent-lavender uppercase hover:underline flex flex-row items-center gap-1 font-bold"
            >
                <Volume2 size={11} /> Audio Playback
            </button>
        </div>
    );
};


// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Session Page

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface Message {
    role: 'user' | 'assistant';
    text: string;
    questions?: string[];
    sections?: string[];
    downloadUrl?: string;
    qrCode?: string;
    isWelcome?: boolean;  // Excluded from API history to prevent classifier confusion
}



export const Session: React.FC = () => {

    const { addLog, endSession, startSession, isActive, logs, sessionId } = useSession();

    const [input, setInput] = useState("");

    const WELCOME_MESSAGE: Message = {
        role: 'assistant',
        isWelcome: true,
        text: [
            "👋 **Namaskaram! Welcome to L.I.G.H.T — your Legal Innovation & Government Help Tool.**",
            "",
            "Here's how I can help you today:",
            "",
            "**📝 Ask a Legal or Civic Question**",
            "Type (or speak 🎤) your situation in **English or Malayalam** — I'll identify the relevant laws, IPC/BNS sections, and guide you on next steps.",
            "",
            "**📄 Upload a Document**",
            "Attach a PDF, image, or legal notice using the 📎 button. I'll analyse it and explain it to you in plain language.",
            "",
            "**🗣️ Voice Input**",
            "Tap the microphone button to speak your question — I understand both English and Malayalam.",
            "",
            "Simply describe your situation and I'll take it from there. For example:",
            "• *\"My landlord evicted me without notice\"*",
            "• *\"ഒരാൾ എന്നെ തല്ലി — ഞാൻ എന്ത് ചെയ്യണം?\"*",
            "• *\"I want to update my Aadhaar address\"*",
        ].join('\n'),
    };

    const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);

    const [loading, setLoading] = useState(false);
    const [recording, setRecording] = useState(false);
    const [attachment, setAttachment] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // -----------------------------------------------------------------------------
    // Voice Dictation
    // -----------------------------------------------------------------------------
    const toggleRecording = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            addLog("System", "Speech recognition not supported in this browser.", "error");
            return;
        }

        if (recording) {
            setRecording(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'ml-IN'; // Set to Malayalam (India) for native transcription

        recognition.onstart = () => {
            setRecording(true);
            addLog("System", "Voice dictation started...", "info");
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => (prev ? prev + " " + transcript : transcript));
            setRecording(false);
            addLog("System", "Voice captured successfully.", "info");
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setRecording(false);
            if (event.error !== 'no-speech') {
                addLog("System", `Microphone error: ${event.error}`, "error");
            }
        };

        recognition.onend = () => {
            setRecording(false);
        };

        try {
            recognition.start();
        } catch (e) {
            setRecording(false);
            addLog("System", "Failed to start microphone.", "error");
        }
    };



    const [confidenceScore, setConfidenceScore] = useState(0);

    const [riskLevel, setRiskLevel] = useState("Low");

    const [topCitation, setTopCitation] = useState("Evaluating inputs...");



    useEffect(() => {

        if (!isActive) startSession();

    }, []);



    const navigate = useNavigate();

    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

    useEffect(scrollToBottom, [messages]);



    // â”€â”€ Parse logs to update sidebar widgets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    useEffect(() => {

        if (logs.length === 0) return;



        const confLog = [...logs].reverse().find(l => l.agent === 'Confidence');

        if (confLog) {

            try {

                const p = JSON.parse(confLog.message);

                if (p.score !== undefined) setConfidenceScore(Math.min(Number(p.score), 100));

            } catch { }

        }



        const riskLog = [...logs].reverse().find(l => l.agent === 'Risk');

        if (riskLog) {

            try {

                const p = JSON.parse(riskLog.message);

                if (p.severity) setRiskLevel(p.severity);

            } catch { }

        }



        const legalLog = [...logs].reverse().find(l => l.agent === 'Legal');

        if (legalLog) {

            try {

                const p = JSON.parse(legalLog.message);

                if (p.sections && p.sections.length > 0) setTopCitation(p.sections[0]);

            } catch { }

        }

    }, [logs]);



    // â”€â”€ TTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const playAudio = async (text: string) => {

        try {

            const isMalayalam = /[\u0D00-\u0D7F]/.test(text);

            const response = await fetch('/api/speak', {

                method: 'POST',

                headers: { 'Content-Type': 'application/json' },

                body: JSON.stringify({ text, lang: isMalayalam ? "ml" : "en" })

            });

            if (!response.ok) throw new Error("TTS failed");

            const blob = await response.blob();

            const audio = new Audio(URL.createObjectURL(blob));

            audio.play();

        } catch {

            addLog("System", "Speech playback failed", "error");

        }

    };



    // â”€â”€ Send message â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const handleSend = async (overrideInput?: string) => {
        const messageText = overrideInput || input;
        if ((!messageText.trim() && !attachment) || loading) return;

        setInput("");

        let userText = messageText;
        if (attachment) {
            userText = `📄 Attached: ${attachment.name}\n${messageText}`.trim();
        }

        setMessages(prev => [...prev, { role: 'user', text: userText }]);

        setLoading(true);

        addLog("System", `Query received...`, "info");

        try {
            let response;
            if (attachment) {
                const formData = new FormData();
                formData.append("file", attachment);
                if (messageText.trim()) formData.append("prompt", messageText);

                response = await fetch('/api/analyze-document', {
                    method: 'POST',
                    body: formData
                });
                setAttachment(null);
            } else {
                response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: messageText,
                        history: messages
                            .filter(m => !m.isWelcome)  // exclude welcome message — it confuses the classifier
                            .map(m => ({
                                role: m.role,
                                text: m.text || (m.questions && m.questions.length > 0 ? m.questions[0] : "")
                            })),
                        session_id: sessionId
                    })
                });
            }



            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();



            // Push all backend logs into the session log stream

            if (Array.isArray(data.agent_logs)) {

                data.agent_logs.forEach((l: { agent: string; msg: string }) =>

                    addLog(l.agent, l.msg, l.msg.includes('VETO') || l.msg.includes('REFUS') ? 'error' : 'info')

                );

            }



            const status = data.status ?? "";



            // ── Helper: extract readable string from any field ────────────────

            const asString = (val: unknown): string => {

                if (!val) return "";

                if (typeof val === "string") return val;

                if (typeof val === "object") return JSON.stringify(val);

                return String(val);

            };



            if (status === "REFUSED" || status === "REFUSED_LEGAL_MODE") {

                const reason = asString(data.reason || data.refusal_reason ||

                    "This query cannot be processed by the system.");

                setMessages(prev => [...prev, {

                    role: 'assistant',

                    text: `⚠️ ${reason}`

                }]);



            } else if (status === "NEEDS_INFO") {

                const questions: string[] = Array.isArray(data.questions) ? data.questions : [];

                setMessages(prev => [...prev, {

                    role: 'assistant',

                    text: "",

                    questions

                }]);

                addLog("System", `Clarification needed`, "info");



            } else {

                // SUCCESS — extract advice safely, handling all backend formats

                let advice = "";

                const validatedContent = data.validated_content;



                // Helper: if advice itself looks like JSON (LLM leaked raw response), unwrap it

                const unwrapAdvice = (raw: string): string => {

                    if (!raw || !raw.trim().startsWith("{")) return raw;

                    try {

                        const parsed = JSON.parse(raw);

                        return parsed.response || parsed.advice || parsed.answer || parsed.text || raw;

                    } catch { return raw; }

                };



                if (typeof data.advice === "string" && data.advice) {

                    advice = unwrapAdvice(data.advice);

                } else if (typeof data.response === "string" && data.response) {

                    advice = unwrapAdvice(data.response);

                } else if (validatedContent && typeof validatedContent === "object") {

                    // Old LegalTemplateService format

                    const proc: string[] = validatedContent.mandatory_process || [];

                    const jurisdiction: string = validatedContent.jurisdiction || "India";

                    advice = `Jurisdiction: ${jurisdiction}\n\nNext steps:\n${proc.map((s: string) => `• ${s}`).join("\n")}`;

                } else {

                    advice = "Your query has been processed. Please review the live log on the right for detailed agent outputs.";

                }



                const sections: string[] = Array.isArray(data.sections)

                    ? data.sections

                    : Array.isArray(validatedContent?.applicable_sections)

                        ? validatedContent.applicable_sections

                        : [];



                let qrCodeData = data.qr_code;

                // If we have a download URL but no QR, auto-generate QR for the download link
                if (data.download_url && !qrCodeData) {
                    try {
                        const qrRes = await fetch('/api/generate-qr', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ text: `http://localhost:8000${data.download_url}` })
                        });
                        if (qrRes.ok) {
                            const qrJson = await qrRes.json();
                            qrCodeData = qrJson.qr_code;
                        }
                    } catch (e) { console.error("Auto-QR failed", e); }
                }

                setMessages(prev => [...prev, {
                    role: 'assistant',
                    text: advice,
                    sections,
                    downloadUrl: data.download_url,
                    qrCode: qrCodeData
                }]);

            }



        } catch (e: any) {
            let errorText = "Connection error. Please ensure the backend server is running.";
            if (e.message.includes("HTTP 429")) {
                errorText = "Rate limit exceeded. Please wait a moment before trying again.";
            } else if (e.message.includes("HTTP 500")) {
                errorText = "A backend error occurred. Please try again or check the logs.";
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                text: errorText
            }]);
            addLog("System", `Error: ${e.message}`, "error");
        } finally {
            setLoading(false);
        }

    };





    const handleEnd = () => { endSession(); navigate('/'); };



    return (
        <div className="h-screen w-full flex flex-col bg-primary-bg font-sans select-none text-text-slate">

            {/* NAVBAR */}
            <header className="h-16 shrink-0 border-b border-border-grey bg-surface-white flex items-center justify-between px-6 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-lavender/10 flex items-center justify-center">
                        <Shield size={18} className="text-accent-lavender" />
                    </div>
                    <h1 className="text-text-slate font-semibold tracking-widest text-sm uppercase">L.I.G.H.T 3.0</h1>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-status-online/10 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-status-online shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                        <span className="text-[10px] text-status-online uppercase tracking-widest font-bold">System Online</span>
                    </div>

                    <button
                        onClick={() => navigate('/pipeline')}
                        className="flex items-center gap-2 text-[10px] px-5 py-2 border border-accent-lavender text-accent-lavender hover:bg-accent-lavender hover:text-white rounded-full transition-all uppercase tracking-widest font-bold"
                    >
                        <Activity size={12} />
                        Live Pipeline
                    </button>

                    <button
                        onClick={handleEnd}
                        className="text-[10px] px-5 py-2 border border-border-grey text-text-muted hover:bg-gray-50 hover:text-text-slate rounded-full transition-colors uppercase tracking-widest font-semibold"
                    >
                        End Session
                    </button>
                </div>
            </header>

            {/* 70/30 LAYOUT */}
            <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 gap-6 bg-primary-bg overflow-hidden">

                {/* LEFT: 70% */}
                <section className="flex-[7] flex flex-col gap-4 overflow-hidden">




                    {/* Chat Section */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 pr-2 pb-4 pt-2">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-text-muted gap-3">
                                    <Shield size={32} className="text-border-grey" />
                                    <p className="text-xs uppercase tracking-widest opacity-50 font-semibold">System Standby — Submit a query to begin</p>
                                </div>
                            )}

                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] lg:max-w-[75%] p-5 rounded-2xl relative group transition-all duration-300 ${msg.role === 'user'
                                        ? 'bg-surface-white border border-border-grey shadow-sm text-text-slate rounded-tr-lg'
                                        : 'bg-surface-white border border-border-grey border-l-4 border-l-accent-lavender text-text-slate shadow-sm rounded-tl-lg'
                                        }`}>

                                        {msg.role === 'user' ? (
                                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium text-slate-800">{msg.text}</p>
                                        ) : (
                                            <FormattedMessage
                                                text={msg.text}
                                                onSpeak={playAudio}
                                                questions={msg.questions}
                                                sections={msg.sections}
                                                downloadUrl={msg.downloadUrl}
                                                qrCode={msg.qrCode}
                                            />
                                        )}

                                        <div className={`absolute top-full mt-2 text-[9px] uppercase tracking-tighter text-text-muted opacity-0 group-hover:opacity-100 transition-opacity font-bold ${msg.role === 'user' ? 'right-2' : 'left-2'}`}>
                                            {msg.role === 'user' ? 'Citizen' : 'L.I.G.H.T Agent'}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-surface-white border border-border-grey border-l-4 border-l-accent-lavender p-4 rounded-xl shadow-sm flex flex-col gap-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-1.5 h-1.5 bg-accent-lavender rounded-full animate-typing-dot" style={{ animationDelay: '0s' }} />
                                            <div className="w-1.5 h-1.5 bg-accent-lavender rounded-full animate-typing-dot" style={{ animationDelay: '0.2s' }} />
                                            <div className="w-1.5 h-1.5 bg-accent-lavender rounded-full animate-typing-dot" style={{ animationDelay: '0.4s' }} />
                                        </div>
                                        <span className="text-[9px] uppercase tracking-widest text-text-muted font-bold">L.I.G.H.T is processing</span>
                                    </div>
                                </div>
                            )}

                            <div ref={chatEndRef} />
                        </div>

                        {/* Bottom Input Area */}
                        <div className="bg-surface-white p-2 sm:p-4 flex flex-col gap-2 shrink-0 rounded-[2rem] border border-border-grey shadow-[inset_0_2px_4px_rgba(0,0,0,0.02),0_4px_12px_rgba(0,0,0,0.03)] mt-2 mx-1 relative z-20">
                            {/* Optional Attachment Readout */}
                            {attachment && (
                                <div className="flex items-center justify-between bg-primary-bg border border-border-grey rounded-xl p-2 mb-1 mr-14 ml-4">
                                    <div className="flex items-center gap-2 overflow-hidden text-accent-lavender">
                                        <Paperclip size={14} className="shrink-0" />
                                        <span className="text-xs truncate font-medium">{attachment.name}</span>
                                    </div>
                                    <button onClick={() => setAttachment(null)} className="text-text-muted hover:text-red-400 p-1">
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            <div className="flex gap-2 items-center relative py-1 px-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`p-3 rounded-full transition-colors flex shrink-0 items-center justify-center bg-primary-bg ${attachment ? 'text-accent-lavender border border-accent-lavender/30' : 'text-text-muted hover:bg-slate-100 hover:text-text-slate border border-transparent'}`}
                                    title="Attach Document"
                                >
                                    <Paperclip size={18} strokeWidth={1.5} />
                                </button>
                                
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="Describe your legal or civic situation..."
                                    className="w-full bg-transparent text-text-slate px-2 py-3 text-[15px] focus:outline-none resize-none placeholder-slate-400 leading-relaxed max-h-[120px]"
                                    rows={1}
                                    style={{
                                        minHeight: '48px',
                                        height: input.split('\n').length > 1 ? 'auto' : '48px'
                                    }}
                                />
                                
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={toggleRecording}
                                        className={`p-3 rounded-full transition-all flex items-center justify-center ${recording ? 'bg-red-50 text-red-500 border border-red-200 animate-pulse' : 'bg-primary-bg text-text-muted hover:bg-slate-100 hover:text-text-slate'}`}
                                        title={recording ? "Stop Recording" : "Dictate"}
                                    >
                                        <Mic size={18} strokeWidth={1.5} />
                                    </button>
                                    
                                    <button
                                        onClick={() => handleSend()}
                                        disabled={(!input.trim() && !attachment) || loading}
                                        className="p-3 bg-accent-lavender text-white rounded-full hover:bg-violet-600 transition-all disabled:opacity-50 disabled:bg-border-grey disabled:text-text-muted flex items-center justify-center ml-1 shadow-sm"
                                        title="Send"
                                    >
                                        <Send size={18} strokeWidth={1.5} className="mr-[-2px]" />
                                    </button>
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
                        </div>
                    </div>

                </section>



                {/* RIGHT: 30% */}

                <section className="flex-[3] flex flex-col gap-4 min-w-[280px] max-w-[400px]">



                    {/* Metrics — compact horizontal layout */}

                    <div className="glass-panel p-4 shrink-0 rounded-2xl flex flex-col gap-3">

                        <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest border-b border-border-grey pb-2">Intelligence Metrics</h3>

                        <div className="flex items-center gap-4">

                            {/* Confidence ring — smaller */}

                            <div className="flex flex-col items-center shrink-0">

                                <div className="relative w-14 h-14 flex items-center justify-center">

                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">

                                        <circle cx="24" cy="24" r="21" className="stroke-slate-100 fill-none" strokeWidth="3" />

                                        <circle

                                            cx="24" cy="24" r="21"

                                            className="stroke-accent-lavender fill-none transition-all duration-1000"

                                            strokeWidth="3"

                                            strokeDasharray="131.95"

                                            strokeDashoffset={131.95 - (131.95 * confidenceScore) / 100}

                                            strokeLinecap="round"

                                        />

                                    </svg>

                                    <span className="absolute text-xs font-bold text-text-slate">{confidenceScore}%</span>

                                </div>

                                <span className="text-[9px] uppercase tracking-widest text-text-muted mt-2 font-semibold">Conf.</span>

                            </div>



                            {/* Risk + Latency stacked */}

                            <div className="flex-1 flex flex-col gap-2">

                                <div className="bg-primary-bg rounded-lg border border-border-grey px-3 py-2 flex items-center gap-2">

                                    {riskLevel.toLowerCase().includes('high')

                                        ? <AlertTriangle size={12} className="text-red-500" />

                                        : <CheckCircle2 size={12} className="text-status-online" />}

                                    <span className="text-[10px] text-text-muted font-medium">Risk</span>

                                    <span className={`text-[10px] font-bold ml-auto ${riskLevel.toLowerCase().includes('high') ? 'text-red-500' : 'text-status-online'}`}>{riskLevel}</span>

                                </div>

                                <div className="bg-primary-bg rounded-lg border border-border-grey px-3 py-2 flex items-center gap-2">

                                    <span className="text-[10px] text-text-muted font-medium">Latency</span>

                                    <span className="text-[10px] font-bold text-text-slate ml-auto">~40ms</span>

                                </div>

                            </div>

                        </div>

                    </div>



                    {/* Active Citation — compact */}

                    <div className="glass-panel px-4 py-3 shrink-0 rounded-2xl">

                        <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">Active Citation</h3>

                        <p className="text-xs font-medium text-accent-lavender leading-relaxed line-clamp-2">{topCitation}</p>

                    </div>



                    {/* NeuralLink — gets all remaining space, min 200px */}

                    <div className="glass-panel flex-1 min-h-[220px] rounded-2xl overflow-hidden flex flex-col">

                        <NeuralLink logs={logs} />

                    </div>

                </section>

            </main>

        </div>

    );

};

