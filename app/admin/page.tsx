"use client";

import { useEffect, useState, useCallback } from "react";
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
  job: {
    id: string;
    title: string;
  };
}

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  status: string;
  createdAt: string;
  _count: {
    applications: number;
  };
}

export default function CompanyDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"jobs" | "applications">("jobs");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    requirements: "",
  });
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const fetchApplications = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/applications");
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/jobs");
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
    fetchJobs();
  }, [fetchApplications, fetchJobs]);

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
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

  const createJob = async () => {
    try {
      const response = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJob),
      });

      if (response.ok) {
        await fetchJobs();
        setShowCreateJob(false);
        setNewJob({ title: "", description: "", requirements: "" });
      }
    } catch (error) {
      console.error("Failed to create job:", error);
    }
  };

  const toggleJobStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "closed" : "active";
    try {
      const response = await fetch("/api/admin/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, status: newStatus }),
      });

      if (response.ok) {
        await fetchJobs();
      }
    } catch (error) {
      console.error("Failed to update job status:", error);
    }
  };

  const filteredApplications = applications.filter(
    (app) => statusFilter === "all" || app.status === statusFilter,
  );

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

  const getScore = (cvAnalysis: string | null): number | null => {
    if (!cvAnalysis) return null;
    try {
      const analysis = JSON.parse(cvAnalysis);
      return analysis.overall_fit_score || null;
    } catch {
      return null;
    }
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
              Company Portal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/problems"
              className="btn-secondary !py-2 !px-4 text-sm"
            >
              Manage Problems
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
            Job Postings
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "applications"
                ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Applications
          </button>
        </div>

        {/* Jobs Management */}
        {activeTab === "jobs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                Your Job Postings
              </h2>
              <button
                onClick={() => setShowCreateJob(true)}
                className="btn-primary"
              >
                + Post New Job
              </button>
            </div>

            {/* Create Job Modal */}
            {showCreateJob && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 max-w-2xl w-full">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">
                    Post New Job
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={newJob.title}
                        onChange={(e) =>
                          setNewJob({ ...newJob, title: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]"
                        placeholder="e.g. Senior Full Stack Developer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Description
                      </label>
                      <textarea
                        value={newJob.description}
                        onChange={(e) =>
                          setNewJob({ ...newJob, description: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] min-h-[120px]"
                        placeholder="Describe the role and responsibilities..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Requirements
                      </label>
                      <textarea
                        value={newJob.requirements}
                        onChange={(e) =>
                          setNewJob({ ...newJob, requirements: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] min-h-[100px]"
                        placeholder="List key requirements and qualifications..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={createJob} className="btn-primary flex-1">
                      Create Job
                    </button>
                    <button
                      onClick={() => setShowCreateJob(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                  No jobs posted yet
                </h3>
                <p className="text-[var(--text-secondary)] mb-4">
                  Start by posting your first job opening
                </p>
                <button
                  onClick={() => setShowCreateJob(true)}
                  className="btn-primary"
                >
                  Post New Job
                </button>
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                        {job.title}
                      </h3>
                      <p className="text-[var(--text-secondary)] mb-2">
                        {job.description}
                      </p>
                      {job.requirements && (
                        <p className="text-sm text-[var(--text-muted)]">
                          <span className="font-medium">Requirements:</span>{" "}
                          {job.requirements}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${job.status === "active" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-gray-500/15 text-gray-400 border border-gray-500/20"}`}
                      >
                        {job.status}
                      </span>
                      <button
                        onClick={() => toggleJobStatus(job.id, job.status)}
                        className="text-sm text-indigo-400 hover:text-indigo-300"
                      >
                        {job.status === "active" ? "Close" : "Reopen"}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)] text-sm text-[var(--text-muted)]">
                    <span>{job._count.applications} applications received</span>
                    <span>
                      Posted on {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Applications Review */}
        {activeTab === "applications" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                Review Applications
              </h2>
              <span className="text-sm text-[var(--text-muted)]">
                {applications.length} total applications
              </span>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap mb-6">
              {[
                "all",
                "pending",
                "reviewing",
                "test_assigned",
                "accepted",
                "rejected",
              ].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    statusFilter === status
                      ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg"
                      : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {status === "all" ? "All" : status.replace("_", " ")}
                </button>
              ))}
            </div>

            {filteredApplications.length === 0 ? (
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-12 text-center">
                <p className="text-[var(--text-muted)]">
                  No applications found
                </p>
              </div>
            ) : (
              filteredApplications.map((app) => {
                const score = getScore(app.cvAnalysis);
                return (
                  <div
                    key={app.id}
                    className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 hover:border-indigo-500/30 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold">
                            {(app.user.name || "U")[0].toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">
                              {app.user.name || "N/A"}
                            </h3>
                            <p className="text-sm text-[var(--text-muted)]">
                              {app.user.email}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mb-1">
                          Applied for: {app.job.title}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          Applied on{" "}
                          {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}
                        >
                          {app.status.replace("_", " ")}
                        </span>
                        {score !== null && (
                          <div className="text-right">
                            <div className="text-xs text-[var(--text-muted)]">
                              AI Score
                            </div>
                            <div
                              className={`text-lg font-bold ${score >= 70 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400"}`}
                            >
                              {score}/100
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-[var(--border-color)]">
                      <button
                        onClick={() => setSelectedApplication(app)}
                        className="btn-primary !py-1.5 !px-4 text-sm"
                      >
                        View Details
                      </button>
                      {app.status === "pending" && (
                        <button
                          onClick={() => updateStatus(app.id, "reviewing")}
                          className="btn-secondary !py-1.5 !px-4 text-sm"
                        >
                          Start Review
                        </button>
                      )}
                      {app.status === "reviewing" && (
                        <button
                          onClick={() => updateStatus(app.id, "test_assigned")}
                          className="btn-secondary !py-1.5 !px-4 text-sm"
                        >
                          Assign Test
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Application Details Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 max-w-4xl w-full my-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                    {selectedApplication.user.name || "Applicant"}
                  </h3>
                  <p className="text-[var(--text-muted)]">
                    {selectedApplication.user.email}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                    Position
                  </h4>
                  <p className="text-[var(--text-primary)]">
                    {selectedApplication.job.title}
                  </p>
                </div>

                {selectedApplication.cvAnalysis && (
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                      AI CV Analysis
                    </h4>
                    <pre className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-4 text-sm text-[var(--text-primary)] overflow-auto max-h-[300px]">
                      {JSON.stringify(
                        JSON.parse(selectedApplication.cvAnalysis),
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                )}

                {selectedApplication.coverLetter && (
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                      Cover Letter
                    </h4>
                    <p className="text-[var(--text-primary)] whitespace-pre-wrap">
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                    Status
                  </h4>
                  <select
                    value={selectedApplication.status}
                    onChange={(e) =>
                      updateStatus(selectedApplication.id, e.target.value)
                    }
                    disabled={updating}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="test_assigned">Test Assigned</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
