export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white font-display font-bold text-xl mb-3">
            M
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">Montessori Platform</h1>
          <p className="text-muted text-sm mt-1">ERP & Learning Management System</p>
        </div>
        {children}
      </div>
    </div>
  );
}
