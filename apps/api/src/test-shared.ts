import { loginSchema } from "@taskly/shared";

// Let's intentionally test a bad email to see if Zod catches it
const result = loginSchema.safeParse({ 
  email: "not-a-real-email", 
  password: "123" 
});

if (!result.success) {
  console.log("✅ Shared library working! Zod caught the error:");
  console.log(result.error.issues[0].message);
}