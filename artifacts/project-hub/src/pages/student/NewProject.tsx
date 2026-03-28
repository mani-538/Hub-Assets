import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateProject } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { getGetStudentProjectsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const projectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Please provide a detailed description (min 20 chars)"),
});

export default function NewProject() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreateProject();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: { title: "", description: "" },
  });

  const onSubmit = (values: z.infer<typeof projectSchema>) => {
    createMutation.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetStudentProjectsQueryKey() });
          toast({ title: "Project created successfully!" });
          setLocation("/student/projects");
        },
        onError: (err) => {
          toast({ title: "Error", description: err.error?.error || "Failed to create project", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link href="/student/projects" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Projects
      </Link>
      
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
          <CardTitle className="text-2xl font-display">Create New Project</CardTitle>
          <CardDescription>Submit a new project proposal for administrative review.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base">Project Title</Label>
              <Input 
                id="title" 
                placeholder="E.g., AI-Powered Study Assistant" 
                className="text-lg py-6"
                {...form.register("title")} 
              />
              {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">Detailed Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe your project's objectives, tech stack, and expected outcomes..." 
                className="min-h-[150px] resize-none text-base leading-relaxed"
                {...form.register("description")} 
              />
              {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
            </div>

            <div className="pt-4 flex justify-end gap-4">
              <Link href="/student/projects">
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              <Button type="submit" disabled={createMutation.isPending} className="font-semibold shadow-md">
                {createMutation.isPending ? "Submitting..." : "Submit Project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
