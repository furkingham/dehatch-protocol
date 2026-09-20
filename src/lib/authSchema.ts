import { z } from "zod";

// Messages are i18n keys (same convention as launchSchema.ts).
const NAME_RE = /^\p{L}+(?:\s+\p{L}+)*$/u;
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

const email = z.string().trim().min(1, "v.required|@f.email").regex(EMAIL_RE, "v.email");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "v.required|@f.password"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "v.required|@f.fullName")
      .min(3, "v.min|@f.fullName|3")
      .regex(NAME_RE, "v.nameChars"),
    email,
    password: z
      .string()
      .min(1, "v.required|@f.password")
      .refine((v) => v.length >= 8 && /\p{L}/u.test(v) && /\d/.test(v), "v.password"),
    confirm: z.string().min(1, "v.required|@f.passwordConfirm"),
  })
  .superRefine((v, ctx) => {
    if (v.confirm && v.password !== v.confirm) {
      ctx.addIssue({ code: "custom", path: ["confirm"], message: "v.passwordMatch" });
    }
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
