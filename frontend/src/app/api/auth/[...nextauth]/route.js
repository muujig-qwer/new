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
        token.role = "admin";
      } else {
        token.role = "user";
      }
      return token;
    },
    async session({ session, token }) {
      // Гол өөрчлөлт ↓↓↓
      session.user.role = token.role; // session.user.role-д онооно
      session.accessToken = session.accessToken || token.accessToken;

      // 1. Backend-аас JWT авах
      if (session.user?.email) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: session.user.email }),
          });
          if (res.ok) {
            const data = await res.json();
            session.accessToken = data.token; // JWT-г session-д онооно
          }
        } catch (e) {
          // ignore
        }
      }

      // 2. Backend-ээс хэрэглэгчийн _id-г авах (хүсвэл үлдээж болно)
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

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
