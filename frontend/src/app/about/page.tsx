import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Eye,
  HeartHandshake,
  LockKeyhole,
  Radar,
  ShieldCheck,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "درباره ما | NetVibe",
  description: "آشنایی با هدف و شیوه کار پلتفرم مردمی NetVibe",
};

const values = [
  {
    icon: Eye,
    title: "شفافیت بیشتر",
    description: "با کنار هم گذاشتن تجربه‌های واقعی کاربران، تصویر روشن‌تری از وضعیت شبکه ارائه می‌کنیم.",
    color: "text-sky-400",
    background: "bg-sky-500/10",
  },
  {
    icon: Users,
    title: "مشارکت جمعی",
    description: "هر تست ساده به داده‌ای مفید تبدیل می‌شود و به دیگران کمک می‌کند آگاهانه‌تر تصمیم بگیرند.",
    color: "text-violet-400",
    background: "bg-violet-500/10",
  },
  {
    icon: LockKeyhole,
    title: "حریم خصوصی",
    description: "تست‌ها در مرورگر شما انجام می‌شوند و گزارش‌ها بدون ذخیره اطلاعات شخصی تجمیع می‌شوند.",
    color: "text-emerald-400",
    background: "bg-emerald-500/10",
  },
];

const steps = [
  {
    number: "۱",
    title: "تست اتصال",
    description: "مرورگر شما دسترسی به چند سرویس منتخب را بررسی می‌کند.",
  },
  {
    number: "۲",
    title: "گزارش ناشناس",
    description: "نتیجه تست، بدون اطلاعات هویتی، به آمار جمعی اضافه می‌شود.",
  },
  {
    number: "۳",
    title: "تصویر زنده شبکه",
    description: "نتایج کنار هم قرار می‌گیرند تا وضعیت اپراتورها و سرویس‌ها مشخص شود.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 selection:bg-violet-500/30 md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-12 flex flex-col items-center justify-between gap-5 border-b border-slate-900 pb-6 md:flex-row">
          <Link href="/" className="flex items-center gap-3" aria-label="بازگشت به داشبورد NetVibe">
            <div className="h-12 w-12 overflow-hidden rounded-2xl border border-slate-800 shadow-lg shadow-violet-500/10">
              <img src="/icon.svg" alt="لوگوی NetVibe" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-sky-400 bg-clip-text text-2xl font-black text-transparent">
                NetVibe
              </p>
              <p className="mt-1 text-xs text-slate-400">نبض زنده شبکه اینترنت ایران</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2 text-sm" aria-label="ناوبری اصلی">
            <Link
              href="/"
              className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2 text-slate-300 transition-colors hover:border-violet-500/40 hover:text-white"
            >
              داشبورد
            </Link>
            <span className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-2 font-medium text-violet-300">
              درباره ما
            </span>
          </nav>
        </header>

        <section className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/60 via-slate-900/80 to-slate-900/60 px-6 py-12 text-center md:px-16 md:py-16">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="relative mx-auto max-w-3xl">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
              <Radar className="h-7 w-7" />
            </div>
            <p className="mb-3 text-sm font-semibold text-violet-300">درباره NetVibe</p>
            <h1 className="text-3xl font-black leading-tight text-white md:text-5xl">
              نبض شبکه را با هم می‌سنجیم
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-slate-300 md:text-base">
              NetVibe یک پلتفرم مردمی برای مشاهده وضعیت دسترسی، پایداری و اختلالات اینترنت در ایران است؛ جایی که تجربه‌های کوچک کاربران به یک تصویر بزرگ و قابل فهم تبدیل می‌شود.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/15 transition-all hover:from-violet-500 hover:to-indigo-500"
            >
              مشاهده وضعیت شبکه
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="values-title">
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold text-violet-400">چیزی که برای ما مهم است</p>
            <h2 id="values-title" className="mt-2 text-2xl font-black text-white">
              ساده، جمعی و قابل اعتماد
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <article key={value.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
                  <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${value.background} ${value.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{value.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{value.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8" aria-labelledby="how-title">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold text-sky-400">روند کار</p>
              <h2 id="how-title" className="mt-2 text-2xl font-black text-white">
                از یک تست کوتاه تا یک گزارش مفید
              </h2>
            </div>
            <Activity className="hidden h-8 w-8 text-sky-400/70 md:block" />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.number} className="relative flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-sm font-black text-sky-300">
                  {step.number}
                </div>
                <div>
                  <h3 className="font-bold text-slate-100">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-400">{step.description}</p>
                </div>
                {index < steps.length - 1 && <div className="absolute right-5 top-12 hidden h-px w-8 bg-slate-800 md:block" />}
              </div>
            ))}
          </div>
        </section>

        <section className="my-12 flex flex-col items-start justify-between gap-5 rounded-2xl border border-emerald-500/15 bg-emerald-950/10 p-6 md:flex-row md:items-center md:p-8">
          <div className="flex items-start gap-4">
            <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-emerald-400" />
            <div>
              <h2 className="font-bold text-emerald-300">یک تشکر کوچک از شما</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
                هر بار که تست شبکه را اجرا می‌کنید، به درک بهتر وضعیت اینترنت برای همه کمک می‌کنید. ممنون که در ساختن این تصویر مشترک کنار ما هستید.
              </p>
            </div>
          </div>
          <HeartHandshake className="hidden h-10 w-10 text-emerald-400/60 md:block" />
        </section>

        <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-900 py-6 text-xs text-slate-500 md:flex-row">
          <span>© ۲۰۲۶ پلتفرم مردمی NetVibe</span>
          <Link href="/" className="transition-colors hover:text-violet-300">
            بازگشت به داشبورد
          </Link>
        </footer>
      </div>
    </main>
  );
}
