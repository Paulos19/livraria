'use client';

import { useState, FormEvent, useEffect } from 'react'; // Added useEffect
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react'; // Added useSession

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: session, status } = useSession(); // Get session status

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/'); // Redirect to homepage if authenticated
    }
  }, [status, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!name || !email || !password) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push('/auth/signin'); 
      } else {
        const data = await res.json();
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration submission error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
    setIsLoading(false);
  };

  // If session is loading or already authenticated, show a loading message or null
  if (status === 'loading' || status === 'authenticated') {
    return <p>Loading...</p>; // Or some loading spinner
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Register</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
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
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Already have an account? <Link href="/auth/signin" style={{ color: '#0070f3' }}>Sign In</Link>
      </p>
    </div>
  );
}