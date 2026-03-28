import { useGetAllProjects, useUpdateProjectStatus } from "@workspace/api-client-react";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetAllProjectsQueryKey, getGetAdminDashboardQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function AdminProjects() {
  const { data: projects, isLoading } = useGetAllProjects();
  const updateStatusMutation = useUpdateProjectStatus();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  if (isLoading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  const handleStatusChange = (projectId: number, newStatus: any) => {
    updateStatusMutation.mutate(
      { projectId, data: { status: newStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAllProjectsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
          toast({ title: "Status updated successfully!" });
        },
        onError: () => toast({ title: "Failed to update status", variant: "destructive" })
      }
    );
  };

  const filtered = projects?.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.studentUsername.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Manage Projects</h1>
        <p className="text-muted-foreground mt-1">Review and update student project statuses.</p>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/20">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by title or student username..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Project</th>
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map(project => (
                <tr key={project.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{project.title}</div>
                    <div className="text-muted-foreground line-clamp-1 max-w-xs" title={project.description}>{project.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{project.studentName || 'N/A'}</div>
                    <div className="text-muted-foreground text-xs">@{project.studentUsername}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                    {format(new Date(project.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Select defaultValue={project.status} onValueChange={(val) => handleStatusChange(project.id, val)}>
                      <SelectTrigger className="w-[140px] h-8 text-xs font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
