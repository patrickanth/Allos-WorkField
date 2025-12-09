import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { users, teams } from './storage';
import type { SessionUser } from '@/types';

declare module 'next-auth' {
  interface Session {
    user: SessionUser;
  }
  interface User extends SessionUser {}
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = users.getByEmailWithPassword(email);
        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return null;
        }

        let teamName: string | null = null;
        let teamSlug: string | null = null;

        if (user.teamId) {
          const team = teams.getById(user.teamId);
          if (team) {
            teamName = team.name;
            teamSlug = team.slug;
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          teamId: user.teamId,
          teamName,
          teamSlug,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.avatar = user.avatar;
        token.role = user.role;
        token.teamId = user.teamId;
        token.teamName = user.teamName;
        token.teamSlug = user.teamSlug;
      }

      // Handle session update
      if (trigger === 'update' && session) {
        token.teamId = session.teamId;
        token.teamName = session.teamName;
        token.teamSlug = session.teamSlug;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        avatar: token.avatar as string | null,
        role: token.role as string,
        teamId: token.teamId as string | null,
        teamName: token.teamName as string | null,
        teamSlug: token.teamSlug as string | null,
      };
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});
