import { Leaf, Droplets, Cloud, BarChart3, Target, Users, Award } from 'lucide-react';

export function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 md:p-12 text-white mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Leaf className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl mb-2">About Bhoomi</h1>
              <p className="text-green-100 text-lg">Your Personal Agro Partner</p>
            </div>
          </div>
          <p className="text-green-50 text-lg max-w-3xl">
            Bhoomi is a cutting-edge multi-farm irrigation management system designed specifically 
            for Indian farmers, with a focus on Maharashtra's unique agricultural conditions. We combine 
            IoT sensors, AI/ML algorithms, and real-time weather data to optimize irrigation and maximize crop yields.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl mb-3 text-gray-900">Our Mission</h2>
            <p className="text-gray-600">
              To empower farmers with intelligent, data-driven irrigation solutions that conserve water, 
              reduce costs, and increase agricultural productivity across Maharashtra and beyond.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl mb-3 text-gray-900">Our Vision</h2>
            <p className="text-gray-600">
              To become the leading smart agriculture platform in India, helping millions of farmers 
              achieve sustainable farming practices and improved livelihoods through technology.
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-white rounded-xl p-8 shadow-md mb-8">
          <h2 className="text-2xl mb-6 text-gray-900">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Droplets className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="mb-2">Smart Irrigation</h3>
                <p className="text-sm text-gray-600">
                  AI-powered irrigation recommendations based on soil moisture, weather forecasts, and crop requirements.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Cloud className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="mb-2">Real-time Weather</h3>
                <p className="text-sm text-gray-600">
                  Live weather data and forecasts specific to Maharashtra regions to optimize irrigation timing.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="mb-2">Soil Monitoring</h3>
                <p className="text-sm text-gray-600">
                  Continuous tracking of nitrogen, phosphorus, potassium, pH, EC, and moisture levels.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="mb-2">Multi-Farm Management</h3>
                <p className="text-sm text-gray-600">
                  Manage multiple farms from a single dashboard with individual monitoring for each location.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Leaf className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="mb-2">Crop Recommendations</h3>
                <p className="text-sm text-gray-600">
                  ML-based crop and fertilizer recommendations based on current soil conditions.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="mb-2">Zone Classification</h3>
                <p className="text-sm text-gray-600">
                  Automatic zone classification (dry/medium/wet) for targeted irrigation strategies.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-white rounded-xl p-8 shadow-md mb-8">
          <h2 className="text-2xl mb-6 text-gray-900">Technology Stack</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="mb-3 text-green-600">IoT & Sensors</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Soil moisture sensors</li>
                <li>• NPK sensors</li>
                <li>• pH & EC sensors</li>
                <li>• Weather stations</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-green-600">AI & Machine Learning</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Crop recommendation models</li>
                <li>• Irrigation optimization</li>
                <li>• Weather prediction</li>
                <li>• Yield forecasting</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-green-600">Cloud & Storage</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Firebase Authentication</li>
                <li>• Firestore Database</li>
                <li>• Real-time data sync</li>
                <li>• Secure data storage</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Maharashtra Focus */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-8 shadow-md border-2 border-orange-200">
          <h2 className="text-2xl mb-4 text-gray-900">Designed for Maharashtra</h2>
          <p className="text-gray-700 mb-4">
            Bhoomi is specifically calibrated for Maharashtra's climate and soil conditions:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-orange-700">🌡️</span>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Temperature range:</strong> Optimized for 28-38°C typical of Maharashtra's climate
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-700">💧</span>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Humidity levels:</strong> Calibrated for 60-90% humidity ranges
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-700">🌾</span>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Crop database:</strong> Includes major Maharashtra crops like cotton, sugarcane, rice, wheat
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-purple-700">📍</span>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Regional data:</strong> Weather stations across Pune, Nashik, Aurangabad, Solapur, and more
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-xl p-8 shadow-md mt-8">
          <h2 className="text-2xl mb-4 text-gray-900">Get in Touch</h2>
          <p className="text-gray-600 mb-6">
            Have questions or need support? We're here to help you make the most of Bhoomi.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="text-gray-900">support@bhoomi.com</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Phone</p>
              <p className="text-gray-900">+91 1800-XXX-XXXX</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Hours</p>
              <p className="text-gray-900">24/7 Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
