import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(
      { data: values },
      {
        onSuccess: (res) => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          toast({ title: "Welcome back!" });
          if (res.user.role === "admin") {
            setLocation("/admin/dashboard");
          } else {
            setLocation("/student/dashboard");
          }
        },
        onError: (err) => {
          toast({ title: "Login Failed", description: err.error?.error || "Invalid credentials", variant: "destructive" });
        },
      }
    );
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Log in to your account to continue.">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="identifier">Email or Username</Label>
          <Input id="identifier" placeholder="student@college.edu" {...form.register("identifier")} />
          {form.formState.errors.identifier && <p className="text-sm text-destructive">{form.formState.errors.identifier.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input id="password" type="password" placeholder="••••••••" {...form.register("password")} />
          {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full font-semibold" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Logging in..." : "Log In"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link href="/role-select" className="text-primary font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
