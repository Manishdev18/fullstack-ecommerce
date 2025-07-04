import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { LoginData } from '../types';

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    defaultValues: {
      country_code: '+91'
    }
  });

  const from = location.state?.from?.pathname || '/';

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const onSubmit = async (data: LoginData) => {
    setLoading(true);
    try {
      // Transform the data to match backend expectations
      const { country_code, phone_number, ...otherData } = data;
      
      // Combine country code with phone number if both are provided
      let formattedPhoneNumber = phone_number;
      if (phone_number && country_code) {
        formattedPhoneNumber = `${country_code}${phone_number}`;
      }
      
      const loginData = {
        ...otherData,
        phone_number: formattedPhoneNumber,
      };
      
      await login(loginData);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Login Type Selector */}
            <div>
              <div className="flex rounded-md shadow-sm mb-4">
                <button
                  type="button"
                  onClick={() => setLoginType('email')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-md border ${
                    loginType === 'email'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType('phone')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-md border ${
                    loginType === 'phone'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Phone
                </button>
              </div>
            </div>

            {/* Email/Phone Field */}
            <div>
              <label htmlFor="credential" className="block text-sm font-medium text-gray-700">
                {loginType === 'email' ? 'Email address' : 'Phone number'}
              </label>
              <div className="mt-1">
                {loginType === 'phone' ? (
                  <div className="flex rounded-md shadow-sm">
                    <select
                      {...register('country_code')}
                      className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm"
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+977">🇳🇵 +977</option>
                    </select>
                    <input
                      id="credential"
                      type="tel"
                      autoComplete="tel"
                      {...register('phone_number', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[6-9]\d{9}$|^98\d{8}$/,
                          message: 'Please enter a valid phone number',
                        },
                        validate: (value, formValues) => {
                          if (!value) return 'Phone number is required';
                          
                          const countryCode = formValues.country_code || '+91';
                          const cleanValue = value.replace(/[^\d]/g, '');
                          
                          if (countryCode === '+91') {
                            if (cleanValue.match(/^[6-9]\d{9}$/)) {
                              return true;
                            }
                            return 'Please enter a valid Indian phone number (10 digits starting with 6-9)';
                          } else if (countryCode === '+977') {
                            if (cleanValue.match(/^98\d{8}$/)) {
                              return true;
                            }
                            return 'Please enter a valid Nepal phone number (10 digits starting with 98)';
                          }
                          
                          return 'Please enter a valid phone number';
                        },
                      })}
                      className="flex-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-r-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter phone number"
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        let value = target.value.replace(/[^\d]/g, '');
                        
                        if (value.length > 10) {
                          value = value.slice(0, 10);
                        }
                        
                        target.value = value;
                      }}
                    />
                  </div>
                ) : (
                  <input
                    id="credential"
                    type="email"
                    autoComplete="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your email"
                  />
                )}
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
                {errors.phone_number && (
                  <p className="mt-2 text-sm text-red-600">{errors.phone_number.message}</p>
                )}
                {loginType === 'phone' && (
                  <p className="mt-1 text-sm text-gray-500">
                    Select country code and enter phone number (India: 10 digits starting with 6-9, Nepal: 10 digits starting with 98)
                  </p>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-between">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create new account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 