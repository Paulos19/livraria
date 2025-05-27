'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link'; // Import Link

const prettyAuthError = (error: string) => {
  switch (error) {
    case 'CredentialsSignin':
      return 'Invalid email or password. Please try again.';
    // Add more cases as needed for other specific errors
    default:
      return 'An unexpected error occurred during sign-in.';
  }
};

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/'; // Default to homepage
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl); // Or a default authenticated page like '/dashboard'
    }
  }, [status, router, callbackUrl]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        redirect: false, // Important: handle redirect manually
        email,
        password,
        callbackUrl: callbackUrl, 
      });

      if (result?.error) {
        setError(prettyAuthError(result.error));
      } else if (result?.ok) {
        router.push(callbackUrl); // Manually redirect on success
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      setError('An unexpected error occurred.');
    }
    setIsLoading(false);
  };
  
  // If session is loading or already authenticated, show a loading message or null to prevent flicker
  if (status === 'loading' || status === 'authenticated') {
    return <p>Loading...</p>; // Or some loading spinner
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Sign In</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            width: '100%', 
            padding: '10px', 
            backgroundColor: isLoading ? '#ccc' : '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Don&apos;t have an account? <Link href="/auth/register" style={{ color: '#0070f3' }}>Register</Link>
      </p>
    </div>
  );
}