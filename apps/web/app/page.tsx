export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center text-white px-6">
        <h1 className="text-5xl font-bold mb-4">Mali AI</h1>
        <p className="text-xl text-slate-300 mb-8">
          Describe your business. Get a complete store in minutes.
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/auth/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition">
            Get Started Free
          </a>
          <a href="/auth/login" className="border border-slate-500 hover:border-slate-300 text-white px-8 py-3 rounded-lg font-semibold transition">
            Login
          </a>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl mb-2">🤖</div>
            <h3 className="font-semibold mb-1">AI-Powered</h3>
            <p className="text-slate-400 text-sm">Describe your niche, AI builds everything</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">💳</div>
            <h3 className="font-semibold mb-1">Payments Ready</h3>
            <p className="text-slate-400 text-sm">Razorpay integrated out of the box</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">📱</div>
            <h3 className="font-semibold mb-1">WhatsApp Alerts</h3>
            <p className="text-slate-400 text-sm">Get notified on every sale instantly</p>
          </div>
        </div>
      </div>
    </main>
  );
}