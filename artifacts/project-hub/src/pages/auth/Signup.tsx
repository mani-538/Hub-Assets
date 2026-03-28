import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSignup } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Link, useSearch, useLocation } from "wouter";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Signup() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const role = (searchParams.get("role") as "student" | "admin") || "student";

  const { toast } = useToast();
  const signupMutation = useSignup();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", username: "", password: "" },
  });

  const onSubmit = (values: z.infer<typeof signupSchema>) => {
    signupMutation.mutate(
      { data: { ...values, role } },
      {
        onSuccess: (res) => {
          // Extract OTP from response and pass it to the verify page
          const otp = (res as any).otp || "";
          toast({ title: "Account created!", description: "Your OTP is shown on the next screen." });
          setLocation(`/verify-otp?email=${encodeURIComponent(values.email)}&otp=${encodeURIComponent(otp)}`);
        },
        onError: (err) => {
          toast({ title: "Error", description: (err as any).error?.error || "Failed to sign up", variant: "destructive" });
        },
      }
    );
  };

  return (
    <AuthLayout title="Create Account" subtitle={`Sign up as a ${role} to continue.`}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" placeholder="student@college.edu" {...form.register("email")} />
          {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="text" placeholder="johndoe" {...form.register("username")} />
          {form.formState.errors.username && <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" {...form.register("password")} />
          {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full font-semibold" disabled={signupMutation.isPending}>
          {signupMutation.isPending ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
