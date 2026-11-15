import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiErrorMessage } from "@/lib/utils";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const { email } = schema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      // Avoid user enumeration
      return NextResponse.json({
        ok: true,
        message: "If an account exists for that email, a reset link has been prepared.",
      });
    }

    const token = randomBytes(24).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiresAt: expires },
    });

    const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${origin}/reset-password?token=${token}`;

    if (process.env.RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "ProofReport <no-reply@proofreport.app>",
          to: [user.email],
          subject: "Reset your ProofReport password",
          html: `<p>Click <a href="${resetUrl}">here</a> to reset your ProofReport password. This link expires in 1 hour.</p>`,
        }),
      });
      return NextResponse.json({
        ok: true,
        message: "Check your inbox for a password reset link.",
      });
    }

    // Local / demo mode without email provider
    return NextResponse.json({
      ok: true,
      message: "Reset link generated (no email provider configured).",
      devResetUrl: resetUrl,
    });
  } catch (e) {
    return NextResponse.json({ error: apiErrorMessage(e) }, { status: 400 });
  }
}

