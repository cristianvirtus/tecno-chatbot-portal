"use client";

import type { ReactNode } from "react";
import type { Infographic as InfographicData } from "@/lib/text";

const KIND_LABEL: Record<InfographicData["kind"], string> = {
  pasos: "Flujo visual",
  comparacion: "Frente a frente",
  conceptos: "Mapa de conceptos",
};

export function Infographic({ data }: { data: InfographicData }) {
  return (
    <figure
      className="relative mt-4 overflow-hidden rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-cyan-50 shadow-sm"
      data-testid="infographic"
    >
      <div
        className="absolute -top-12 -right-10 h-36 w-36 rounded-full bg-cyan-200/30"
        aria-hidden
      />
      <div
        className="absolute -bottom-14 -left-12 h-32 w-32 rounded-full bg-teal-200/25"
        aria-hidden
      />
      <figcaption className="relative flex items-center justify-between gap-3 border-b border-teal-200/70 bg-white/75 px-4 py-3 backdrop-blur-sm sm:px-5">
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white">
            <VisualIcon name={data.kind === "pasos" ? "route" : data.kind === "comparacion" ? "compare" : "idea"} />
          </span>
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold tracking-[0.16em] text-teal-600 uppercase">
              Resumen gráfico
            </span>
            <span className="block truncate text-sm font-bold text-teal-950 sm:text-base">
              {data.title}
            </span>
          </span>
        </span>
        <span className="shrink-0 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[9px] font-bold tracking-wide text-teal-800 uppercase sm:text-[10px]">
          {KIND_LABEL[data.kind]}
        </span>
      </figcaption>

      <div className="relative p-4 sm:p-5">
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
    <>
      <ol className="space-y-2.5 sm:hidden">
        {items.map((item, index) => (
          <li key={`${item.title}-${index}`} className="relative flex gap-3">
            <div className="flex flex-col items-center">
              <span className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm">
                <VisualIcon name={iconFor(item)} />
              </span>
              {index < items.length - 1 ? (
                <span className="my-1 w-0.5 flex-1 bg-gradient-to-b from-teal-400 to-cyan-200" aria-hidden />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 rounded-2xl border border-teal-100 bg-white/90 px-3.5 py-3">
              <p className="flex items-center gap-2 text-sm font-bold text-teal-950">
                <span className="text-[10px] font-bold tracking-wider text-teal-600">
                  PASO {index + 1}
                </span>
                <span className="h-px flex-1 bg-teal-100" aria-hidden />
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{item.title}</p>
              <p className="mt-0.5 text-sm leading-snug text-slate-600">{item.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <ol
        className="hidden items-stretch sm:grid"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item, index) => (
          <li key={`${item.title}-${index}`} className="relative flex min-w-0 flex-col items-center px-1.5">
            {index < items.length - 1 ? (
              <span
                className="absolute top-6 left-[calc(50%+24px)] h-0.5 w-[calc(100%-48px)] bg-teal-300"
                aria-hidden
              >
                <span className="absolute -right-0.5 -top-[3px] h-2 w-2 rotate-45 border-t-2 border-r-2 border-teal-400" />
              </span>
            ) : null}
            <span className="z-10 flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-white bg-teal-700 text-white shadow-sm">
              <VisualIcon name={iconFor(item)} />
            </span>
            <span className="mt-2 text-[9px] font-bold tracking-[0.12em] text-teal-600">
              PASO {index + 1}
            </span>
            <p className="mt-1 text-center text-sm font-bold text-teal-950">{item.title}</p>
            <p className="mt-1 text-center text-xs leading-snug text-slate-600">{item.text}</p>
          </li>
        ))}
      </ol>
    </>
  );
}

function Comparison({ items }: { items: Items }) {
  return (
    <div className="relative">
      {items.length === 2 ? (
        <span className="absolute top-1/2 left-1/2 z-10 hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-slate-800 text-[10px] font-black text-white sm:flex">
          VS
        </span>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className={`relative overflow-hidden rounded-2xl border bg-white/90 p-4 ${
              index % 2 === 0 ? "border-teal-200" : "border-cyan-200"
            }`}
          >
            <div
              className={`absolute top-0 right-0 h-16 w-16 rounded-bl-[3rem] ${
                index % 2 === 0 ? "bg-teal-100" : "bg-cyan-100"
              }`}
              aria-hidden
            />
            <span
              className={`relative flex h-11 w-11 items-center justify-center rounded-2xl text-white ${
                index % 2 === 0 ? "bg-teal-700" : "bg-cyan-700"
              }`}
            >
              <VisualIcon name={iconFor(item)} />
            </span>
            <p className="relative mt-3 text-base font-bold text-slate-900">{item.title}</p>
            <p className="relative mt-1 text-sm leading-relaxed text-slate-600">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Concepts({ items }: { items: Items }) {
  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-center">
        <div className="flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-2 text-xs font-bold text-teal-800">
          <VisualIcon name="hub" />
          <span>IDEA CENTRAL</span>
        </div>
      </div>
      <div className="absolute top-10 bottom-8 left-1/2 hidden w-px bg-teal-200 sm:block" aria-hidden />
      <div className="relative grid gap-3 sm:grid-cols-2">
      {items.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="flex gap-3 rounded-2xl border border-teal-100 bg-white/90 p-3.5"
          >
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                index % 2 === 0 ? "bg-teal-100 text-teal-700" : "bg-cyan-100 text-cyan-700"
              }`}
            >
              <VisualIcon name={iconFor(item)} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">{item.title}</p>
              <p className="mt-0.5 text-sm leading-snug text-slate-600">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type IconName =
  | "browser"
  | "check"
  | "cloud"
  | "code"
  | "compare"
  | "database"
  | "globe"
  | "hub"
  | "idea"
  | "key"
  | "lock"
  | "request"
  | "response"
  | "route"
  | "search"
  | "server";

function iconFor(item: Items[number]): IconName {
  const value = `${item.title} ${item.text}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");

  if (/dns|dominio|internet|red/.test(value)) return "globe";
  if (/tls|ssl|certificado|cifrad|segur|autentic/.test(value)) return "lock";
  if (/base de datos|database|corpus|dato|almacen/.test(value)) return "database";
  if (/servidor|backend|api/.test(value)) return "server";
  if (/cliente|navegador|browser|usuario/.test(value)) return "browser";
  if (/busc|rag|recuper|consulta/.test(value)) return "search";
  if (/clave|key|token|password/.test(value)) return "key";
  if (/respuesta|response|devuelve|retorna/.test(value)) return "response";
  if (/peticion|request|envia|entrada/.test(value)) return "request";
  if (/nube|cloud|vercel|deploy/.test(value)) return "cloud";
  if (/codigo|code|program|git/.test(value)) return "code";
  return "check";
}

function VisualIcon({ name }: { name: IconName }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "h-5 w-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const paths: Record<string, ReactNode> = {
    browser: (
      <>
        <rect x="3" y="4" width="18" height="15" rx="2" />
        <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
      </>
    ),
    check: <path d="M4 12.5 9.2 18 20 6" />,
    cloud: <path d="M6.5 18h11a4 4 0 0 0 .6-8 6.3 6.3 0 0 0-12-1.4A4.8 4.8 0 0 0 6.5 18Z" />,
    code: <path d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-11-2 14" />,
    compare: (
      <>
        <path d="M7 4v16M17 4v16M4 7l3-3 3 3M14 17l3 3 3-3" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9S14.4 18.5 12 21c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3Z" />
      </>
    ),
    hub: (
      <>
        <circle cx="12" cy="12" r="3" />
        <circle cx="5" cy="6" r="2" />
        <circle cx="19" cy="6" r="2" />
        <circle cx="5" cy="18" r="2" />
        <circle cx="19" cy="18" r="2" />
        <path d="m7 7.5 3 2.5m7-2.5-3 2.5m-7 6.5 3-2.5m7 2.5-3-2.5" />
      </>
    ),
    idea: (
      <>
        <path d="M9 18h6M10 21h4M8.5 15.5A7 7 0 1 1 15.5 15.5c-.8.6-1.1 1.2-1.1 2.5H9.6c0-1.3-.3-1.9-1.1-2.5Z" />
      </>
    ),
    key: (
      <>
        <circle cx="7.5" cy="15.5" r="3.5" />
        <path d="m10 13 9-9m-3 3 3 3m-6-1 2 2" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
      </>
    ),
    request: <path d="M4 12h15m-5-5 5 5-5 5" />,
    response: (
      <>
        <path d="M20 12H5m5-5-5 5 5 5" />
        <path d="m15 18 2 2 4-4" />
      </>
    ),
    route: (
      <>
        <circle cx="5" cy="6" r="2" />
        <circle cx="19" cy="18" r="2" />
        <path d="M7 6h4a3 3 0 0 1 3 3v6a3 3 0 0 0 3 3M11 12H7a2 2 0 0 0-2 2v2" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 5 5" />
      </>
    ),
    server: (
      <>
        <rect x="3" y="4" width="18" height="6" rx="2" />
        <rect x="3" y="14" width="18" height="6" rx="2" />
        <path d="M7 7h.01M7 17h.01M11 7h7M11 17h7" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] ?? paths.check}</svg>;
}
