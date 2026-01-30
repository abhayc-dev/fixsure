import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, CheckCircle, ArrowRight, Smartphone, Zap, FileText, Clock } from "lucide-react";
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
              className="hidden sm:inline-flex bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-slate-800 transition-all hover:shadow-lg active:scale-95"
            >
              Create Account 
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {/* Hero Section */}
   <main className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
  {/* Background */}
  <div className="absolute inset-0 -z-10 bg-[#FFFBF9]">
    {/* Subtle Grid */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:24px_24px]" />

    {/* Gradient Blobs */}
    <div className="absolute -top-[10%] -right-[5%] w-[600px] h-[600px] bg-orange-200/30 rounded-full blur-[120px]" />
    <div className="absolute -bottom-[10%] -left-[10%] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px]" />
  </div>

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">

      {/* LEFT CONTENT */}
      <div className="flex-1 text-center lg:text-left space-y-7 relative z-10">

        {/* Trust Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#FF6442] opacity-75 animate-ping"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6442]"></span>
          </span>
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Trusted by 500+ Repair Shops
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter text-slate-900 leading-[1.05]">
          Ab Kagaz Chhodo, Digital Bano
        </h1>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6442] via-[#FF8C6B] to-[#FF4D4D]">
            Repair aur Warranty
          </span>{" "}
          — dono easily manage karo
        </h2>

        {/* Sub headline */}
        <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
          Manage <strong>Job Sheets</strong>, track <strong>Repairs</strong>, and issue{" "}
          <strong>Verified Warranties</strong> — all in one simple, secure platform.
        </p>

        {/* Form */}
        <div className="w-full max-w-2xl mx-auto lg:mx-0">
          <HomeHeroForm />
        </div>

        {/* Bottom Trust Line */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-400 uppercase tracking-widest pt-3">
          <span>Paperless & Secure Records</span>
          <span className="hidden sm:block w-1 h-1 bg-slate-300 rounded-full"></span>
          <span>Trusted by Repair Shops</span>
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="hidden lg:flex flex-1 relative justify-center items-center">
        <div className="relative group">

          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-blue-500/10 rounded-full blur-[80px] scale-95 group-hover:scale-100 transition-transform duration-700" />

          {/* Hero Image */}
          <Image
            src="/hero-image.png"
            alt="Repair & Warranty Management Platform"
            width={750}
            height={750}
            priority
            className="relative z-10 w-[115%] max-w-[700px] object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.25)] transition-transform duration-700 group-hover:scale-[1.02]"
          />

          {/* Verified Warranties Card */}
          <div className="absolute -bottom-8 -right-6 bg-white border border-slate-100 p-5 pr-8 rounded-3xl shadow-xl flex items-center gap-5 motion-safe:animate-bounce">
            <div className="bg-gradient-to-br from-[#FF6442] to-[#ff8c6b] p-3.5 rounded-2xl shadow-lg shadow-orange-200">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Verified Warranties
              </p>
              <p className="text-3xl font-black text-slate-900">25k+</p>
            </div>
          </div>

          {/* System Online */}
          <div className="absolute top-16 -left-16 bg-white border border-slate-100 px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-[#FF6442] rounded-full shadow-[0_0_10px_rgba(255,100,66,0.6)]"></span>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              System Online
            </p>
          </div>

        </div>
      </div>

    </div>
  </div>
</main>


      {/* Trusted By / Supported Categories Bar */}
      <div className="bg-white border-y border-slate-100 py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-10">Powering Repairs For</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
                {[
                    { icon: Smartphone, label: "Mobile & Tech", color: "text-blue-500" },
                    { icon: Zap, label: "Electrical Motors", color: "text-yellow-500" },
                    { icon: CheckCircle, label: "Home Appliances", color: "text-green-500" },
                    { icon: Clock, label: "Watches & More", color: "text-purple-500" }
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 group cursor-default transition-all duration-300 hover:-translate-y-1">
                        <div className={`p-2 rounded-lg bg-slate-50 group-hover:bg-white border border-transparent group-hover:border-slate-100 group-hover:shadow-sm transition-all`}>
                             <item.icon className="w-6 h-6 text-slate-400 group-hover:text-slate-900 transition-colors" />
                        </div>
                        <span className="font-bold text-slate-500 group-hover:text-slate-900 transition-colors">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Workflow Section - "Process Flow" */}
      <section className="py-24 bg-gradient-to-b from-[#FFFBF9] to-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Your Complete Digital Workflow</h2>
            <p className="text-lg text-slate-500 mt-6 max-w-2xl mx-auto">Stop using notebooks. Switch to a professional system that tracks every device from entry to exit.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
             {/* Connector Line (Desktop) */}
             <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-orange-200 via-blue-200 to-green-200 -z-10"></div>

             {/* Step 1: Intake */}
             <div className="flex flex-col items-center text-center group cursor-default">
                <div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-orange-100/50 border border-orange-100 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative">
                    <div className="absolute -top-4 -right-4 w-10 h-10 bg-[#FF6442] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-orange-500/30">1</div>
                    <FileText className="w-10 h-10 text-[#FF6442]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Create Job Sheet</h3>
                <p className="text-slate-500 leading-relaxed text-sm px-4">
                    Customer arrives with a <strong>broken Motor/Mobile</strong>. Create a digital entry, note the defects, and estimate cost instantly.
                </p>
             </div>

             {/* Step 2: Repair */}
             <div className="flex flex-col items-center text-center group cursor-default">
                <div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-blue-100/50 border border-blue-100 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 relative">
                    <div className="absolute -top-4 -right-4 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/30">2</div>
                    <Smartphone className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Track & Notify</h3>
                <p className="text-slate-500 leading-relaxed text-sm px-4">
                    Update status: <em>"Pending Parts"</em> or <em>"Ready"</em>. Keep the customer updated via <strong>automated WhatsApp/SMS</strong> alerts.
                </p>
             </div>

             {/* Step 3: Warranty */}
             <div className="flex flex-col items-center text-center group cursor-default">
                 <div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-green-100/50 border border-green-100 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative">
                    <div className="absolute -top-4 -right-4 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-green-500/30">3</div>
                    <ShieldCheck className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Issue Verified Warranty</h3>
                <p className="text-slate-500 leading-relaxed text-sm px-4">
                    On delivery, issue a <strong>QR-Verified Digital Warranty</strong>. It builds trust and ensures customer data is saved for future marketing.
                </p>
             </div>

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
