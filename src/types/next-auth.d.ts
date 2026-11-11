import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      orgId?: string;
      orgName?: string;
    };
  }

  interface User {
    orgId?: string;
    orgName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    orgId?: string;
    orgName?: string;
  }
}
