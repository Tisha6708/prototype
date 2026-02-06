export default function PageWrapper({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {(title || subtitle) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
