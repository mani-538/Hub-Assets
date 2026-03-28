import { useGetProject, useGetProjectUpdates, useAddProjectUpdate } from "@workspace/api-client-react";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { ArrowLeft, Clock, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetProjectUpdatesQueryKey } from "@workspace/api-client-react";
import { motion } from "framer-motion";

export default function ProjectDetails() {
  const [, params] = useRoute("/student/projects/:id/updates");
  const projectId = parseInt(params?.id || "0");
  
  const { data: project, isLoading: loadingProj } = useGetProject(projectId, { query: { enabled: !!projectId } });
  const { data: updates, isLoading: loadingUpdates } = useGetProjectUpdates(projectId, { query: { enabled: !!projectId } });
  
  const [open, setOpen] = useState(false);
  const [updateText, setUpdateText] = useState("");
  const addUpdateMutation = useAddProjectUpdate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (loadingProj || loadingUpdates) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (!project) return <div className="p-8 text-center">Project not found</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateText.trim()) return;
    
    addUpdateMutation.mutate(
      { projectId, data: { updateText } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetProjectUpdatesQueryKey(projectId) });
          setOpen(false);
          setUpdateText("");
          toast({ title: "Update added successfully!" });
        },
        onError: () => toast({ title: "Failed to add update", variant: "destructive" })
      }
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link href="/student/projects" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
      </Link>

      <Card className="border-border/50 overflow-hidden shadow-md">
        <div className="h-2 bg-gradient-to-r from-primary to-accent" />
        <CardContent className="p-8">
          <div className="flex justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">{project.title}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> Created {format(new Date(project.createdAt), 'MMMM d, yyyy')}</span>
              </div>
            </div>
            <StatusBadge status={project.status} />
          </div>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-base leading-relaxed whitespace-pre-wrap">{project.description}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold">Progress Timeline</h2>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-sm">
              <MessageSquarePlus className="w-4 h-4 mr-2" /> Add Update
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Post a Daily Update</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <Textarea 
                placeholder="What did you work on today?" 
                value={updateText}
                onChange={e => setUpdateText(e.target.value)}
                className="min-h-[150px] resize-none"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={addUpdateMutation.isPending || !updateText.trim()}>
                  {addUpdateMutation.isPending ? "Posting..." : "Post Update"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        {updates?.length === 0 ? (
          <div className="text-center p-12 bg-muted/20 rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground">No updates yet. Share your first progress report!</p>
          </div>
        ) : (
          updates?.map((update, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              key={update.id} 
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-foreground">Update #{updates.length - idx}</div>
                  <time className="text-xs font-medium text-muted-foreground">{format(new Date(update.date), 'MMM d, h:mm a')}</time>
                </div>
                <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{update.updateText}</div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
