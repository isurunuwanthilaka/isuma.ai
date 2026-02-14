import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 dot-grid opacity-30" />
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] animate-blob" />
      <div
        className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-blob"
        style={{ animationDelay: "3s" }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/5 rounded-full blur-[150px]" />

      {/* Navigation */}
      <nav className="relative z-10 bg-glass-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gradient">Isuma.ai</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium"
            >
              For Developers
            </Link>
            <Link
              href="/admin"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium"
            >
              For Companies
            </Link>
            <Link
              href="/applications/new"
              className="btn-primary text-sm !py-2 !px-5"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full px-4 py-1.5 mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-sm text-[var(--text-secondary)]">
              AI-Powered Hiring Platform
            </span>
          </div>

          {/* Heading */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            Hire Smarter with
            <br />
            <span className="text-gradient">Artificial Intelligence</span>
          </h1>

          <p
            className="text-lg sm:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto animate-fade-in-up leading-relaxed"
            style={{ animationDelay: "0.2s" }}
          >
            Streamline your hiring pipeline with intelligent CV screening, timed
            coding assessments, and real-time AI proctoring — all in one
            platform.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Link
              href="/dashboard"
              className="btn-primary text-lg !py-4 !px-10 inline-flex items-center justify-center gap-2"
            >
              <span>Developer Login</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/admin"
              className="btn-secondary text-lg !py-4 !px-10 inline-flex items-center justify-center gap-2"
            >
              <span>Company Login</span>
            </Link>
          </div>
        </div>

        {/* Floating Stats */}
        <div
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          {[
            { value: "95%", label: "Accuracy", icon: "🎯" },
            { value: "<2min", label: "CV Analysis", icon: "⚡" },
            { value: "360°", label: "Proctoring", icon: "🛡️" },
            { value: "24/7", label: "Available", icon: "🌐" },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-glass rounded-2xl p-5 text-center glow-ring-hover transition-all duration-300 hover:translate-y-[-4px]"
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-gradient">
                {stat.value}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 border-t border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Powered by <span className="text-gradient">Advanced AI</span>
            </h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              Every step of the hiring process is enhanced with cutting-edge
              artificial intelligence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-glass rounded-2xl p-8 card-glow glow-ring-hover transition-all duration-300 hover:translate-y-[-6px] group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart CV Screening</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                AI analyzes resumes in seconds, extracting skills, experience,
                and fit scores with natural language processing.
              </p>
              <div className="mt-6 flex items-center gap-2 text-indigo-400 text-sm font-medium">
                <span>LLM-Powered Analysis</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-glass rounded-2xl p-8 card-glow glow-ring-hover transition-all duration-300 hover:translate-y-[-6px] group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7 text-violet-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Timed Code Assessments
              </h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Real-time coding challenges with auto-evaluation, multiple
                difficulty levels, and fair time tracking.
              </p>
              <div className="mt-6 flex items-center gap-2 text-violet-400 text-sm font-medium">
                <span>Auto-Graded Solutions</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-glass rounded-2xl p-8 card-glow glow-ring-hover transition-all duration-300 hover:translate-y-[-6px] group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7 text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Proctoring</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Multimodal AI monitors camera feeds, detects tab switches, and
                prevents copy-paste — ensuring fair assessments.
              </p>
              <div className="mt-6 flex items-center gap-2 text-cyan-400 text-sm font-medium">
                <span>Multimodal LLM Vision</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative z-10 py-24 border-t border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How <span className="text-gradient">It Works</span>
            </h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              A seamless hiring flow from application to offer
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Apply",
                desc: "Submit your application with resume",
                icon: "📄",
              },
              {
                step: "02",
                title: "AI Screen",
                desc: "AI analyzes your qualifications",
                icon: "🤖",
              },
              {
                step: "03",
                title: "Code Test",
                desc: "Take a proctored coding challenge",
                icon: "💻",
              },
              {
                step: "04",
                title: "Results",
                desc: "Get scored and reviewed by AI",
                icon: "🏆",
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center group">
                {i < 3 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-[var(--border-color)] to-transparent" />
                )}
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-glass flex items-center justify-center text-3xl glow-ring group-hover:scale-110 transition-all duration-300">
                  {item.icon}
                </div>
                <div className="text-xs font-mono text-indigo-400 mb-2">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border-color)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="font-semibold text-gradient">Isuma.ai</span>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            © 2026 Isuma.ai — AI-Powered Hiring Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
