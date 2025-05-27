'use client';

import { useSession } from 'next-auth/react';

export default function AdminPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  // Middleware should handle unauthorized access, but this is a client-side check too
  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
     // This should ideally not be reached if middleware is working correctly
    return <p>Access Denied. You are not an admin.</p>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, Admin {session?.user?.name || session?.user?.email}!</p>
      <p>Your role is: {session?.user?.role}</p>
      {/* Add admin-specific content here */}
    </div>
  );
}