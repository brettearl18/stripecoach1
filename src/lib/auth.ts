import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // This is where you would typically validate against your database
        // For now, we'll use mock users for development
        const mockUsers = {
          "admin@example.com": {
            id: "1",
            email: "admin@example.com",
            name: "Admin User",
            role: "admin",
          },
          "coach@example.com": {
            id: "2",
            email: "coach@example.com",
            name: "Coach User",
            role: "coach",
          },
          "client@example.com": {
            id: "3",
            email: "client@example.com",
            name: "Client User",
            role: "client",
          }
        };

        if (credentials.password === "password" && mockUsers[credentials.email]) {
          return mockUsers[credentials.email];
        }

        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
} 