"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Wifi, 
  MapPin, 
  Globe2, 
  ServerCrash, 
  Database, 
  Sparkles, 
  RotateCw, 
  User, 
  ShieldAlert,
  ArrowDownCircle,
  Clock,
  TrendingUp
} from "lucide-react";
import RadarChart from "./RadarChart";
import ISPStatsTable from "./ISPStatsTable";

interface UserIPInfo {
  ip: string;
  isp: string;
  normalized_isp: string;
  asn: string;
  city: string;
  region: string;
  country: string;
  latitude?: number;
  longitude?: number;
  hosting: boolean;
  proxy: boolean;
}

interface SiteToTest {
  name: string;
  url: string;
  category: "social" | "dev" | "utility" | "local";
  angle: number;
  distance: number;
}

const SITES_TO_TEST: SiteToTest[] = [
  { name: "Instagram", url: "https://www.instagram.com", category: "social", angle: 30, distance: 75 },
  { name: "Telegram", url: "https://telegram.org", category: "social", angle: 75, distance: 85 },
  { name: "YouTube", url: "https://www.youtube.com", category: "social", angle: 120, distance: 90 },
  { name: "GitHub", url: "https://github.com", category: "dev", angle: 165, distance: 60 },
  { name: "Docker Hub", url: "https://hub.docker.com", category: "dev", angle: 210, distance: 70 },
  { name: "ChatGPT", url: "https://chatgpt.com", category: "dev", angle: 240, distance: 65 },
  { name: "Google", url: "https://www.google.com", category: "utility", angle: 280, distance: 40 },
  { name: "Wikipedia", url: "https://www.wikipedia.org", category: "utility", angle: 315, distance: 50 },
  { name: "Aparat", url: "https://www.aparat.com", category: "local", angle: 345, distance: 30 },
  { name: "Digikala", url: "https://www.digikala.com", category: "local", angle: 10, distance: 35 },
];

export default function NetworkStatusDashboard() {
  const [ipInfo, setIpInfo] = useState<UserIPInfo | null>(null);
  const [loadingIp, setLoadingIp] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [currentTestSite, setCurrentTestSite] = useState<string>("");
  const [personalResults, setPersonalResults] = useState<Record<string, { status: "online" | "offline"; ping?: number }>>({});
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [rateLimited, setRateLimited] = useState(false);

  // Load User IP & Live Aggregate Stats on mount
  useEffect(() => {
    fetchIpInfo();
    fetchDashboardStats();
  }, []);

  const fetchIpInfo = async () => {
    setLoadingIp(true);
    try {
      const res = await fetch("/api/v1/ip-info");
      if (res.ok) {
        const data = await res.json();
        setIpInfo(data);
      } else {
        throw new Error("Failed to load IP info");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("خطا در دریافت اطلاعات شبکه شما");
    } finally {
      setLoadingIp(false);
    }
  };

  const fetchDashboardStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/v1/dashboard-stats");
      if (res.ok) {
        const data = await res.json();
        setDashboardStats(data);
      }
    } catch (err) {
      console.error("Failed to load stats", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const testSiteAccess = async (url: string): Promise<{ status: "online" | "offline"; ping_ms: number | null }> => {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const start = Date.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);

      try {
        // mode: 'no-cors' lets us verify connectivity while bypassing CORS/ORB restrictions
        await fetch(url, {
          mode: "no-cors",
          cache: "no-store",
          signal: controller.signal,
        });
        clearTimeout(timer);
        return { status: "online", ping_ms: Date.now() - start };
      } catch (error: any) {
        clearTimeout(timer);
        console.warn(`Attempt ${attempt} to reach ${url} failed.`);
        if (attempt < maxAttempts) {
          // Wait 400ms before retrying to give transient network errors time to clear
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }
    }
    return { status: "offline", ping_ms: null };
  };

  const startScan = async () => {
    if (scanning) return;
    setScanning(true);
    setPersonalResults({});
    setRateLimited(false);

    const tempResults: Record<string, { status: "online" | "offline"; ping?: number }> = {};

    for (const site of SITES_TO_TEST) {
      setCurrentTestSite(site.name);
      
      // Minimum visual scan delay to make the radar sweep feel solid
      const scanPromise = testSiteAccess(site.url);
      const delayPromise = new Promise((resolve) => setTimeout(resolve, 600));
      
      const [res] = await Promise.all([scanPromise, delayPromise]);
      
      tempResults[site.name] = {
        status: res.status,
        ping: res.ping_ms || undefined
      };
      
      // Update state progressively for awesome user feedback
      setPersonalResults({ ...tempResults });
    }

    setScanning(false);
    setCurrentTestSite("");

    // Submit results to backend
    try {
      const submitRes = await fetch("/api/v1/submit-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results: tempResults }),
      });

      if (submitRes.status === 429) {
        setRateLimited(true);
      } else if (submitRes.ok) {
        // Refresh aggregate dashboard stats so the user immediately sees their impact!
        fetchDashboardStats();
      }
    } catch (err) {
      console.error("Error submitting test results", err);
    }
  };

  // Convert SITES_TO_TEST into format expected by RadarChart
  const getRadarTargets = () => {
    return SITES_TO_TEST.map((site) => {
      const result = personalResults[site.name];
      let status: "pending" | "scanning" | "online" | "offline" = "pending";
      
      if (scanning) {
        if (currentTestSite === site.name) status = "scanning";
        else if (result) status = result.status;
      } else if (result) {
        status = result.status;
      }

      return {
        name: site.name,
        status,
        ping: result?.ping,
        angle: site.angle,
        distance: site.distance,
      };
    });
  };

  // Calculate user overall connectivity score
  const getPersonalScore = () => {
    const keys = Object.keys(personalResults);
    if (keys.length === 0) return null;
    const onlineCount = keys.filter(k => personalResults[k].status === "online").length;
    return Math.round((onlineCount / keys.length) * 100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col justify-between selection:bg-violet-500/30">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 border-b border-slate-900 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Activity className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-sky-400 bg-clip-text text-transparent">
                NetVibe
              </h1>
              <p className="text-xs text-slate-400 mt-1">نبض زنده شبکه اینترنت ایران • سامانه جمع‌سپاری اختلالات</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => { fetchIpInfo(); fetchDashboardStats(); }} 
              className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="به‌روزرسانی کل داده‌ها"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-300 font-medium">اتصال زنده برقرار است</span>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Column 1: Personal User IP & Test Controls */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* User IP Block */}
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-violet-600/5 rounded-full filter blur-xl pointer-events-none" />
              <h2 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-violet-400" />
                شناسنامه اینترنت شما
              </h2>

              {loadingIp ? (
                <div className="space-y-4 py-4">
                  <div className="h-4 bg-slate-800 rounded w-2/3 animate-pulse" />
                  <div className="h-4 bg-slate-800 rounded w-1/2 animate-pulse" />
                  <div className="h-4 bg-slate-800 rounded w-3/4 animate-pulse" />
                </div>
              ) : ipInfo ? (
                <div className="space-y-3 text-xs md:text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-800/40">
                    <span className="text-slate-400">آدرس آی‌پی عمومی</span>
                    <span className="font-mono text-sky-400 font-bold">{ipInfo.ip}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800/40">
                    <span className="text-slate-400">نام ارائه‌دهنده (ISP)</span>
                    <span className="font-bold text-slate-200">{ipInfo.normalized_isp}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800/40">
                    <span className="text-slate-400">کد سامانه خودمختار (ASN)</span>
                    <span className="font-mono text-violet-400">{ipInfo.asn}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800/40">
                    <span className="text-slate-400">موقعیت جغرافیایی</span>
                    <span className="text-slate-200 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {ipInfo.city}، {ipInfo.region}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400">بستر اتصال</span>
                    <span className="font-semibold text-slate-200">
                      {ipInfo.hosting ? "سرور/دیتاسنتر" : ipInfo.proxy ? "پراکسی/VPN" : "شبکه خانگی/همراه"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-rose-400 text-xs py-4">موفق به دریافت اطلاعات آی‌پی شما نشدیم.</div>
              )}
            </div>

            {/* Test Launcher Button */}
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md flex flex-col gap-4">
              <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-400" />
                آزمونگر پایداری اتصال
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                با زدن دکمه زیر، مروگر شما مستقیماً به فاوآیکون سرورهای ۱۰ سایت کلیدی خارجی و داخلی درخواست ارسال کرده و میزان تاخیر (Ping) و فیلترینگ را بررسی می‌کند.
              </p>

              <button
                onClick={startScan}
                disabled={scanning}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  scanning 
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30 cursor-not-allowed" 
                    : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/15"
                }`}
              >
                {scanning ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>در حال بررسی {currentTestSite}...</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4" />
                    <span>شروع تست پایداری شبکه</span>
                  </>
                )}
              </button>

              {rateLimited && (
                <p className="text-[10px] text-amber-400 text-center leading-normal">
                  گزارش شما ثبت شد، اما به دلیل محدودیت اسپم هر ۱۰ دقیقه یکبار پذیرفته می‌شود. وضعیت خود را زنده می‌بینید!
                </p>
              )}

              {/* Personal Scan Score */}
              {getPersonalScore() !== null && (
                <div className="mt-2 p-4 bg-slate-950/40 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-medium">شاخص سلامت اینترنت شما</span>
                    <span className="text-sm font-bold text-slate-200 mt-0.5">
                      {getPersonalScore() === 100 
                        ? "کاملاً پایدار و بدون فیلتر" 
                        : getPersonalScore()! >= 70 
                        ? "دسترسی نسبی با فیلترینگ جزئی" 
                        : getPersonalScore()! >= 40 
                        ? "اختلال جدی و فیلترینگ متوسط" 
                        : "فیلترینگ شدید یا قطعی اینترنت"}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-violet-400">{getPersonalScore()}%</div>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: The Visual Radar Scanning Screen */}
          <div className="lg:col-span-1">
            <RadarChart targets={getRadarTargets()} isScanning={scanning} />
          </div>

          {/* Column 3: Live Pulse Grid (National Statistics) */}
          <div className="lg:col-span-1 flex flex-col gap-6 justify-between">
            {/* Quick Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col gap-2">
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  تعداد اسکن‌های ۲۴ ساعت گذشته
                </span>
                <span className="text-2xl md:text-3xl font-black text-sky-400">
                  {loadingStats ? "..." : dashboardStats?.total_scans_24h || 0}
                </span>
              </div>
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col gap-2">
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-violet-400" />
                  اپراتورهای پایش شده
                </span>
                <span className="text-2xl md:text-3xl font-black text-violet-400">
                  {loadingStats ? "..." : dashboardStats?.unique_isps_count || 0}
                </span>
              </div>
            </div>

            {/* Quick Live Health Status Alerts */}
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md flex-grow mt-4 lg:mt-0 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-violet-400" />
                  سیستم گزارش هوشمند اختلال
                </h2>
                
                <div className="space-y-4">
                  {/* Alert Generator based on aggregate statistics */}
                  {!loadingStats && dashboardStats?.isp_rankings ? (
                    (() => {
                      const alerts: string[] = [];
                      const mci_insta = dashboardStats.isp_rankings["Hamrah-e-Aval (MCI)"]?.["Instagram"]?.success_rate ?? 1.0;
                      const irancell_insta = dashboardStats.isp_rankings["Irancell"]?.["Instagram"]?.success_rate ?? 1.0;
                      const mci_git = dashboardStats.isp_rankings["Hamrah-e-Aval (MCI)"]?.["GitHub"]?.success_rate ?? 1.0;
                      const irancell_git = dashboardStats.isp_rankings["Irancell"]?.["GitHub"]?.success_rate ?? 1.0;

                      if (mci_insta < 0.2 && irancell_insta < 0.2) {
                        alerts.push("شبکه‌های اجتماعی (Instagram) روی تمام اپراتورها مسدود یا دارای فیلترینگ سنگین هستند.");
                      }
                      if (mci_git < 0.6 || irancell_git < 0.6) {
                        alerts.push("ابزارهای برنامه‌نویسی (GitHub) با افت کیفیت و اختلال SSL مواجه هستند.");
                      }
                      
                      if (alerts.length === 0) {
                        return (
                          <div className="flex gap-3 items-start p-3.5 bg-emerald-950/20 rounded-xl border border-emerald-500/10 text-xs text-emerald-400 leading-relaxed">
                            <span className="mt-0.5">✔</span>
                            <span>پایداری شبکه در ۲۴ ساعت گذشته در شرایط عادی و روتین قرار دارد و اختلال سراسری جدیدی ثبت نشده است.</span>
                          </div>
                        );
                      }

                      return alerts.map((alert, i) => (
                        <div key={i} className="flex gap-3 items-start p-3.5 bg-rose-950/20 rounded-xl border border-rose-500/10 text-xs text-rose-400 leading-relaxed">
                          <span className="mt-0.5">⚠️</span>
                          <span>{alert}</span>
                        </div>
                      ));
                    })()
                  ) : (
                    <div className="space-y-3 py-2">
                      <div className="h-10 bg-slate-800 rounded w-full animate-pulse" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-800/60 pt-4 text-center">
                <span className="text-[10px] text-slate-500">داده‌ها زنده هستند و به صورت کاملاً غیرمستقیم و ناشناس تجمیع می‌شوند.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Matrix comparison table across all ISPs */}
        <section className="mb-12">
          {loadingStats ? (
            <div className="w-full h-48 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-center">
              <RotateCw className="w-8 h-8 text-violet-400 animate-spin" />
            </div>
          ) : (
            <ISPStatsTable 
              ispRankings={dashboardStats?.isp_rankings || {}} 
              allSites={SITES_TO_TEST.map(s => s.name)} 
            />
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-slate-900 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-4">
        <div>
          <span>© ۲۰۲۶ پلتفرم مردمی مانیتورینگ اینترنت ایران </span>
          <span className="text-violet-500 font-bold px-1">•</span>
          <span>NetVibe.ir</span>
        </div>
        <div>
          <span>تمام تست‌ها در مرورگر شما به صورت محلی انجام می‌شوند. هیچ آدرس آی‌پی یا ردپای شخصی در سرور ذخیره نمی‌شود.</span>
        </div>
      </footer>
    </div>
  );
}
