"use client";

import type { Infographic as InfographicData } from "@/lib/text";

const KIND_LABEL: Record<InfographicData["kind"], string> = {
  pasos: "Paso a paso",
  comparacion: "Comparación",
  conceptos: "Conceptos clave",
};

export function Infographic({ data }: { data: InfographicData }) {
  return (
    <figure className="mt-3 overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
      <figcaption className="flex items-center justify-between gap-2 border-b border-teal-200/70 bg-white/60 px-4 py-2">
        <span className="truncate text-sm font-semibold text-teal-900">{data.title}</span>
        <span className="shrink-0 rounded-full bg-teal-700/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-teal-800 uppercase">
          {KIND_LABEL[data.kind]}
        </span>
      </figcaption>

      <div className="p-3 sm:p-4">
        {data.kind === "pasos" ? <Steps items={data.items} /> : null}
        {data.kind === "comparacion" ? <Comparison items={data.items} /> : null}
        {data.kind === "conceptos" ? <Concepts items={data.items} /> : null}
      </div>
    </figure>
  );
}

type Items = InfographicData["items"];

function Steps({ items }: { items: Items }) {
  return (
    <ol className="space-y-2">
      {items.map((item, index) => (
        <li key={item.title} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-700 text-xs font-semibold text-white">
              {index + 1}
            </span>
            {index < items.length - 1 ? (
              <span className="mt-1 w-px flex-1 bg-teal-300" aria-hidden />
            ) : null}
          </div>
          <div className="pb-1">
            <p className="text-sm font-semibold text-teal-900">{item.title}</p>
            <p className="text-sm text-slate-600">{item.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Comparison({ items }: { items: Items }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-xl border border-teal-200 bg-white/80 px-3 py-2.5"
        >
          <p className="text-sm font-semibold text-teal-900">{item.title}</p>
          <p className="mt-0.5 text-sm text-slate-600">{item.text}</p>
        </div>
      ))}
    </div>
  );
}

function Concepts({ items }: { items: Items }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.title} className="flex gap-2.5 rounded-xl bg-white/70 px-3 py-2.5">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-500" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-teal-900">{item.title}</p>
            <p className="text-sm text-slate-600">{item.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
