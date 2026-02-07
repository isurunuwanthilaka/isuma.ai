"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Application {
  id: string;
  position: string;
  status: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
  cvAnalysis: string | null;
}

export default function RecruiterDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [userEmail, setUserEmail] = useState<string>("");
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    fetchApplications();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || "");
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/admin/applications");
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(
    (app) => filter === "all" || app.status === filter,
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
      reviewing: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20",
      interview: "bg-violet-500/15 text-violet-400 border border-violet-500/20",
      accepted:
        "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
      rejected: "bg-red-500/15 text-red-400 border border-red-500/20",
    };
    return (
      colors[status] || "bg-gray-500/15 text-gray-400 border border-gray-500/20"
    );
  };

  const getScore = (cvAnalysis: string | null): number | null => {
    if (!cvAnalysis) return null;
    try {
      const analysis = JSON.parse(cvAnalysis);
      return analysis.overall_fit_score || null;
    } catch {
      return null;
    }
  };

  const statusCounts = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 animate-spin-slow" />
          <p className="text-[var(--text-secondary)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] relative">
      {/* Background */}
      <div className="absolute inset-0 dot-grid opacity-20" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px]" />

      {/* Top Bar */}
      <nav className="relative z-10 bg-glass-light border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              <span className="text-xl font-bold text-gradient">Isuma.ai</span>
            </Link>
            <span className="text-[var(--text-muted)] mx-2">/</span>
            <span className="text-[var(--text-secondary)] font-medium">
              Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/problems"
              className="btn-secondary !py-2 !px-4 text-sm inline-flex items-center gap-2"
            >
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
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              Problems
            </Link>
            <Link
              href="/admin"
              className="btn-primary !py-2 !px-4 text-sm inline-flex items-center gap-2"
            >
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
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              Admin
            </Link>
            {userEmail && (
              <span className="text-sm text-[var(--text-muted)] hidden md:inline">
                {userEmail}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="btn-secondary !py-2 !px-4 text-sm inline-flex items-center gap-2 !border-red-400/30 hover:!bg-red-500/10"
            >
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Recruiter Dashboard</h1>
          <p className="text-[var(--text-secondary)]">
            Review and manage incoming job applications
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            {
              label: "Total",
              count: applications.length,
              color: "from-indigo-500 to-violet-500",
            },
            {
              label: "Pending",
              count: statusCounts["pending"] || 0,
              color: "from-amber-500 to-orange-500",
            },
            {
              label: "Reviewing",
              count: statusCounts["reviewing"] || 0,
              color: "from-blue-500 to-indigo-500",
            },
            {
              label: "Interview",
              count: statusCounts["interview"] || 0,
              color: "from-violet-500 to-purple-500",
            },
            {
              label: "Accepted",
              count: statusCounts["accepted"] || 0,
              color: "from-emerald-500 to-green-500",
            },
          ].map((stat, i) => (
            <div key={i} className="bg-glass rounded-xl p-4 glow-ring">
              <div className="text-sm text-[var(--text-muted)] mb-1">
                {stat.label}
              </div>
              <div
                className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
              >
                {stat.count}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-glass rounded-xl p-4 mb-6 glow-ring">
          <div className="flex gap-2 flex-wrap">
            {[
              "all",
              "pending",
              "reviewing",
              "interview",
              "accepted",
              "rejected",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === status
                    ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="bg-glass rounded-xl p-12 text-center glow-ring">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-[var(--text-muted)]">No applications found</p>
            </div>
          ) : (
            filteredApplications.map((app) => {
              const score = getScore(app.cvAnalysis);
              return (
                <div
                  key={app.id}
                  className="bg-glass rounded-xl p-6 card-glow glow-ring-hover transition-all duration-300 hover:translate-y-[-2px]"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold text-sm">
                          {(app.user.name || "U")[0].toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {app.user.name || "N/A"}
                          </h3>
                          <p className="text-sm text-[var(--text-muted)]">
                            {app.user.email}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                          <svg
                            className="w-4 h-4 text-[var(--text-muted)]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          {app.position}
                        </div>
                        <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {new Date(app.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}
                      >
                        {app.status}
                      </span>
                      {score !== null && (
                        <div className="text-right">
                          <div className="text-xs text-[var(--text-muted)] mb-0.5">
                            AI Score
                          </div>
                          <div
                            className={`text-xl font-bold ${
                              score >= 70
                                ? "text-emerald-400"
                                : score >= 50
                                  ? "text-amber-400"
                                  : "text-red-400"
                            }`}
                          >
                            {score}
                            <span className="text-sm text-[var(--text-muted)]">
                              /100
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                    <Link
                      href={`/admin?applicationId=${app.id}`}
                      className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors"
                    >
                      View Details
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
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
