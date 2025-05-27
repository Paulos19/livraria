import NextAuth, { AuthOptions, NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma  from "@/lib/db";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcrypt';
import { UserRole } from '@/types/next-auth'; // Ensure UserRole is imported if not already
import { User } from 'next-auth'; // Import User type from next-auth

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req): Promise<User | null> { // Add req parameter and ensure return type is Promise<User | null>
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        const userFromDb = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!userFromDb || !userFromDb.password) {
          console.log('No user found or no password set');
          return null;
        }

        const isValidPassword = await bcrypt.compare(credentials.password, userFromDb.password);

        if (!isValidPassword) {
          console.log('Invalid password');
          return null;
        }
        
        // Ensure the returned object matches the extended User type
        return {
          id: userFromDb.id,
          email: userFromDb.email,
          name: userFromDb.name,
          image: userFromDb.image,
          role: userFromDb.role as UserRole, // Cast role to UserRole if necessary
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) { // This block is called on sign-in
        token.id = user.id;
        token.email = user.email;
        // The user object here comes from the authorize callback or adapter
        // It should already have the role if authorize returned it
        if (user.role) {
            token.role = user.role as UserRole;
        }
      }
      // If trigger is 'update' and session has data, update token (e.g., for role changes)
      if (trigger === "update" && session?.role) {
        token.role = session.role as UserRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        // session.user.email = token.email as string; // email is already part of DefaultSession["user"]
        // session.user.name = token.name as string; // name is already part of DefaultSession["user"]
        // session.user.image = token.picture as string | null | undefined; // image is already part of DefaultSession["user"]
        session.user.role = token.role as UserRole; // Add role to session
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
    // error: '/auth/error', // Optional: custom error page
  },
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };