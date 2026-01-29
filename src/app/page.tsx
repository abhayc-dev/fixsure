import Link from "next/link";
import { ShieldCheck, CheckCircle, ArrowRight, Smartphone, Zap, FileText } from "lucide-react";
import HomeHeroForm from "@/components/HomeHeroForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFFBF9] font-sans text-slate-900 selection:bg-[#FF6442] selection:text-white">

      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-orange-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#FF6442] p-1.5 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">FixSure</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-600 hover:text-[#FF6442] transition-colors"
            >
              Partner Login
            </Link>
            <Link
              href="/login"
              className="hidden sm:inline-flex bg-slate-900 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-slate-800 transition-all hover:shadow-lg active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left space-y-8 animate-in slide-in-from-bottom-5 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-100 rounded-full text-orange-600 text-xs font-bold uppercase tracking-wider mb-2">
                <Zap className="w-3 h-3 fill-orange-600" />
                #1 App for Repair Shops
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Simpler <span className="text-[#FF6442]">Warranties.</span> <br className="hidden lg:block" />
                Better Business.
              </h1>

              <p className="text-lg text-slate-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Issue digital warranties, manage repair job sheets, and track your shop's growth in one dashboard. No more paper slips.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-lg shadow-sm text-sm font-medium text-slate-700">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Free Forever Plan
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-lg shadow-sm text-sm font-medium text-slate-700">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Instant Setup
                </div>
              </div>

              {/* Mobile Only Form Container (Visible only on small screens below layout switch) */}
              <div className="lg:hidden w-full max-w-sm mx-auto mt-6">
                <HomeHeroForm />
              </div>
            </div>

            {/* Right Content - Hero Form / Visuals */}
            <div className="hidden lg:block flex-1 relative animate-in slide-in-from-right-5 duration-1000 delay-200">
              {/* Decorative Background Elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-3xl -z-10"></div>

              <div className="relative z-10 bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white/50 shadow-xl ring-1 ring-black/5 max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Start Growing Today</h3>
                  <p className="text-sm text-slate-500 mb-6">Enter your mobile number to create your shop account instantly.</p>
                  <HomeHeroForm />
                </div>

                {/* Floating Badges */}
                <div className="absolute -top-6 -right-6 bg-white p-3 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3 animate-bounce shadow-orange-100/50" style={{ animationDuration: '3s' }}>
                  <div className="bg-green-100 p-2 rounded-full">
                    <Smartphone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Warranties Issued</p>
                    <p className="text-sm font-bold text-slate-900">10,000+</p>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 bg-white p-3 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3 animate-bounce shadow-blue-100/50" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Job Sheets</p>
                    <p className="text-sm font-bold text-slate-900">Digital & PDF</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Everything you need to run your shop.</h2>
            <p className="text-slate-500 mt-4">Replace your paper notebook with a powerful digital assistant.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Digital Warranties", icon: ShieldCheck, desc: "Issue verifiable warranty cards sent directly to customers via SMS/WhatsApp." },
              { title: "Job Sheets", icon: FileText, desc: "Create professional repair estimates and job sheets. Track status from Received to Delivered." },
              { title: "SMS Alerts", icon: Smartphone, desc: "Keep customers updated automatically. Build trust and reduce manual follow-ups." }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100 hover:bg-orange-50/30 hover:border-orange-100 transition-colors group">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-[#FF6442]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-slate-500" />
            <span className="text-sm font-semibold text-slate-300">FixSure &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
