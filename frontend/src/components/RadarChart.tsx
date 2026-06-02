"use client";

import React from "react";
import { Radar, ShieldAlert, Cpu, Globe } from "lucide-react";

interface RadarTarget {
  name: string;
  status: "pending" | "scanning" | "online" | "offline";
  ping?: number;
  angle: number; // 0 to 360 for radial mapping
  distance: number; // 30 to 90 % for distance from center
}

interface RadarChartProps {
  targets: RadarTarget[];
  isScanning: boolean;
}

export default function RadarChart({ targets, isScanning }: RadarChartProps) {
  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-slate-900/60 border border-violet-500/20 rounded-2xl overflow-hidden backdrop-blur-md">
      {/* Background Radar Screen */}
      <div className="relative w-72 h-72 rounded-full border-2 border-violet-500/30 radar-grid flex items-center justify-center">
        {/* Sweep arm when scanning */}
        {isScanning && (
          <div className="absolute inset-0 w-full h-full rounded-full overflow-hidden animate-radar pointer-events-none">
            <div 
              className="w-1/2 h-1/2 origin-bottom-right"
              style={{
                background: "linear-gradient(45deg, rgba(139, 92, 246, 0.4) 0%, transparent 100%)",
                transform: "rotate(90deg)",
              }}
            />
          </div>
        )}

        {/* Center Indicator */}
        <div className="relative z-10 w-8 h-8 rounded-full bg-slate-950 border border-violet-500/50 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Radar className={`w-4 h-4 text-violet-400 ${isScanning ? "animate-pulse" : ""}`} />
        </div>

        {/* Outer and Inner circles */}
        <div className="absolute w-52 h-52 rounded-full border border-violet-500/20 pointer-events-none" />
        <div className="absolute w-32 h-52 rotate-45 border-l border-r border-violet-500/5 pointer-events-none" />
        <div className="absolute w-52 h-32 rotate-45 border-t border-b border-violet-500/5 pointer-events-none" />
        <div className="absolute w-32 h-32 rounded-full border border-violet-500/10 pointer-events-none" />
        <div className="absolute w-16 h-16 rounded-full border border-violet-500/10 pointer-events-none" />

        {/* Render targets as radar dots */}
        {targets.map((target) => {
          // Calculate polar to cartesian coordinates
          const rad = (target.angle * Math.PI) / 180;
          const x = 50 + (target.distance / 2) * Math.cos(rad);
          const y = 50 + (target.distance / 2) * Math.sin(rad);

          // Dot colors based on status
          let dotColor = "bg-slate-500 shadow-slate-500/20";
          let textColor = "text-slate-400";
          let pulseClass = "";

          if (target.status === "scanning") {
            dotColor = "bg-sky-400 shadow-sky-400/50";
            textColor = "text-sky-300";
            pulseClass = "animate-ping";
          } else if (target.status === "online") {
            dotColor = "bg-emerald-400 shadow-emerald-400/50";
            textColor = "text-emerald-400";
          } else if (target.status === "offline") {
            dotColor = "bg-rose-500 shadow-rose-500/50 animate-pulse";
            textColor = "text-rose-400";
          }

          return (
            <div
              key={target.name}
              className="absolute group z-20"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Pulsing ring for active states */}
              {pulseClass && (
                <span className={`absolute inline-flex h-4 w-4 rounded-full opacity-75 ${dotColor} ${pulseClass}`} />
              )}
              {/* Radar Point Dot */}
              <div className={`w-3 h-3 rounded-full border border-slate-950 shadow-md ${dotColor} transition-all duration-300 relative cursor-pointer`} />
              
              {/* Target Label tooltip on hover */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-950/90 border border-slate-800 text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-50 text-slate-200">
                <span className="font-semibold">{target.name}</span>
                {target.ping && <span className="mr-1 text-sky-400">({target.ping}ms)</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Target status summaries beneath radar */}
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 w-full text-xs">
        {targets.map((t) => (
          <div key={t.name} className="flex items-center justify-between py-0.5 border-b border-slate-800">
            <span className="text-slate-300 font-medium">{t.name}</span>
            <span
              className={`font-semibold ${
                t.status === "online"
                  ? "text-emerald-400"
                  : t.status === "offline"
                  ? "text-rose-400"
                  : t.status === "scanning"
                  ? "text-sky-400 animate-pulse"
                  : "text-slate-500"
              }`}
            >
              {t.status === "online" && `${t.ping || 0}ms`}
              {t.status === "offline" && "اختلال/فیلتر"}
              {t.status === "scanning" && "در حال بررسی..."}
              {t.status === "pending" && "در صف"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
