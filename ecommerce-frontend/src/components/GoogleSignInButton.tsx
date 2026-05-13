import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const GOOGLE_CLIENT_ID = (process.env.REACT_APP_GOOGLE_CLIENT_ID || '').trim();

export type GoogleAuthMode = 'signin' | 'signup';

type GoogleSignInButtonProps = {
  mode?: GoogleAuthMode;
  /** Called after tokens are stored (e.g. navigate away). */
  onLoggedIn?: () => void;
};

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  mode = 'signin',
  onLoggedIn,
}) => {
  const { loginWithGoogle } = useAuth();
  const isSignup = mode === 'signup';
  const title = isSignup ? 'Sign up with Google' : 'Sign in with Google';

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 mb-1">
      <p className="text-center text-sm font-semibold text-gray-800 mb-3">{title}</p>

      {!GOOGLE_CLIENT_ID ? (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-center leading-relaxed">
          Add <code className="text-amber-900">REACT_APP_GOOGLE_CLIENT_ID</code> to{' '}
          <code className="text-amber-900">ecommerce-frontend/.env</code> (same Web Client ID as
          Django <code className="text-amber-900">GOOGLE_CLIENT_ID</code>), then restart{' '}
          <code className="text-amber-900">npm start</code>. See{' '}
          <code className="text-amber-900">.env.example</code>.
        </p>
      ) : (
        <div className="flex w-full justify-center [&>div]:!w-full">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              const cred = credentialResponse.credential;
              if (!cred) {
                toast.error('No credential returned from Google.');
                return;
              }
              try {
                await loginWithGoogle(cred);
                onLoggedIn?.();
              } catch {
                /* errors toasted in loginWithGoogle */
              }
            }}
            onError={() => {
              toast.error('Google sign-in was cancelled or failed.');
            }}
            useOneTap={false}
            type="standard"
            theme="outline"
            size="large"
            text={isSignup ? 'signup_with' : 'signin_with'}
            shape="rectangular"
            width={400}
            logo_alignment="center"
          />
        </div>
      )}
    </div>
  );
};

export default GoogleSignInButton;
