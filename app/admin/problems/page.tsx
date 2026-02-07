"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Creator {
  id: string;
  name: string | null;
  email: string;
}

interface CodingProblem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: number;
  testCases: string;
  starterCode: string | null;
  createdAt: string;
  creator: Creator;
}

type FormMode = "create" | "edit" | null;

export default function ProblemsManagement() {
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "medium",
    timeLimit: "60",
    testCases: "",
    starterCode: "",
  });

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await fetch("/api/admin/problems");
      const data = await response.json();
      setProblems(data.problems || []);
    } catch (error) {
      console.error("Failed to fetch problems:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      difficulty: "medium",
      timeLimit: "60",
      testCases: "",
      starterCode: "",
    });
    setFormMode(null);
    setSelectedProblem(null);
    setError("");
  };

  const openCreateForm = () => {
    resetForm();
    setFormMode("create");
  };

  const openEditForm = (problem: CodingProblem) => {
    setSelectedProblem(problem);
    setFormData({
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      timeLimit: problem.timeLimit.toString(),
      testCases: problem.testCases,
      starterCode: problem.starterCode || "",
    });
    setFormMode("edit");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      JSON.parse(formData.testCases);
    } catch {
      setError("Invalid JSON format for test cases");
      setSubmitting(false);
      return;
    }

    try {
      const url =
        formMode === "create"
          ? "/api/admin/problems"
          : `/api/admin/problems/${selectedProblem?.id}`;

      const method = formMode === "create" ? "POST" : "PATCH";

      const body: any = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        timeLimit: formData.timeLimit,
        testCases: formData.testCases,
        starterCode: formData.starterCode,
      };

      if (formMode === "create") {
        const adminUser = await fetch("/api/admin/user").then((r) => r.json());
        if (adminUser.error) {
          setError("Unable to identify admin user. Please login as admin.");
          setSubmitting(false);
          return;
        }
        body.createdBy = adminUser.id;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save problem");
        return;
      }

      await fetchProblems();
      resetForm();
    } catch (error) {
      console.error("Failed to save problem:", error);
      setError("Failed to save problem");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this problem?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/problems/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to delete problem");
        return;
      }

      await fetchProblems();
      if (selectedProblem?.id === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Failed to delete problem:", error);
      alert("Failed to delete problem");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      easy: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
      medium: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
      hard: "bg-red-500/15 text-red-400 border border-red-500/20",
    };
    return (
      colors[difficulty] ||
      "bg-gray-500/15 text-gray-400 border border-gray-500/20"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 animate-spin-slow" />
          <p className="text-[var(--text-secondary)]">Loading problems...</p>
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
                Problems
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={openCreateForm}
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Problem
              </button>
              <Link href="/admin" className="btn-secondary !py-2 !px-4 text-sm">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problems List */}
          <div className="bg-glass rounded-xl glow-ring overflow-hidden">
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
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                Coding Problems ({problems.length})
              </h2>
            </div>
            <div className="divide-y divide-[var(--border-color)] max-h-[calc(100vh-250px)] overflow-y-auto">
              {problems.map((problem) => (
                <div
                  key={problem.id}
                  className="p-4 hover:bg-[var(--bg-card-hover)] transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">
                        {problem.title}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-2">
                        {problem.description}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ml-3 ${getDifficultyColor(problem.difficulty)}`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {problem.timeLimit} min
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEditForm(problem)}
                        className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(problem.id)}
                        className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {problems.length === 0 && (
                <div className="p-12 text-center text-[var(--text-muted)]">
                  <div className="text-3xl mb-3">💻</div>
                  No problems yet. Create your first!
                </div>
              )}
            </div>
          </div>

          {/* Form Panel */}
          <div className="bg-glass rounded-xl glow-ring overflow-hidden">
            {formMode ? (
              <>
                <div className="px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-cyan-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                          formMode === "create"
                            ? "M12 4v16m8-8H4"
                            : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        }
                      />
                    </svg>
                    {formMode === "create" ? "Create Problem" : "Edit Problem"}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-6 max-h-[calc(100vh-250px)] overflow-y-auto">
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="input-dark"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                        Description *
                      </label>
                      <textarea
                        required
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows={4}
                        className="input-dark resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                          Difficulty *
                        </label>
                        <select
                          required
                          value={formData.difficulty}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              difficulty: e.target.value,
                            })
                          }
                          className="input-dark"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                          Time Limit (min) *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={formData.timeLimit}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              timeLimit: e.target.value,
                            })
                          }
                          className="input-dark"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                        Test Cases (JSON) *
                      </label>
                      <textarea
                        required
                        value={formData.testCases}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            testCases: e.target.value,
                          })
                        }
                        rows={6}
                        placeholder='[{"input": "...", "output": "..."}, ...]'
                        className="input-dark font-mono text-sm resize-none"
                      />
                      <p className="text-xs text-[var(--text-muted)] mt-1.5">
                        Enter test cases in JSON array format
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                        Starter Code (Optional)
                      </label>
                      <textarea
                        value={formData.starterCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            starterCode: e.target.value,
                          })
                        }
                        rows={6}
                        placeholder="function solution() {\n  // Your code here\n}"
                        className="input-dark font-mono text-sm resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 btn-primary !py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? "Saving..." : "Save Problem"}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="btn-secondary !py-3 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
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
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                <p>Select a problem to edit or create a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
