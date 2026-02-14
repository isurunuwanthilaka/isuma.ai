"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  company: {
    name: string | null;
    email: string;
  };
  createdAt: string;
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
  createdAt: string;
  job: {
    id: string;
    title: string;
    company: {
      name: string | null;
      email: string;
    };
  };
  testSessions: TestSession[];
}

export default function DeveloperDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"jobs" | "applications">("jobs");
  const [userEmail, setUserEmail] = useState<string>("");
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const fetchUser = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || "");
    }
  }, [supabase.auth]);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch("/api/jobs");
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  }, []);

  const fetchMyApplications = useCallback(async () => {
    try {
      const response = await fetch("/api/applications/my");
      if (response.ok) {
        const data = await response.json();
        setMyApplications(data.applications || []);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchJobs();
    fetchMyApplications();
  }, [fetchUser, fetchJobs, fetchMyApplications]);

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
      reviewing: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20",
      test_assigned:
        "bg-violet-500/15 text-violet-400 border border-violet-500/20",
      accepted:
        "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
      rejected: "bg-red-500/15 text-red-400 border border-red-500/20",
    };
    return (
      colors[status] || "bg-gray-500/15 text-gray-400 border border-gray-500/20"
    );
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pending Review",
      reviewing: "Under Review",
      test_assigned: "Test Assigned",
      accepted: "Accepted",
      rejected: "Rejected",
    };
    return labels[status] || status;
  };

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
              Developer Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
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

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "jobs"
                ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Available Jobs
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "applications"
                ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            My Applications
          </button>
        </div>

        {/* Jobs Board */}
        {activeTab === "jobs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                Browse Open Positions
              </h2>
              <span className="text-sm text-[var(--text-muted)]">
                {jobs.length} {jobs.length === 1 ? "job" : "jobs"} available
              </span>
            </div>

            {jobs.length === 0 ? (
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-12 text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]"
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
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  No jobs available yet
                </h3>
                <p className="text-[var(--text-secondary)]">
                  Check back later for new opportunities
                </p>
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                        {job.title}
                      </h3>
                      <p className="text-sm text-[var(--text-muted)]">
                        Posted by {job.company.name || job.company.email}
                      </p>
                    </div>
                    <Link
                      href={`/applications/new?jobId=${job.id}`}
                      className="btn-primary !py-2 !px-4 text-sm"
                    >
                      Apply Now
                    </Link>
                  </div>
                  <p className="text-[var(--text-secondary)] mb-4">
                    {job.description}
                  </p>
                  {job.requirements && (
                    <div className="text-sm text-[var(--text-muted)]">
                      <span className="font-medium">Requirements:</span>{" "}
                      {job.requirements}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* My Applications */}
        {activeTab === "applications" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                My Applications
              </h2>
              <span className="text-sm text-[var(--text-muted)]">
                {myApplications.length}{" "}
                {myApplications.length === 1 ? "application" : "applications"}
              </span>
            </div>

            {myApplications.length === 0 ? (
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-12 text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  No applications yet
                </h3>
                <p className="text-[var(--text-secondary)] mb-4">
                  Start applying to jobs to see them here
                </p>
                <button
                  onClick={() => setActiveTab("jobs")}
                  className="btn-primary"
                >
                  Browse Jobs
                </button>
              </div>
            ) : (
              myApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                        {app.job.title}
                      </h3>
                      <p className="text-sm text-[var(--text-muted)]">
                        {app.job.company.name || app.job.company.email}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}
                    >
                      {getStatusLabel(app.status)}
                    </span>
                  </div>

                  <div className="text-sm text-[var(--text-muted)] mb-4">
                    Applied on {new Date(app.createdAt).toLocaleDateString()}
                  </div>

                  {/* Test Sessions */}
                  {app.testSessions && app.testSessions.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                        Coding Assignments:
                      </h4>
                      {app.testSessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                session.status === "completed"
                                  ? "bg-emerald-500"
                                  : session.status === "in_progress"
                                    ? "bg-amber-500"
                                    : "bg-gray-500"
                              }`}
                            />
                            <div>
                              <p className="text-sm font-medium text-[var(--text-primary)]">
                                {session.problem.title}
                              </p>
                              <p className="text-xs text-[var(--text-muted)]">
                                {session.problem.difficulty} •{" "}
                                {session.status === "completed"
                                  ? `Score: ${session.score || 0}%`
                                  : session.status}
                              </p>
                            </div>
                          </div>
                          {session.status !== "completed" && (
                            <Link
                              href={`/test/${session.id}`}
                              className="btn-primary !py-1.5 !px-4 text-sm"
                            >
                              Start Test
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
