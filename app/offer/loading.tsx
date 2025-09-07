export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white">
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-4 max-w-2xl mx-auto"></div>
          <div className="h-8 bg-gray-200 rounded mb-8 max-w-xl mx-auto"></div>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl mx-auto">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}