import { useGetStudentProfile, useUpdateStudentProfile } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetStudentProfileQueryKey, getGetMeQueryKey } from "@workspace/api-client-react";
import { UserCircle, Mail, Phone, Calendar, School, BookOpen, GraduationCap } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  mobile: z.string().min(10, "Valid mobile number required"),
  dob: z.string().min(1, "Date of birth is required"),
  college: z.string().min(2, "College name is required"),
  department: z.enum(["CSE", "IT", "AIDS", "ECE", "EEE", "MECH"]),
  year: z.enum(["1st", "2nd", "3rd", "4th"]),
});

export default function StudentProfile() {
  const { data: profile, isLoading } = useGetStudentProfile();
  const updateMutation = useUpdateStudentProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || "",
        mobile: profile.mobile || "",
        dob: profile.dob || "",
        college: profile.college || "",
        department: (profile.department as any) || "CSE",
        year: (profile.year as any) || "1st",
      });
    }
  }, [profile, form]);

  if (isLoading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (!profile) return null;

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    updateMutation.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetStudentProfileQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setOpen(false);
          toast({ title: "Profile updated successfully!" });
        },
        onError: () => toast({ title: "Failed to update profile", variant: "destructive" })
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="border-border/50 overflow-hidden shadow-lg">
        <div className="h-32 bg-gradient-to-r from-primary/80 to-accent/80 relative">
          <div className="absolute -bottom-12 left-8 w-24 h-24 bg-background rounded-full p-1 shadow-md">
            <div className="w-full h-full bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <UserCircle className="w-14 h-14" />
            </div>
          </div>
        </div>
        <CardContent className="pt-16 px-8 pb-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">{profile.name}</h1>
              <p className="text-muted-foreground text-lg">@{profile.username}</p>
            </div>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="shadow-sm">Edit Profile</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Edit Profile Information</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input {...form.register("name")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Mobile</Label>
                      <Input {...form.register("mobile")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input type="date" {...form.register("dob")} />
                    </div>
                    <div className="space-y-2">
                      <Label>College</Label>
                      <Input {...form.register("college")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select onValueChange={v => form.setValue("department", v as any)} defaultValue={form.getValues("department")}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["CSE", "IT", "AIDS", "ECE", "EEE", "MECH"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Select onValueChange={v => form.setValue("year", v as any)} defaultValue={form.getValues("year")}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["1st", "2nd", "3rd", "4th"].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={updateMutation.isPending}>Save Changes</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="font-semibold text-lg border-b pb-2">Contact Info</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-5 h-5 text-primary" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-5 h-5 text-primary" />
                  <span>{profile.mobile || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>{profile.dob || "Not provided"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-semibold text-lg border-b pb-2">Academic Info</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <School className="w-5 h-5 text-primary" />
                  <span>{profile.college || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span>{profile.department || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <span>{profile.year ? `${profile.year} Year` : "Not provided"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
