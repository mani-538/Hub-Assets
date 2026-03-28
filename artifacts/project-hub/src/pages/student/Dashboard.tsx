import { useGetStudentProjects, useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, CheckCircle2, Clock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { StatusBadge } from "@/components/StatusBadge";

export default function StudentDashboard() {
  const { data: user } = useGetMe();
  const { data: projects, isLoading } = useGetStudentProjects();

  if (isLoading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  const total = projects?.length || 0;
  const completed = projects?.filter(p => p.status === "Completed").length || 0;
  const pending = projects?.filter(p => p.status === "Pending").length || 0;
  
  const recentProjects = projects?.slice(0, 3) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 border border-primary/10">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome back, {user?.name || user?.username}! 👋
          </h1>
          <p className="mt-2 text-muted-foreground text-lg">
            Here's what's happening with your academic projects today.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Projects" value={total} icon={FolderKanban} delay={0.1} />
        <StatCard title="Completed" value={completed} icon={CheckCircle2} delay={0.2} color="text-emerald-500" bg="bg-emerald-500/10" />
        <StatCard title="Pending Review" value={pending} icon={Clock} delay={0.3} color="text-yellow-500" bg="bg-yellow-500/10" />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/40">
            <CardTitle className="text-xl">Recent Projects</CardTitle>
            <Link href="/student/projects">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentProjects.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <FolderKanban className="w-12 h-12 mb-3 text-muted" />
                <p>No projects found. Ready to start your first one?</p>
                <Link href="/student/projects/new">
                  <Button className="mt-4">Create Project</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {recentProjects.map(project => (
                  <div key={project.id} className="p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-1">{project.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1 max-w-xl">{project.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={project.status} />
                      <Link href={`/student/projects/${project.id}/updates`}>
                        <Button variant="outline" size="sm">Updates</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, delay, color = "text-primary", bg = "bg-primary/10" }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="shadow-sm border-border/50 hover:shadow-md transition-all">
        <CardContent className="p-6 flex items-center gap-4">
          <div className={`p-4 rounded-xl ${bg} ${color}`}>
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-display font-bold text-foreground">{value}</h3>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
