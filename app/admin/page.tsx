'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/applications');
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const response = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, status: newStatus }),
      });

      if (response.ok) {
        await fetchApplications();
        if (selectedApplication?.id === applicationId) {
          const updated = applications.find(app => app.id === applicationId);
          if (updated) {
            setSelectedApplication({ ...updated, status: newStatus });
          }
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const filteredApplications = applications.filter(app => 
    statusFilter === 'all' || app.status === statusFilter
  );

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewing: 'bg-blue-100 text-blue-800',
      interview: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800',
      accepted: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      easy: 'text-green-600',
      medium: 'text-yellow-600',
      hard: 'text-red-600',
    };
    return colors[difficulty] || 'text-gray-600';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex gap-4">
              <Link
                href="/admin/problems"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Manage Problems
              </Link>
              <Link
                href="/"
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
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
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">
                Applications ({filteredApplications.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApplication(app)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedApplication?.id === app.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {app.user.name || 'Unknown'}
                      </h3>
                      <p className="text-sm text-gray-600">{app.user.email}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    Position: <span className="font-medium">{app.position}</span>
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600">
                      Tests: {app.testSessions.length}
                    </p>
                  </div>
                </div>
              ))}
              {filteredApplications.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No applications found
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {selectedApplication ? (
              <>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">Application Details</h2>
                </div>
                <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Candidate Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Name:</span>{' '}
                        {selectedApplication.user.name || 'N/A'}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{' '}
                        {selectedApplication.user.email}
                      </p>
                      <p>
                        <span className="font-medium">Position:</span>{' '}
                        {selectedApplication.position}
                      </p>
                      <p>
                        <span className="font-medium">Applied:</span>{' '}
                        {new Date(selectedApplication.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Update Status
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {['pending', 'reviewing', 'interview', 'rejected', 'accepted'].map(
                        (status) => (
                          <button
                            key={status}
                            onClick={() =>
                              updateStatus(selectedApplication.id, status)
                            }
                            disabled={updating || selectedApplication.status === status}
                            className={`px-3 py-1 text-sm rounded ${
                              selectedApplication.status === status
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {selectedApplication.cvAnalysis && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        CV Analysis
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg text-sm">
                        <pre className="whitespace-pre-wrap font-mono text-xs overflow-x-auto">
                          {JSON.stringify(
                            parseCvAnalysis(selectedApplication.cvAnalysis),
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  )}

                  {selectedApplication.coverLetter && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Cover Letter
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg text-sm">
                        {selectedApplication.coverLetter}
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Test Sessions ({selectedApplication.testSessions.length})
                    </h3>
                    {selectedApplication.testSessions.length > 0 ? (
                      <div className="space-y-3">
                        {selectedApplication.testSessions.map((session) => (
                          <div
                            key={session.id}
                            className="border border-gray-200 rounded-lg p-3"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {session.problem.title}
                                </h4>
                                <p
                                  className={`text-xs font-medium ${getDifficultyColor(
                                    session.problem.difficulty
                                  )}`}
                                >
                                  {session.problem.difficulty.toUpperCase()}
                                </p>
                              </div>
                              <span className="text-xs font-medium text-gray-600">
                                {session.status}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <p>
                                Score:{' '}
                                {session.score !== null ? `${session.score}%` : 'N/A'}
                              </p>
                              <p>
                                Started: {new Date(session.startTime).toLocaleString()}
                              </p>
                              {session.endTime && (
                                <p>
                                  Ended: {new Date(session.endTime).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No test sessions yet</p>
                    )}
                  </div>

                  {selectedApplication.cvUrl && (
                    <div>
                      <a
                        href={selectedApplication.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View CV →
                      </a>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-gray-500">
                Select an application to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
