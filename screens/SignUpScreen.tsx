import React, { useState } from 'react';
import { User, UserType } from '../types';
import { Button } from '../components/Button';
import { Sprout, Eye, EyeOff, Leaf } from '../components/icons';

interface SignUpScreenProps {
  onSignUp: (name: string, email: string, password: string, userType: UserType) => Promise<User | null>;
  showLogin: () => void;
  onSignUpSuccess: () => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignUp, showLogin, onSignUpSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<UserType>(UserType.Consumer);
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous error
    const user = await onSignUp(name, email, password, userType);
    if (user) {
      onSignUpSuccess();
    } else {
      setError('An account with this email already exists.');
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
            <p className="text-gray-400">Join our community and start reducing waste today!</p>
      </div>

      {error && <p className="text-red-500 text-center text-sm">{error}</p>}
      
      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-600 rounded-lg shadow-sm p-3 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-800 text-gray-200"
          />
        </div>
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
        <div>
            <label className="block text-sm font-medium text-gray-300">I am a...</label>
            <select
                value={userType}
                onChange={(e) => setUserType(e.target.value as UserType)}
                className="mt-1 block w-full border border-gray-600 rounded-lg shadow-sm p-3 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-800 text-gray-200"
            >
                <option value={UserType.Consumer}>Consumer</option>
                <option value={UserType.Restaurant}>Restaurant</option>
                <option value={UserType.NGO}>NGO</option>
            </select>
        </div>

        <Button type="submit" className="w-full" size="large">
          Sign Up
        </Button>
      </form>
      <p className="text-center text-sm text-gray-400">
        Already have an account?{' '}
        <button onClick={showLogin} className="font-semibold text-green-500 hover:underline">
          Log in
        </button>
      </p>
    </div>
  );
};

export default SignUpScreen;