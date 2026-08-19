"use client";

import { useState } from "react";

export type PipelineStage =
  | "input"
  | "api"
  | "prompt"
  | "model"
  | "tool"
  | "retrieval"
  | "generation"
  | "stream"
  | "render"
  | "voice";

export type StageStatus = "idle" | "active" | "done" | "empty" | "skipped";

export type PipelineState = Record<PipelineStage, StageStatus>;

export const PIPELINE_STAGES: Array<{
  id: PipelineStage;
  name: string;
  detail: string;
}> = [
  { id: "input", name: "Entrada", detail: "Texto escrito" },
  { id: "api", name: "API route", detail: "/api/chat valida" },
  { id: "prompt", name: "Prompt", detail: "Rol, límites e historial" },
  { id: "model", name: "Claude Haiku", detail: "Decide si usa la tool" },
  { id: "tool", name: "Tool use", detail: "consultar_conocimiento_tech" },
  { id: "retrieval", name: "RAG local", detail: "Busca en /knowledge" },
  { id: "generation", name: "Redacción", detail: "Responde con contexto" },
  { id: "stream", name: "Streaming", detail: "NDJSON token a token" },
  { id: "render", name: "Render", detail: "Markdown, temas e infografía" },
  { id: "voice", name: "Voz", detail: "Web Speech TTS" },
];

const STATUS_LABEL: Record<StageStatus, string> = {
  idle: "En espera",
  active: "Procesando",
  done: "Completado",
  empty: "Sin resultados",
  skipped: "No utilizado",
};

const STATUS_CARD: Record<StageStatus, string> = {
  idle: "border-teal-800 bg-teal-900/35",
  active: "pipeline-active border-cyan-300 bg-cyan-300/15",
  done: "border-emerald-400/50 bg-emerald-400/10",
  empty: "border-amber-400/50 bg-amber-400/10",
  skipped: "border-slate-600/50 bg-slate-800/40 opacity-55",
};

const STATUS_DOT: Record<StageStatus, string> = {
  idle: "bg-teal-700",
  active: "pipeline-dot bg-cyan-300",
  done: "bg-emerald-400",
  empty: "bg-amber-400",
  skipped: "bg-slate-500",
};

export function ArchitectureFlow({
  pipeline,
  ragFragments,
  inputMode,
}: {
  pipeline: PipelineState;
  ragFragments: number | null;
  inputMode: "Texto" | "Voz";
}) {
  const [expanded, setExpanded] = useState(false);

  const activeStage = PIPELINE_STAGES.find((stage) => pipeline[stage.id] === "active");

  const detailFor = (stage: (typeof PIPELINE_STAGES)[number]) => {
    if (stage.id === "input") {
      return inputMode === "Voz" ? "Voz → texto (Web Speech)" : "Texto escrito";
    }
    if (stage.id === "retrieval" && ragFragments !== null) {
      return `${ragFragments} fragmento${ragFragments === 1 ? "" : "s"}`;
    }
    return stage.detail;
  };

  return (
    <section
      className="border-t border-teal-800/60 bg-teal-950/95"
      aria-label="Flujo de arquitectura de la petición"
    >
      <div className="mx-auto w-full max-w-5xl px-4 py-2 sm:px-6">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex w-full items-center justify-between gap-2 text-left sm:cursor-default"
          aria-expanded={expanded}
        >
          <span className="text-[10px] font-semibold tracking-[0.16em] text-teal-200/70 uppercase">
            Cómo responde Nodi
          </span>
          <span className="truncate text-[10px] text-teal-300/60">
            {activeStage ? activeStage.name : "Flujo en tiempo real"}
            <span className="ml-2 sm:hidden">{expanded ? "▲" : "▼"}</span>
          </span>
        </button>

        <ol
          className={`mt-1.5 gap-1.5 ${
            expanded ? "grid" : "hidden sm:grid"
          } grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`}
        >
          {PIPELINE_STAGES.map((stage, index) => {
            const status = pipeline[stage.id];
            const detail = detailFor(stage);
            return (
              <li
                key={stage.id}
                className={`min-w-0 rounded-xl border px-2.5 py-1.5 ${STATUS_CARD[status]}`}
                title={`${stage.name}: ${STATUS_LABEL[status]} · ${detail}`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[status]}`}
                    aria-hidden
                  />
                  <span className="text-[9px] text-teal-300/50">{index + 1}</span>
                  <span className="truncate text-[11px] font-semibold text-teal-50">
                    {stage.name}
                  </span>
                </div>
                <p className="truncate text-[9px] text-teal-200/60">{detail}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
