"use client";

import { useEffect, useState } from "react";

type AvatarProps = {
  speaking: boolean;
  listening: boolean;
  thinking: boolean;
  compact?: boolean;
};

const SKIN = "#e9b894";
const SKIN_LIGHT = "#f6d5bc";
const SKIN_SHADOW = "#ce8e6e";
const HAIR = "#32201c";
const HAIR_LIGHT = "#6b4032";
const LIP = "#a8425b";
const MOUTH_IN = "#6d2b2b";

export function Avatar({ speaking, listening, thinking, compact = false }: AvatarProps) {
  const [blink, setBlink] = useState(false);
  const [mouth, setMouth] = useState(0);
  const [gaze, setGaze] = useState({ x: 0, y: 0 });
  const [brow, setBrow] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(
        () => {
          setBlink(true);
          setTimeout(() => {
            setBlink(false);
            schedule();
          }, 130);
        },
        2200 + Math.random() * 3800,
      );
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!speaking) {
      return;
    }
    const timer = setInterval(() => {
      // Alterna aperturas amplias y casi cerradas para simular sílabas.
      const open = Math.random() < 0.25 ? 0.1 + Math.random() * 0.2 : 0.35 + Math.random() * 0.65;
      setMouth(open);
      setBrow(Math.random() < 0.3 ? -3 - Math.random() * 3 : 0);
    }, 95);
    return () => clearInterval(timer);
  }, [speaking]);

  useEffect(() => {
    if (speaking) {
      return;
    }
    const timer = setInterval(() => {
      if (thinking) {
        setGaze({ x: 2 + Math.random() * 2, y: -3 });
        return;
      }
      setGaze({
        x: (Math.random() - 0.5) * 5,
        y: (Math.random() - 0.5) * 3,
      });
    }, 2600);
    return () => clearInterval(timer);
  }, [speaking, thinking]);

  const mouthOpen = speaking ? mouth : 0;
  const eyeGaze = speaking ? { x: 0, y: 0 } : gaze;
  const browOffset = listening ? -6 : thinking ? -2 : speaking ? brow : 0;
  const headTilt = listening ? -4 : thinking ? 3 : 0;
  const eyeScale = blink ? 0.08 : listening ? 1.12 : 1;
  const status = listening
    ? "Te escucho…"
    : thinking
      ? "Pensando…"
      : speaking
        ? "Leyendo el resumen"
        : "Mentor de tecnología";

  return (
    <div className={compact ? "flex items-center gap-3" : "flex flex-col items-center gap-3"} data-testid="avatar">
      <div
        className={`relative shrink-0 ${
          compact ? "h-16 w-16 sm:h-20 sm:w-20" : "h-44 w-44 sm:h-52 sm:w-52"
        } ${speaking ? "avatar-bob" : "avatar-breathe"}`}
        aria-hidden
      >
        <svg viewBox="0 0 220 250" className="h-full w-full drop-shadow-xl">
          <defs>
            <radialGradient id="halo" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0f766e" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="shirt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6ee7d8" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
            <radialGradient id="skin" cx="42%" cy="30%" r="75%">
              <stop offset="0%" stopColor={SKIN_LIGHT} />
              <stop offset="72%" stopColor={SKIN} />
              <stop offset="100%" stopColor={SKIN_SHADOW} />
            </radialGradient>
            <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={HAIR_LIGHT} />
              <stop offset="42%" stopColor={HAIR} />
              <stop offset="100%" stopColor="#160f0e" />
            </linearGradient>
            <clipPath id="mouthClip">
              <ellipse cx="0" cy="0" rx="25" ry="17" />
            </clipPath>
          </defs>

          <circle cx="110" cy="118" r="105" fill="url(#halo)" />

          {listening ? (
            <circle cx="110" cy="118" r="96" fill="none" stroke="#22d3ee" strokeWidth="3" opacity="0.6">
              <animate attributeName="r" values="92;102;92" dur="1.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1.4s" repeatCount="indefinite" />
            </circle>
          ) : null}

          {/* Cabello largo detrás de hombros y rostro. */}
          <path
            d="M49 104 C43 55 73 27 110 27 C151 27 178 58 171 112 L181 220 C159 210 143 205 110 205 C77 205 60 211 39 220 Z"
            fill="url(#hair)"
          />
          <path
            d="M31 250 C38 211 69 192 110 192 C151 192 182 211 189 250 Z"
            fill="url(#shirt)"
          />
          <path d="M93 172 h34 v30 c-8 10 -26 10 -34 0 Z" fill="url(#skin)" />
          <path d="M83 199 Q110 220 137 199" fill="none" stroke="#ccfbf1" strokeWidth="5" />

          <g transform={`rotate(${headTilt} 110 120)`} style={{ transition: "transform 400ms ease-out" }}>
            <ellipse cx="57" cy="121" rx="8" ry="13" fill={SKIN} />
            <ellipse cx="163" cy="121" rx="8" ry="13" fill={SKIN} />
            <path
              d="M57 105 C59 65 78 45 110 45 C142 45 161 65 163 105 L159 142 C155 174 134 190 110 191 C86 190 65 174 61 142 Z"
              fill="url(#skin)"
            />
            <path
              d="M65 151 C78 179 95 188 110 189 C125 188 142 179 155 151 C148 183 132 199 110 200 C88 199 72 183 65 151 Z"
              fill={SKIN_SHADOW}
              opacity="0.18"
            />

            <path
              d="M55 105 C55 54 79 36 110 36 C145 36 168 62 165 110 C158 84 146 70 132 62 C116 77 93 84 66 83 C61 91 58 98 55 105 Z"
              fill="url(#hair)"
            />
            <path
              d="M65 79 C83 50 122 40 151 66 C125 51 91 61 65 79 Z"
              fill="#b77a5b"
              opacity="0.24"
            />

            <g
              transform={`translate(0 ${browOffset})`}
              style={{ transition: "transform 180ms ease-out" }}
            >
              <path
                d="M74 100 Q88 92 102 99"
                stroke={HAIR}
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={thinking ? "M118 96 Q132 90 146 100" : "M118 99 Q132 92 146 100"}
                stroke={HAIR}
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            <g style={{ transition: "transform 90ms ease-out" }}>
              <g transform={`translate(88 121) scale(1 ${eyeScale}) translate(-88 -121)`}>
                <ellipse cx="88" cy="121" rx="14" ry="9" fill="#ffffff" />
                <circle cx={88 + eyeGaze.x} cy={121 + eyeGaze.y} r="7" fill="#6d4c35" />
                <circle cx={88 + eyeGaze.x} cy={121 + eyeGaze.y} r="3.6" fill="#101828" />
                <circle cx={85.5 + eyeGaze.x} cy={118 + eyeGaze.y} r="2.1" fill="#ffffff" />
              </g>
              <g transform={`translate(132 121) scale(1 ${eyeScale}) translate(-132 -121)`}>
                <ellipse cx="132" cy="121" rx="14" ry="9" fill="#ffffff" />
                <circle cx={132 + eyeGaze.x} cy={121 + eyeGaze.y} r="7" fill="#6d4c35" />
                <circle cx={132 + eyeGaze.x} cy={121 + eyeGaze.y} r="3.6" fill="#101828" />
                <circle cx={129.5 + eyeGaze.x} cy={118 + eyeGaze.y} r="2.1" fill="#ffffff" />
              </g>
            </g>

            {/* Pestañas y delineado dan una expresión más humana sin bloquear los ojos. */}
            <path d="M74 116 Q88 107 102 116" fill="none" stroke="#3a211c" strokeWidth="2.5" />
            <path d="M118 116 Q132 107 146 116" fill="none" stroke="#3a211c" strokeWidth="2.5" />
            <path d="M75 114 l-5 -4 M78 111 l-3 -5 M145 114 l5 -4 M142 111 l3 -5" stroke="#3a211c" strokeWidth="1.6" strokeLinecap="round" />

            <path
              d="M110 128 C105 142, 106 148, 112 150 C108 152, 104 152, 101 150"
              stroke={SKIN_SHADOW}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />

            <ellipse cx="75" cy="151" rx="12" ry="7" fill="#d96f76" opacity={speaking ? 0.3 : 0.18} />
            <ellipse cx="145" cy="151" rx="12" ry="7" fill="#d96f76" opacity={speaking ? 0.3 : 0.18} />
            <circle cx="56" cy="136" r="3.5" fill="#f5d06f" />
            <circle cx="164" cy="136" r="3.5" fill="#f5d06f" />

            <Mouth speaking={speaking} listening={listening} thinking={thinking} open={mouthOpen} />
          </g>
        </svg>
      </div>

      <div className={compact ? "min-w-0" : "text-center"}>
        <p
          className={`font-semibold tracking-tight text-teal-50 ${
            compact ? "text-base" : "text-lg"
          }`}
        >
          Nodi
        </p>
        <p className={`text-teal-200/80 ${compact ? "text-xs sm:text-sm" : "text-sm"}`}>
          {status}
        </p>
      </div>
    </div>
  );
}

function Mouth({
  speaking,
  listening,
  thinking,
  open,
}: {
  speaking: boolean;
  listening: boolean;
  thinking: boolean;
  open: number;
}) {
  if (speaking) {
    const scale = 0.14 + open * 0.9;
    return (
      <g transform="translate(110 168)">
        <g
          transform={`scale(${1.05 - open * 0.15} ${scale})`}
          style={{ transition: "transform 90ms ease-out" }}
        >
          <ellipse cx="0" cy="0" rx="25" ry="17" fill={MOUTH_IN} />
          <g clipPath="url(#mouthClip)">
            <rect x="-25" y="-18" width="50" height="8" rx="3" fill="#fdfdfd" />
            <ellipse cx="0" cy="15" rx="14" ry="8" fill="#d76b74" />
          </g>
          <ellipse cx="0" cy="0" rx="25" ry="17" fill="none" stroke={LIP} strokeWidth="3" />
        </g>
      </g>
    );
  }

  if (listening) {
    return (
      <g transform="translate(110 168)">
        <ellipse cx="0" cy="0" rx="10" ry="8" fill={MOUTH_IN} />
        <ellipse cx="0" cy="0" rx="10" ry="8" fill="none" stroke={LIP} strokeWidth="3" />
      </g>
    );
  }

  if (thinking) {
    return (
      <path
        d="M96 170 Q110 166 124 172"
        stroke={LIP}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    );
  }

  return (
    <g>
      <path
        d="M90 165 Q110 184 130 165"
        stroke={LIP}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M93 167 Q110 179 127 167" fill="#ffffff" opacity="0.5" />
    </g>
  );
}
