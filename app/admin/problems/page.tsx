'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

type FormMode = 'create' | 'edit' | null;

export default function ProblemsManagement() {
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    timeLimit: '60',
    testCases: '',
    starterCode: '',
  });

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await fetch('/api/admin/problems');
      const data = await response.json();
      setProblems(data.problems || []);
    } catch (error) {
      console.error('Failed to fetch problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: 'medium',
      timeLimit: '60',
      testCases: '',
      starterCode: '',
    });
    setFormMode(null);
    setSelectedProblem(null);
    setError('');
  };

  const openCreateForm = () => {
    resetForm();
    setFormMode('create');
  };

  const openEditForm = (problem: CodingProblem) => {
    setSelectedProblem(problem);
    setFormData({
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      timeLimit: problem.timeLimit.toString(),
      testCases: problem.testCases,
      starterCode: problem.starterCode || '',
    });
    setFormMode('edit');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      JSON.parse(formData.testCases);
    } catch {
      setError('Invalid JSON format for test cases');
      setSubmitting(false);
      return;
    }

    try {
      const url = formMode === 'create' 
        ? '/api/admin/problems'
        : `/api/admin/problems/${selectedProblem?.id}`;
      
      const method = formMode === 'create' ? 'POST' : 'PATCH';
      
      const body: any = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        timeLimit: formData.timeLimit,
        testCases: formData.testCases,
        starterCode: formData.starterCode,
      };

      if (formMode === 'create') {
        body.createdBy = 'admin-user-id';
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save problem');
        return;
      }

      await fetchProblems();
      resetForm();
    } catch (error) {
      console.error('Failed to save problem:', error);
      setError('Failed to save problem');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this problem?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/problems/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to delete problem');
        return;
      }

      await fetchProblems();
      if (selectedProblem?.id === id) {
        resetForm();
      }
    } catch (error) {
      console.error('Failed to delete problem:', error);
      alert('Failed to delete problem');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
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
            <h1 className="text-2xl font-bold text-gray-900">Problems Management</h1>
            <div className="flex gap-4">
              <button
                onClick={openCreateForm}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Problem
              </button>
              <Link
                href="/admin"
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">
                Coding Problems ({problems.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[calc(100vh-250px)] overflow-y-auto">
              {problems.map((problem) => (
                <div key={problem.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {problem.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {problem.description}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ml-2 ${getDifficultyColor(
                        problem.difficulty
                      )}`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Time: {problem.timeLimit} min
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditForm(problem)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(problem.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {problems.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No problems found. Create your first problem!
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {formMode ? (
              <>
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">
                    {formMode === 'create' ? 'Create Problem' : 'Edit Problem'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-6 max-h-[calc(100vh-250px)] overflow-y-auto">
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        required
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Difficulty *
                        </label>
                        <select
                          required
                          value={formData.difficulty}
                          onChange={(e) =>
                            setFormData({ ...formData, difficulty: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Time Limit (minutes) *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={formData.timeLimit}
                          onChange={(e) =>
                            setFormData({ ...formData, timeLimit: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Test Cases (JSON) *
                      </label>
                      <textarea
                        required
                        value={formData.testCases}
                        onChange={(e) =>
                          setFormData({ ...formData, testCases: e.target.value })
                        }
                        rows={6}
                        placeholder='[{"input": "...", "output": "..."}, ...]'
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter test cases in JSON array format
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Starter Code (Optional)
                      </label>
                      <textarea
                        value={formData.starterCode}
                        onChange={(e) =>
                          setFormData({ ...formData, starterCode: e.target.value })
                        }
                        rows={6}
                        placeholder="function solution() {\n  // Your code here\n}"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        {submitting ? 'Saving...' : 'Save Problem'}
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-gray-500">
                Select a problem to edit or create a new one
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
