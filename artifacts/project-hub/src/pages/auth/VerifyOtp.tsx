import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useVerifyOtp } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useSearch, useLocation } from "wouter";

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 characters"),
});

export default function VerifyOtp() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const email = searchParams.get("email") || "";
  
  const { toast } = useToast();
  const verifyMutation = useVerifyOtp();

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const onSubmit = (values: z.infer<typeof otpSchema>) => {
    verifyMutation.mutate(
      { data: { email, otp: values.otp } },
      {
        onSuccess: () => {
          toast({ title: "Email verified!" });
          setLocation(`/personal-details?email=${encodeURIComponent(email)}`);
        },
        onError: (err) => {
          toast({ title: "Error", description: err.error?.error || "Invalid OTP", variant: "destructive" });
        },
      }
    );
  };

  return (
    <AuthLayout title="Verify Your Email" subtitle={`We've sent a code to ${email}`}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="otp">Verification Code</Label>
          <Input 
            id="otp" 
            type="text" 
            maxLength={6}
            placeholder="123456" 
            className="text-center text-2xl tracking-widest font-mono"
            {...form.register("otp")} 
          />
          {form.formState.errors.otp && <p className="text-sm text-destructive">{form.formState.errors.otp.message}</p>}
        </div>

        <Button type="submit" className="w-full font-semibold" disabled={verifyMutation.isPending}>
          {verifyMutation.isPending ? "Verifying..." : "Verify OTP"}
        </Button>
      </form>
    </AuthLayout>
  );
}
