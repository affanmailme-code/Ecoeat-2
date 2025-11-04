import React, { useState } from 'react';
import { User } from '../types';
import { Button } from '../components/Button';
import { Sprout, Eye, EyeOff, Leaf } from '../components/icons';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => User | null;
  showSignUp: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, showSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors on a new attempt
    const user = onLogin(email, password);
    if (!user) {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-[#161B22] border border-gray-700/50 rounded-xl shadow-lg">
      <div className="text-center">
        <div className="inline-flex items-center gap-3 mb-4 justify-center">
            <div className="bg-green-500 p-3 rounded-lg">
                <Leaf className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-200">
                EcoEats
            </h1>
        </div>
        <p className="text-gray-400">Log in to continue your sustainable journey.</p>
      </div>
      
      {error && <p className="text-red-500 text-center text-sm">{error}</p>}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-600 rounded-lg shadow-sm p-3 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-800 text-gray-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Password</label>
          <div className="relative mt-1">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full border border-gray-600 rounded-lg shadow-sm p-3 focus:ring-emerald-500 focus:border-emerald-500 pr-10 bg-gray-800 text-gray-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full" size="large">
          Log In
        </Button>
      </form>
      <p className="text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <button onClick={showSignUp} className="font-semibold text-green-500 hover:underline">
          Sign up
        </button>
      </p>
    </div>
  );
};

export default LoginScreen;