import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { RegisterData } from '../types';

const Register: React.FC = () => {
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterData>({
    defaultValues: {
      country_code: '+91'
    }
  });

  const password = watch('password');

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: RegisterData) => {
    setLoading(true);
    try {
      // Transform the data to match backend expectations
      const { password, password_confirm, country_code, phone_number, ...otherData } = data;
      
      // Combine country code with phone number if both are provided
      let formattedPhoneNumber = phone_number;
      if (phone_number && country_code) {
        formattedPhoneNumber = `${country_code}${phone_number}`;
      }
      
      const registrationData = {
        ...otherData,
        phone_number: formattedPhoneNumber,
        password1: password,
        password2: password_confirm,
      };
      
      await registerUser(registrationData as any);
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* First Name */}
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <div className="mt-1">
                <input
                  id="first_name"
                  type="text"
                  autoComplete="given-name"
                  {...register('first_name', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters',
                    },
                  })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your first name"
                />
                {errors.first_name && (
                  <p className="mt-2 text-sm text-red-600">{errors.first_name.message}</p>
                )}
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <div className="mt-1">
                <input
                  id="last_name"
                  type="text"
                  autoComplete="family-name"
                  {...register('last_name', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters',
                    },
                  })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your last name"
                />
                {errors.last_name && (
                  <p className="mt-2 text-sm text-red-600">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
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
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Phone Number (Optional) */}
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                Phone Number (Optional)
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <select
                  {...register('country_code')}
                  className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+977">🇳🇵 +977</option>
                </select>
                <input
                  id="phone_number"
                  type="tel"
                  autoComplete="tel"
                  {...register('phone_number', {
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: 'Please enter a valid phone number (10 digits starting with 6-9)',
                    },
                    validate: (value, formValues) => {
                      if (!value) return true; // Optional field
                      
                      const countryCode = formValues.country_code || '+91';
                      
                      // Remove any non-digit characters
                      const cleanValue = value.replace(/[^\d]/g, '');
                      
                      // Validate based on country code
                      if (countryCode === '+91') {
                        // Indian number validation (10 digits starting with 6-9)
                        if (cleanValue.match(/^[6-9]\d{9}$/)) {
                          return true;
                        }
                        return 'Please enter a valid Indian phone number (10 digits starting with 6-9)';
                      } else if (countryCode === '+977') {
                        // Nepal number validation (10 digits starting with 98)
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
                    // Remove any non-digit characters
                    let value = target.value.replace(/[^\d]/g, '');
                    
                    // Limit to 10 digits
                    if (value.length > 10) {
                      value = value.slice(0, 10);
                    }
                    
                    target.value = value;
                  }}
                />
              </div>
              {errors.phone_number && (
                <p className="mt-2 text-sm text-red-600">{errors.phone_number.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Select country code and enter phone number (India: 10 digits starting with 6-9, Nepal: 10 digits starting with 98)
              </p>
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
                  autoComplete="new-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="password_confirm"
                  type="password"
                  autoComplete="new-password"
                  {...register('password_confirm', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Confirm your password"
                />
                {errors.password_confirm && (
                  <p className="mt-2 text-sm text-red-600">{errors.password_confirm.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in to existing account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 