
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center bg-white">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Print <span className="text-blue-600 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Anywhere</span>, Anytime.
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 leading-relaxed">
            The smartest way to print on campus. Connects you to the nearest, cheapest, and fastest print shops instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={() => navigate("/upload")}
              className="px-8 py-4 text-lg font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/login/user")}
              className="px-8 py-4 text-lg font-semibold rounded-full bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-all duration-200"
            >
              Student Login
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50 py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why use PrintZap?</h2>
            <p className="mt-4 text-gray-500">Everything you need to manage your prints efficiently.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Routing</h3>
              <p className="text-gray-500 leading-relaxed">
                We automatically find the best shop based on your location, price, and current queue length.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Status Tracking</h3>
              <p className="text-gray-500 leading-relaxed">
                Track your documents in real-time. Get notified when your print is ready for pickup.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Payment</h3>
              <p className="text-gray-500 leading-relaxed">
                Pay online seamlessly with UPI or Cards. No need to carry change or cash.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer Integration */}
      <footer className="bg-white border-t border-gray-200 py-12 text-center">
        <p className="text-gray-400">© 2025 PrintZap. Built for students.</p>
      </footer>
    </div>
  )
}

export default Home