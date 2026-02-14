"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
}

export default function NewApplicationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [job, setJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    coverLetter: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (jobId) {
      // Fetch job details
      fetch(`/api/jobs/${jobId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.job) {
            setJob(data.job);
            setFormData((prev) => ({ ...prev, position: data.job.title }));
          }
        })
        .catch((err) => console.error("Error fetching job:", err));
    }
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("position", formData.position);
      formDataToSend.append("coverLetter", formData.coverLetter);
      if (jobId) {
        formDataToSend.append("jobId", jobId);
      }
      if (cvFile) {
        formDataToSend.append("cv", cvFile);
      }

      const response = await fetch("/api/applications", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        alert(
          "Application submitted successfully! Check your email for next steps.",
        );
        router.push("/dashboard");
      } else {
        const error = await response.json();
        alert("Error: " + (error.message || "Failed to submit application"));
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Error submitting application");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && /\.(pdf|doc|docx)$/i.test(file.name)) {
      setCvFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] relative">
      {/* Background Elements */}
      <div className="absolute inset-0 dot-grid opacity-20" />
      <div className="absolute top-20 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />

      {/* Top Bar */}
      <nav className="relative z-10 bg-glass-light border-b border-[var(--border-color)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
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
            <Link href="/" className="btn-secondary !py-2 !px-4 text-sm">
              ← Back Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-glass border border-[var(--border-color)] text-sm text-[var(--text-secondary)] mb-4">
              <svg
                className="w-4 h-4 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              AI-Powered Screening
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-3">
              {job ? `Apply for ${job.title}` : "Apply Now"}
            </h1>
            <p className="text-[var(--text-secondary)]">
              Submit your application and let our AI analyze your profile
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-glass rounded-2xl glow-ring p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input-dark"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="input-dark"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Position */}
              <div>
                <label
                  htmlFor="position"
                  className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
                >
                  Position *
                </label>
                {job ? (
                  <div className="input-dark bg-[var(--bg-secondary)] cursor-not-allowed">
                    {job.title}
                  </div>
                ) : (
                  <select
                    id="position"
                    required
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    className="input-dark"
                  >
                    <option value="">Select a position</option>
                    <option value="Frontend Developer">
                      Frontend Developer
                    </option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Full Stack Developer">
                      Full Stack Developer
                    </option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Mobile Developer">Mobile Developer</option>
                  </select>
                )}
              </div>

              {/* CV Upload */}
              <div>
                <label
                  htmlFor="cv"
                  className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
                >
                  Upload CV/Resume *
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
                    ${
                      dragOver
                        ? "border-indigo-500 bg-indigo-500/10"
                        : cvFile
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : "border-[var(--border-color)] hover:border-indigo-500/50 hover:bg-indigo-500/5"
                    }`}
                >
                  <input
                    type="file"
                    id="cv"
                    required={!cvFile}
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {cvFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-emerald-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {cvFile.name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="w-8 h-8 mx-auto text-[var(--text-muted)] mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Drag & drop your CV or{" "}
                        <span className="text-indigo-400 font-medium">
                          browse
                        </span>
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        PDF, DOC, or DOCX (max 5MB)
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <label
                  htmlFor="coverLetter"
                  className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
                >
                  Cover Letter{" "}
                  <span className="text-[var(--text-muted)]">(optional)</span>
                </label>
                <textarea
                  id="coverLetter"
                  rows={5}
                  value={formData.coverLetter}
                  onChange={(e) =>
                    setFormData({ ...formData, coverLetter: e.target.value })
                  }
                  className="input-dark resize-none"
                  placeholder="Tell us why you'd be a great fit..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary !py-3.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
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
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      Submit Application
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="btn-secondary !py-3.5 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Info */}
          <p className="text-center text-xs text-[var(--text-muted)] mt-6">
            By submitting, your CV will be analyzed by our AI system for initial
            screening.
          </p>
        </div>
      </div>
    </div>
  );
}
