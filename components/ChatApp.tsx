"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Avatar } from "./Avatar";
import {
  ArchitectureFlow,
  type PipelineState,
  type PipelineStage,
  type StageStatus,
} from "./ArchitectureFlow";
import { Infographic } from "./Infographic";
import { Markdown } from "./Markdown";
import type { Infographic as InfographicData } from "@/lib/text";

type Role = "user" | "assistant";

type UiMessage = {
  id: string;
  role: Role;
  content: string;
  infographic?: InfographicData | null;
};

type MentorEvent =
  | { type: "delta"; text: string }
  | { type: "reset" }
  | { type: "status"; value: "model" | "tool" | "generation" }
  | { type: "tool_result"; found: boolean; fragments: number }
  | {
      type: "done";
      reply: string;
      summary: string;
      suggestions: string[];
      infographic: InfographicData | null;
      usedTool: boolean;
    }
  | { type: "error"; message: string };

type SpeechErrorEvent = { error?: string; message?: string };

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult:
    | ((event: {
        results: { [index: number]: { [index: number]: { transcript: string } }; length: number };
      }) => void)
    | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
};

const STARTER_TOPICS = [
  "¿Qué es RAG y para qué sirve?",
  "Tengo 15 minutos, ¿qué practico de Git?",
  "Explícame los códigos de estado HTTP",
];

const INITIAL_PIPELINE: PipelineState = {
  input: "idle",
  api: "idle",
  prompt: "idle",
  model: "idle",
  tool: "idle",
  retrieval: "idle",
  generation: "idle",
  stream: "idle",
  render: "idle",
  voice: "idle",
};

function getRecognition(): SpeechRec | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

function describeSpeechError(code: string | undefined): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "El navegador bloqueó el micrófono. Ábrelo desde el candado de la barra de direcciones y permite el acceso.";
    case "audio-capture":
      return "No se detectó ningún micrófono conectado.";
    case "no-speech":
      return "No escuché nada. Toca el micrófono y habla un poco más cerca.";
    case "network":
      return "Este navegador no tiene servicio de dictado disponible (pasa en Edge, Brave, Firefox y Arc: el reconocimiento vive en la nube del fabricante). En Chrome funciona; mientras tanto puedes escribir.";
    case "aborted":
      return "";
    default:
      return `No pude usar el micrófono${code ? ` (${code})` : ""}. Escribe el mensaje mientras tanto.`;
  }
}

function voiceQuality(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  const locale = voice.lang.toLowerCase();
  let score = locale === "es-mx" ? 40 : locale.startsWith("es") ? 25 : 0;
  if (voice.localService) score += 10;
  if (/paulina|mónica|monica|soledad|marisol|helena|premium|enhanced|natural|neural/.test(name)) {
    score += 30;
  }
  if (voice.default) score += 3;
  return score;
}

function pickSpanishVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices
      .filter((voice) => voice.lang.toLowerCase().startsWith("es"))
      .sort((a, b) => voiceQuality(b) - voiceQuality(a))[0] ?? null
  );
}

let idSeq = 0;
function nid(): string {
  idSeq += 1;
  return `m-${idSeq}`;
}

export function ChatApp() {
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: "hello",
      role: "assistant",
      content:
        "Hola, soy **Nodi**. Pregúntame de web, git, APIs, seguridad de software o cómo estudiar tecnología. Si tienes 5, 15 o 30 minutos, dime y te propongo un ejercicio.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [usedTool, setUsedTool] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(STARTER_TOPICS);
  const [streamText, setStreamText] = useState("");
  const [toolRunning, setToolRunning] = useState(false);
  const [pipeline, setPipeline] = useState<PipelineState>(INITIAL_PIPELINE);
  const [ragFragments, setRagFragments] = useState<number | null>(null);
  const [inputMode, setInputMode] = useState<"Texto" | "Voz">("Texto");
  const listRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<SpeechRec | null>(null);

  function setPipelineStage(stage: PipelineStage, status: StageStatus) {
    setPipeline((current) => ({ ...current, [stage]: status }));
  }

  useEffect(() => {
    const warm = () => {
      pickSpanishVoice();
    };
    window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener("voiceschanged", warm);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", warm);
      window.speechSynthesis.cancel();
      recRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy, suggestions, streamText]);

  function speakSummary(text: string) {
    window.speechSynthesis.cancel();
    if (!text.trim()) {
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "es-MX";
    utter.rate = 0.94;
    utter.pitch = 1.03;
    utter.volume = 0.95;
    const voice = pickSpanishVoice();
    if (voice) {
      utter.voice = voice;
    }
    utter.onstart = () => {
      setSpeaking(true);
      setPipelineStage("voice", "active");
    };
    utter.onend = () => {
      setSpeaking(false);
      setPipelineStage("voice", "done");
    };
    utter.onerror = () => {
      setSpeaking(false);
      setPipelineStage("voice", "skipped");
    };
    window.speechSynthesis.speak(utter);
  }

  async function send(text: string, source: "text" | "voice" = "text") {
    const content = text.trim();
    if (!content || busy) {
      return;
    }
    setError(null);
    setInput("");
    setSuggestions([]);
    setStreamText("");
    setToolRunning(false);
    setRagFragments(null);
    setInputMode(source === "voice" ? "Voz" : "Texto");
    setPipeline({ ...INITIAL_PIPELINE, input: "done", api: "active" });
    const userMsg: UiMessage = { id: nid(), role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setBusy(true);
    try {
      const history = [...messages.filter((m) => m.id !== "hello"), userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!response.ok || !response.body) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "No se pudo responder");
      }

      setPipeline((current) => ({ ...current, api: "done", prompt: "active" }));

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const handle = (event: MentorEvent) => {
        switch (event.type) {
          case "delta":
            setPipeline((current) => ({
              ...current,
              model: "done",
              generation: "active",
              stream: "active",
              render: "active",
            }));
            setStreamText((prev) => prev + event.text);
            break;
          case "reset":
            setStreamText("");
            break;
          case "status":
            if (event.value === "tool") {
              setToolRunning(true);
              setPipeline((current) => ({
                ...current,
                model: "done",
                tool: "active",
                retrieval: "active",
              }));
            } else if (event.value === "generation") {
              setPipelineStage("generation", "active");
            } else {
              setPipeline((current) => ({ ...current, prompt: "done", model: "active" }));
            }
            break;
          case "tool_result":
            setRagFragments(event.fragments);
            setToolRunning(false);
            setPipeline((current) => ({
              ...current,
              tool: "done",
              retrieval: event.found ? "done" : "empty",
            }));
            break;
          case "done":
            setUsedTool(event.usedTool);
            setMessages((prev) => [
              ...prev,
              {
                id: nid(),
                role: "assistant",
                content: event.reply,
                infographic: event.infographic,
              },
            ]);
            setSuggestions(event.suggestions.slice(0, 5));
            setStreamText("");
            setPipeline((current) => ({
              ...current,
              prompt: "done",
              model: "done",
              tool: event.usedTool ? current.tool : "skipped",
              retrieval: event.usedTool ? current.retrieval : "skipped",
              generation: "done",
              stream: "done",
              render: "done",
              voice: event.summary ? "active" : "skipped",
            }));
            if (event.summary) {
              speakSummary(event.summary);
            }
            break;
          case "error":
            throw new Error(event.message);
        }
      };

      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.trim()) {
            handle(JSON.parse(line) as MentorEvent);
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      setError(message);
      setStreamText("");
      setPipeline((current) => {
        const failed = { ...current };
        for (const stage of Object.keys(failed) as Array<keyof PipelineState>) {
          if (failed[stage] === "active" || failed[stage] === "idle") {
            failed[stage] = "skipped";
          }
        }
        return failed;
      });
    } finally {
      setBusy(false);
      setToolRunning(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send(input);
  }

  async function toggleMic() {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      setPipelineStage("input", "done");
      return;
    }

    const rec = getRecognition();
    if (!rec) {
      setError(
        "Este navegador no expone reconocimiento de voz. Prueba en Chrome o escribe el mensaje.",
      );
      return;
    }
    if (!window.isSecureContext) {
      setError("El micrófono solo funciona en HTTPS o en localhost.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      setError(
        "No diste permiso de micrófono. Actívalo en el candado de la barra de direcciones y vuelve a intentar.",
      );
      return;
    }

    rec.lang = "es-MX";
    rec.interimResults = false;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      const transcript = last?.[0]?.transcript ?? "";
      if (transcript) {
        setPipelineStage("input", "done");
        void send(transcript, "voice");
      }
    };
    rec.onerror = (event) => {
      setListening(false);
      const message = describeSpeechError(event?.error);
      if (message) {
        setError(message);
      }
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;

    try {
      rec.start();
      setListening(true);
      setError(null);
      setRagFragments(null);
      setInputMode("Voz");
      setPipeline({ ...INITIAL_PIPELINE, input: "active" });
    } catch {
      setError("El micrófono ya estaba activo. Espera un momento y vuelve a intentar.");
    }
  }

  const showSuggestions = suggestions.length > 0 && !busy;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-slate-100">
      <header className="shrink-0 border-b border-teal-900/50 bg-teal-950 shadow-lg">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
          <Avatar
            speaking={speaking}
            listening={listening}
            thinking={busy && !streamText}
            compact
          />
          <div className="min-w-0 flex-1 border-l border-teal-800/60 pl-3 sm:pl-4">
            <h1 className="truncate text-base font-semibold text-white sm:text-lg">
              Tech Mentor
            </h1>
            <p className="hidden text-xs text-teal-200/70 sm:block">
              Mini-agente con una sola herramienta: consultar la base local de tecnología.
            </p>
          </div>
          {usedTool ? (
            <span className="hidden shrink-0 rounded-full bg-cyan-400/15 px-3 py-1 text-xs text-cyan-200 md:inline">
              Usó la tool de conocimiento
            </span>
          ) : null}
        </div>
        <ArchitectureFlow
          pipeline={pipeline}
          ragFragments={ragFragments}
          inputMode={inputMode}
        />
      </header>

      <main className="mx-auto flex w-full max-w-5xl min-h-0 flex-1 flex-col px-3 sm:px-6">
        <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto py-4">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[80%] sm:text-base ${
                message.role === "user"
                  ? "ml-auto whitespace-pre-wrap bg-teal-700 text-white"
                  : "bg-white text-slate-800 shadow-sm"
              }`}
            >
              {message.role === "user" ? (
                message.content
              ) : (
                <>
                  <Markdown>{message.content}</Markdown>
                  {message.infographic ? <Infographic data={message.infographic} /> : null}
                </>
              )}
            </article>
          ))}

          {streamText ? (
            <article className="max-w-[92%] rounded-2xl bg-white px-4 py-3 text-sm leading-relaxed text-slate-800 shadow-sm sm:max-w-[80%] sm:text-base">
              <Markdown>{streamText}</Markdown>
              <span className="caret ml-0.5 inline-block h-4 w-[2px] align-middle bg-teal-600" />
            </article>
          ) : null}

          {busy && !streamText ? (
            <p className="text-sm text-slate-400">
              {toolRunning ? "Consultando la base de conocimiento…" : "Nodi está pensando…"}
            </p>
          ) : null}

          {showSuggestions ? (
            <section className="rounded-2xl border border-dashed border-teal-300 bg-teal-50/70 px-4 py-3">
              <h2 className="mb-2 text-xs font-semibold tracking-wide text-teal-800 uppercase">
                Temas relacionados
              </h2>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => void send(topic)}
                    className="rounded-full border border-teal-300 bg-white px-3 py-1.5 text-left text-sm text-teal-900 transition-colors hover:border-teal-500 hover:bg-teal-100"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {error ? (
          <p className="pb-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <form onSubmit={onSubmit} className="flex gap-2 border-t border-slate-200 py-3">
          <label className="sr-only" htmlFor="prompt">
            Mensaje
          </label>
          <textarea
            id="prompt"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ej. ¿Qué es RAG?  ·  Tengo 15 minutos, ¿qué practico de Git?"
            className="min-h-[52px] flex-1 resize-none rounded-2xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none focus:border-teal-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
          />
          <button
            type="button"
            onClick={() => void toggleMic()}
            disabled={busy}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white transition-colors ${
              listening ? "animate-pulse bg-red-500" : "bg-slate-800 hover:bg-slate-700"
            } disabled:opacity-50`}
            aria-pressed={listening}
            aria-label={listening ? "Detener micrófono" : "Grabar audio"}
            title={listening ? "Detener" : "Hablar"}
          >
            <MicIcon />
          </button>
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-2xl bg-teal-700 px-4 text-sm font-medium text-white disabled:opacity-50"
          >
            Enviar
          </button>
        </form>
      </main>
    </div>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}
