"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface TestSession {
  id: string;
  status: string;
  score: number | null;
  startTime: string;
  endTime: string | null;
  problem: {
    id: string;
    title: string;
    difficulty: string;
  };
}

interface Application {
  id: string;
  position: string;
  status: string;
  cvUrl: string | null;
  cvAnalysis: string | null;
  coverLetter: string | null;
  createdAt: string;
  user: User;
  testSessions: TestSession[];
}

export default function AdminDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/admin/applications");
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const response = await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status: newStatus }),
      });

      if (response.ok) {
        await fetchApplications();
        if (selectedApplication?.id === applicationId) {
          const updated = applications.find((app) => app.id === applicationId);
          if (updated) {
            setSelectedApplication({ ...updated, status: newStatus });
          }
        }
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const filteredApplications = applications.filter(
    (app) => statusFilter === "all" || app.status === statusFilter,
  );

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
      reviewing: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20",
      interview: "bg-violet-500/15 text-violet-400 border border-violet-500/20",
      rejected: "bg-red-500/15 text-red-400 border border-red-500/20",
      accepted:
        "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    };
    return (
      colors[status] || "bg-gray-500/15 text-gray-400 border border-gray-500/20"
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      easy: "text-emerald-400",
      medium: "text-amber-400",
      hard: "text-red-400",
    };
    return colors[difficulty] || "text-[var(--text-muted)]";
  };

  const parseCvAnalysis = (cvAnalysis: string | null) => {
    if (!cvAnalysis) return null;
    try {
      return JSON.parse(cvAnalysis);
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 animate-spin-slow" />
          <p className="text-[var(--text-secondary)]">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] relative">
      <div className="absolute inset-0 dot-grid opacity-20" />

      {/* Top Bar */}
      <nav className="relative z-10 bg-glass-light border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
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
                <span className="text-xl font-bold text-gradient">
                  Isuma.ai
                </span>
              </Link>
              <span className="text-[var(--text-muted)] mx-2">/</span>
              <span className="text-[var(--text-secondary)] font-medium">
                Admin
              </span>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/problems"
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
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                Manage Problems
              </Link>
              <Link href="/" className="btn-secondary !py-2 !px-4 text-sm">
                Home
              </Link>
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
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-dark !w-auto !rounded-lg"
          >
            <option value="all">All Applications</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="interview">Interview</option>
            <option value="rejected">Rejected</option>
            <option value="accepted">Accepted</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications List */}
          <div className="bg-glass rounded-xl glow-ring overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border-color)]">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                Applications ({filteredApplications.length})
              </h2>
            </div>
            <div className="divide-y divide-[var(--border-color)] max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApplication(app)}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:bg-[var(--bg-card-hover)] ${
                    selectedApplication?.id === app.id
                      ? "bg-indigo-500/10 border-l-2 border-l-indigo-500"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold text-xs">
                        {(app.user.name || "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">
                          {app.user.name || "Unknown"}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)]">
                          {app.user.email}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-[var(--text-secondary)]">
                      {app.position}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {filteredApplications.length === 0 && (
                <div className="p-12 text-center text-[var(--text-muted)]">
                  <div className="text-3xl mb-3">📭</div>
                  No applications found
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="bg-glass rounded-xl glow-ring overflow-hidden">
            {selectedApplication ? (
              <>
                <div className="px-6 py-4 border-b border-[var(--border-color)]">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-violet-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Application Details
                  </h2>
                </div>
                <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto space-y-6">
                  {/* Candidate Info */}
                  <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]">
                    <h3 className="font-semibold text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                      Candidate
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Name</span>
                        <span>{selectedApplication.user.name || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Email</span>
                        <span>{selectedApplication.user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">
                          Position
                        </span>
                        <span>{selectedApplication.position}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">
                          Applied
                        </span>
                        <span>
                          {new Date(
                            selectedApplication.createdAt,
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Update Status */}
                  <div>
                    <h3 className="font-semibold text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                      Update Status
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "pending",
                        "reviewing",
                        "interview",
                        "rejected",
                        "accepted",
                      ].map((status) => (
                        <button
                          key={status}
                          onClick={() =>
                            updateStatus(selectedApplication.id, status)
                          }
                          disabled={
                            updating || selectedApplication.status === status
                          }
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                            selectedApplication.status === status
                              ? "bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-color)]"
                              : "bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:shadow-lg hover:shadow-indigo-500/25"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CV Analysis */}
                  {selectedApplication.cvAnalysis && (
                    <div>
                      <h3 className="font-semibold text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        AI CV Analysis
                      </h3>
                      <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]">
                        <pre className="whitespace-pre-wrap font-mono text-xs text-[var(--text-secondary)] overflow-x-auto">
                          {JSON.stringify(
                            parseCvAnalysis(selectedApplication.cvAnalysis),
                            null,
                            2,
                          )}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Cover Letter */}
                  {selectedApplication.coverLetter && (
                    <div>
                      <h3 className="font-semibold text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                        Cover Letter
                      </h3>
                      <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)] text-sm text-[var(--text-secondary)] leading-relaxed">
                        {selectedApplication.coverLetter}
                      </div>
                    </div>
                  )}

                  {/* Test Sessions */}
                  <div>
                    <h3 className="font-semibold text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                      Test Sessions ({selectedApplication.testSessions.length})
                    </h3>
                    {selectedApplication.testSessions.length > 0 ? (
                      <div className="space-y-3">
                        {selectedApplication.testSessions.map((session) => (
                          <div
                            key={session.id}
                            className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium text-sm">
                                  {session.problem.title}
                                </h4>
                                <p
                                  className={`text-xs font-medium mt-0.5 ${getDifficultyColor(session.problem.difficulty)}`}
                                >
                                  {session.problem.difficulty.toUpperCase()}
                                </p>
                              </div>
                              <span className="text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-card)] px-2 py-0.5 rounded">
                                {session.status}
                              </span>
                            </div>
                            <div className="text-xs text-[var(--text-muted)] space-y-1 mt-2">
                              <p>
                                Score:{" "}
                                {session.score !== null ? (
                                  <span
                                    className={
                                      session.score >= 70
                                        ? "text-emerald-400"
                                        : session.score >= 50
                                          ? "text-amber-400"
                                          : "text-red-400"
                                    }
                                  >
                                    {session.score}%
                                  </span>
                                ) : (
                                  "N/A"
                                )}
                              </p>
                              <p>
                                Started:{" "}
                                {new Date(session.startTime).toLocaleString()}
                              </p>
                              {session.endTime && (
                                <p>
                                  Ended:{" "}
                                  {new Date(session.endTime).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--text-muted)]">
                        No test sessions yet
                      </p>
                    )}
                  </div>

                  {/* CV Link */}
                  {selectedApplication.cvUrl && (
                    <a
                      href={selectedApplication.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
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
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download CV
                    </a>
                  )}
                </div>
              </>
            ) : (
              <div className="p-16 text-center text-[var(--text-muted)] flex flex-col items-center gap-3">
                <svg
                  className="w-12 h-12 text-[var(--border-color)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
                <p>Select an application to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
