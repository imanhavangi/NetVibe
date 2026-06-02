"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle, HelpCircle } from "lucide-react";

interface SiteStat {
  online_count: number;
  offline_count: number;
  avg_ping?: number;
  success_rate: number;
}

interface ISPStatsTableProps {
  ispRankings: Record<string, Record<string, SiteStat>>;
  allSites: string[];
}

export default function ISPStatsTable({ ispRankings, allSites }: ISPStatsTableProps) {
  const isps = Object.keys(ispRankings);

  const getStatusBadge = (stat?: SiteStat) => {
    if (!stat || (stat.online_count === 0 && stat.offline_count === 0)) {
      return {
        icon: <MinusCircle className="w-4 h-4 text-slate-500" />,
        text: "بدون داده",
        colorClass: "bg-slate-950/40 text-slate-400 border-slate-800",
        p_colorClass: "text-slate-500",
      };
    }

    const rate = stat.success_rate;
    if (rate >= 0.8) {
      return {
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
        text: "آزاد و سریع",
        colorClass: "bg-emerald-950/40 text-emerald-400 border-emerald-500/20",
        p_colorClass: "text-emerald-400 font-semibold",
      };
    } else if (rate >= 0.4) {
      return {
        icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
        text: "اختلال/کاهش سرعت",
        colorClass: "bg-amber-950/40 text-amber-400 border-amber-500/20",
        p_colorClass: "text-amber-400 font-medium",
      };
    } else {
      return {
        icon: <XCircle className="w-4 h-4 text-rose-400" />,
        text: "مسدود/قطع کامل",
        colorClass: "bg-rose-950/40 text-rose-400 border-rose-500/20",
        p_colorClass: "text-rose-400 font-bold",
      };
    }
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
      {/* Header Info */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between">
        <div>
          <h3 className="text-sm md:text-base font-bold text-slate-200">مقایسه زنده اپراتورها</h3>
          <p className="text-xs text-slate-400 mt-1">تلفیق تجربیات کاربری ثبت شده بر اساس اپراتورهای مختلف در ۲۴ ساعت گذشته</p>
        </div>
        <div className="flex gap-2 text-[10px] md:text-xs">
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/20 px-2 py-1 rounded border border-emerald-500/10">● آزاد</span>
          <span className="flex items-center gap-1 text-amber-400 bg-amber-950/20 px-2 py-1 rounded border border-amber-500/10">● اختلال</span>
          <span className="flex items-center gap-1 text-rose-400 bg-rose-950/20 px-2 py-1 rounded border border-rose-500/10">● فیلتر</span>
        </div>
      </div>

      {/* Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-950/20 text-slate-300 text-xs border-b border-slate-800">
              <th className="py-4 px-5 font-semibold text-slate-400 sticky right-0 bg-slate-900/90 backdrop-blur-sm shadow-[1px_0_0_0_rgba(255,255,255,0.05)]">اپراتور / اینترنت</th>
              {allSites.map((site) => (
                <th key={site} className="py-4 px-4 font-semibold text-slate-400 text-center">{site}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-xs">
            {isps.map((isp) => (
              <tr key={isp} className="hover:bg-slate-800/20 transition-colors">
                {/* ISP Column */}
                <td className="py-4 px-5 font-bold text-slate-100 sticky right-0 bg-slate-900/95 backdrop-blur-sm shadow-[1px_0_0_0_rgba(255,255,255,0.05)]">
                  <div className="flex flex-col">
                    <span>{isp}</span>
                    <span className="text-[10px] text-violet-400 font-normal mt-0.5">
                      {Object.values(ispRankings[isp] || {}).reduce((acc, curr) => acc + curr.online_count + curr.offline_count, 0)} گزارش ثبت شده
                    </span>
                  </div>
                </td>

                {/* Site Statuses */}
                {allSites.map((site) => {
                  const stat = ispRankings[isp]?.[site];
                  const badge = getStatusBadge(stat);
                  return (
                    <td key={site} className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] md:text-xs font-semibold ${badge.colorClass}`}>
                          {badge.icon}
                          <span>{badge.text}</span>
                        </span>
                        {stat && stat.online_count > 0 && stat.avg_ping && (
                          <span className={`text-[10px] ${badge.p_colorClass}`}>
                            میانگین {Math.round(stat.avg_ping)}ms
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}

            {isps.length === 0 && (
              <tr>
                <td colSpan={allSites.length + 1} className="py-8 text-center text-slate-500">
                  <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-600 animate-pulse" />
                  داده‌ای برای مقایسه یافت نشد. اولین گزارش را شما ثبت کنید!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
