
import { useNavigate } from "react-router-dom";

import { DoodleHighlight } from "../common/DoodleHighlight";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-full bg-page-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mx-auto max-w-4xl space-y-8">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-brand-text-primary leading-[0.9] md:leading-[0.9]">
              Print <span className="opacity-40 italic">instantly</span>. <br />
              <DoodleHighlight type="underline" color="#6B7280">Anywhere</DoodleHighlight> on campus.
            </h1>
            <p className="max-w-2xl mx-auto text-xl md:text-2xl text-brand-text-muted leading-relaxed font-light">
              Connect to the nearest, cheapest, and fastest print shops.
              <br className="hidden md:inline" /> No more waiting in lines.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8">
              <button
                onClick={() => navigate("/upload")}
                className="px-8 py-4 text-lg font-semibold rounded-full bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate("/login/user")}
                className="px-8 py-4 text-lg font-semibold rounded-full bg-btn-secondary-bg text-btn-secondary-text border border-btn-secondary-border hover:bg-btn-secondary-hover hover:border-brand-accent transition-all duration-300"
              >
                Student Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-section-bg py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-text-primary">Why PrintZap?</h2>
            <p className="mt-4 text-lg text-brand-text-muted">Efficiency, speed, and reliability.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-card-bg hover:bg-card-hover rounded-3xl p-10 transition-colors duration-300">
              <div className="w-14 h-14 bg-inset-panel rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">📍</span>
              </div>
              <h3 className="text-xl font-bold text-brand-text-primary mb-3">Smart Routing</h3>
              <p className="text-brand-text-body leading-relaxed">
                Automatically finding the optimized route for your print job based on real-time location and queue status.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-card-bg hover:bg-card-hover rounded-3xl p-10 transition-colors duration-300">
              <div className="w-14 h-14 bg-inset-panel rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-brand-text-primary mb-3">Live Tracking</h3>
              <p className="text-brand-text-body leading-relaxed">
                Real-time updates on your document status. Know exactly when your files are printed and ready for pickup.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-card-bg hover:bg-card-hover rounded-3xl p-10 transition-colors duration-300">
              <div className="w-14 h-14 bg-inset-panel rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-brand-text-primary mb-3">Secure Payment</h3>
              <p className="text-brand-text-body leading-relaxed">
                Seamless and secure payments via UPI or Cards. Experience a cashless workflow designed for students.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home;
