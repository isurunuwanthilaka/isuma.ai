import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Isuma.ai
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-Powered Hiring Platform
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Streamline your hiring process with intelligent candidate screening, 
            timed coding assessments, and AI-powered anti-cheating detection.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="text-lg font-semibold mb-2">Smart Applications</h3>
              <p className="text-gray-600">
                AI-powered CV analysis and automated candidate screening
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">⏱️</div>
              <h3 className="text-lg font-semibold mb-2">Timed Coding Tests</h3>
              <p className="text-gray-600">
                Real-time code execution with anti-cheating measures
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="text-lg font-semibold mb-2">AI Proctoring</h3>
              <p className="text-gray-600">
                Camera monitoring and behavioral analysis with multimodal AI
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Link 
              href="/applications/new"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Apply Now
            </Link>
            <Link 
              href="/dashboard"
              className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Recruiter Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
