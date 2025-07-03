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
    async jwt({ token }) {
      // token.email-ээр backend-ээс role авах боломжгүй тул session callback-д хийе
      return token;
    },
    async session({ session, token }) {
      // Backend-аас хэрэглэгчийн мэдээлэл авах
      if (session.user?.email) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/email/${session.user.email}`);
          if (res.ok) {
            const dbUser = await res.json();
            session.user._id = dbUser._id;
            session.user.role = dbUser.role; // ЖИНХЭНЭ ROLE-ийг онооно!
          }
        } catch (e) {
          // ignore
        }
      }
      // JWT авах хэсэг хэвээр үлдээнэ
      if (session.user?.email) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: session.user.email }),
          });
          if (res.ok) {
            const data = await res.json();
            session.accessToken = data.token;
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
