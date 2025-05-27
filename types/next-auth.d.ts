import NextAuth, { DefaultSession, User as NextAuthUser } from "next-auth"
import { JWT as NextAuthJWT } from "next-auth/jwt"

// Define your UserRole enum, mirroring the one in Prisma
enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole; // Add role to session user
    } & DefaultSession["user"];
  }

  // Extend the User type to include role, if you fetch it from the database in authorize
  interface User extends NextAuthUser {
    role?: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends NextAuthJWT {
    id: string;
    role: UserRole; // Add role to JWT
    // Ensure email can be string | null | undefined if it's optional in your User model
    email?: string | null | undefined; 
  }
}