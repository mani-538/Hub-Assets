import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSavePersonalDetails } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useSearch, useLocation } from "wouter";

const detailsSchema = z.object({
  name: z.string().min(2, "Name is required"),
  mobile: z.string().min(10, "Valid mobile number required"),
  dob: z.string().min(1, "Date of birth is required"),
  college: z.string().min(2, "College name is required"),
  department: z.enum(["CSE", "IT", "AIDS", "ECE", "EEE", "MECH"]),
  year: z.enum(["1st", "2nd", "3rd", "4th"]),
});

export default function PersonalDetails() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const email = searchParams.get("email") || "";
  
  const { toast } = useToast();
  const detailsMutation = useSavePersonalDetails();

  const form = useForm<z.infer<typeof detailsSchema>>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { name: "", mobile: "", dob: "", college: "" },
  });

  const onSubmit = (values: z.infer<typeof detailsSchema>) => {
    detailsMutation.mutate(
      { data: { email, ...values } },
      {
        onSuccess: () => {
          toast({ title: "Profile setup complete!", description: "Please log in to continue." });
          setLocation("/login");
        },
        onError: (err) => {
          toast({ title: "Error", description: err.error?.error || "Failed to save details", variant: "destructive" });
        },
      }
    );
  };

  return (
    <AuthLayout title="Complete Your Profile" subtitle="Tell us a bit more about yourself.">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" placeholder="John Doe" {...form.register("name")} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input id="mobile" placeholder="9876543210" {...form.register("mobile")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" type="date" {...form.register("dob")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="college">College Name</Label>
          <Input id="college" placeholder="Engineering Institute" {...form.register("college")} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select onValueChange={(val: any) => form.setValue("department", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Dept" />
              </SelectTrigger>
              <SelectContent>
                {["CSE", "IT", "AIDS", "ECE", "EEE", "MECH"].map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Select onValueChange={(val: any) => form.setValue("year", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {["1st", "2nd", "3rd", "4th"].map((yr) => (
                  <SelectItem key={yr} value={yr}>{yr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" className="w-full font-semibold" disabled={detailsMutation.isPending}>
          {detailsMutation.isPending ? "Saving..." : "Complete Profile"}
        </Button>
      </form>
    </AuthLayout>
  );
}
