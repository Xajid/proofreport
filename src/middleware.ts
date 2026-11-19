import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ token, req }) {
      if (req.nextUrl.pathname === "/admin/login") return true;
      return !!token;
    },
  },
});

export const config = {
  matcher: ["/app/:path*", "/admin", "/admin/:path*"],
};
