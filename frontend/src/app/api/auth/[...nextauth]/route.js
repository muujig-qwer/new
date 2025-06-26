import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (token.email === "muujig165@gmail.com") {
        token.role = "admin"
      } else {
        token.role = "user"
      }
      return token
    },
    async session({ session, token }) {
      session.role = token.role

      // Backend-ээс хэрэглэгчийн _id-г авах
      if (session.user?.email) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/email/${session.user.email}`);
          if (res.ok) {
            const dbUser = await res.json();
            session.user._id = dbUser._id;
          }
        } catch (e) {
          // ignore
        }
      }

      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
