import { useState } from "react";
import { 
  Leaf, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User 
} from "lucide-react";
import { auth } from "../services/firebaseConfig";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile 
} from "firebase/auth";

interface LoginPageProps {
  onLogin: (email: string, name: string) => void;
  onBackToHome: () => void;
}

interface FormErrors {
  firstName?: string;
  surname?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function LoginPage({ 
  onLogin, 
  onBackToHome 
}: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState("");

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ---------- Validation ----------
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) newErrors.email = "Email is required";
    else if (!emailRegex.test(email)) 
      newErrors.email = "Please enter a valid email";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) 
      newErrors.password = "Password must be at least 6 characters";

    if (isSignUp) {
      if (!firstName.trim()) 
        newErrors.firstName = "First name is required";
      
      if (!surname.trim()) 
        newErrors.surname = "Surname is required";

      if (!confirmPassword) 
        newErrors.confirmPassword = "Please confirm your password";
      else if (password !== confirmPassword) 
        newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------- Submit ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isSignUp) {
        // 🔥 FIREBASE REGISTER
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          email.trim(), 
          password
        );
        
        // Update profile with display name
        await updateProfile(userCredential.user, {
          displayName: `${firstName.trim()} ${surname.trim()}`
        });

        // Save session
        localStorage.setItem(
          "bhoomi_current_user",
          JSON.stringify({
            email: email.trim(),
            name: `${firstName.trim()} ${surname.trim()}`,
          })
        );

        onLogin(email.trim(), `${firstName.trim()} ${surname.trim()}`);
      } else {
        // 🔥 FIREBASE LOGIN
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          email, 
          password
        );

        const displayName = userCredential.user.displayName || email;

        localStorage.setItem(
          "bhoomi_current_user",
          JSON.stringify({
            email,
            name: displayName,
          })
        );

        onLogin(email, displayName);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      
      // Handle Firebase specific errors
      switch (error.code) {
        case 'auth/user-not-found':
          setGeneralError("No account found with this email");
          break;
        case 'auth/wrong-password':
          setGeneralError("Incorrect password");
          break;
        case 'auth/email-already-in-use':
          setGeneralError("This email is already registered");
          break;
        case 'auth/weak-password':
          setGeneralError("Password should be at least 6 characters");
          break;
        case 'auth/invalid-email':
          setGeneralError("Invalid email address");
          break;
        case 'auth/too-many-requests':
          setGeneralError("Too many attempts. Please try again later");
          break;
        default:
          setGeneralError(error.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFirstName("");
    setSurname("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setErrors({});
    setGeneralError("");
  };

  // ✅ FIXED: Simplified toggle function
  const toggleMode = (mode: 'login' | 'signup') => {
    resetForm();
    setIsSignUp(mode === 'signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl mb-2 text-gray-900">
            Welcome to Bhoomi
          </h1>
          <p className="text-gray-600">
            Your Personal Agro Partner
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* ✅ FIXED: Toggle buttons with correct logic */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => !loading && toggleMode('login')}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                !isSignUp ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Login
            </button>
            
            <button
              type="button"
              onClick={() => !loading && toggleMode('signup')}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                isSignUp ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Sign Up
            </button>
          </div>

          {generalError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isSignUp && (
              <>
                <div>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Surname"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.surname ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.surname && (
                    <p className="text-red-500 text-sm mt-1">{errors.surname}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {isSignUp && (
              <div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => 
                    setConfirmPassword(e.target.value)
                  }
                  className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : (isSignUp ? "Create Account" : "Login")}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={onBackToHome}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}