import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useGetMe } from "@workspace/api-client-react";

import { Navbar } from "@/components/layout/Navbar";
import NotFound from "@/pages/not-found";

import RoleSelect from "@/pages/auth/RoleSelect";
import Signup from "@/pages/auth/Signup";
import VerifyOtp from "@/pages/auth/VerifyOtp";
import PersonalDetails from "@/pages/auth/PersonalDetails";
import Login from "@/pages/auth/Login";

import StudentDashboard from "@/pages/student/Dashboard";
import StudentProjects from "@/pages/student/Projects";
import NewProject from "@/pages/student/NewProject";
import ProjectDetails from "@/pages/student/ProjectDetails";
import StudentProfile from "@/pages/student/Profile";

import AdminDashboard from "@/pages/admin/Dashboard";
import AdminProjects from "@/pages/admin/Projects";
import AdminUsers from "@/pages/admin/Users";

const queryClient = new QueryClient();

// Route Protection Logic
function ProtectedRoute({ component: Component, allowedRole }: { component: any, allowedRole?: 'student' | 'admin' }) {
  const { data: user, isLoading } = useGetMe({ query: { retry: false } });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (!user) return <Redirect to="/login" />;
  if (allowedRole && user.role !== allowedRole) {
    return <Redirect to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Component />
      </main>
    </div>
  );
}

function PublicOnlyRoute({ component: Component }: { component: any }) {
  const { data: user, isLoading } = useGetMe({ query: { retry: false } });

  if (isLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (user) {
    return <Redirect to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} />;
  }

  return <Component />;
}

function RootRedirect() {
  const { data: user, isLoading } = useGetMe({ query: { retry: false } });
  
  if (isLoading) return <div className="min-h-screen bg-background" />;
  if (!user) return <Redirect to="/role-select" />;
  return <Redirect to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRedirect} />
      
      {/* Auth Routes */}
      <Route path="/role-select"><PublicOnlyRoute component={RoleSelect} /></Route>
      <Route path="/signup"><PublicOnlyRoute component={Signup} /></Route>
      <Route path="/verify-otp"><PublicOnlyRoute component={VerifyOtp} /></Route>
      <Route path="/personal-details"><PublicOnlyRoute component={PersonalDetails} /></Route>
      <Route path="/login"><PublicOnlyRoute component={Login} /></Route>

      {/* Student Routes */}
      <Route path="/student/dashboard"><ProtectedRoute component={StudentDashboard} allowedRole="student" /></Route>
      <Route path="/student/projects"><ProtectedRoute component={StudentProjects} allowedRole="student" /></Route>
      <Route path="/student/projects/new"><ProtectedRoute component={NewProject} allowedRole="student" /></Route>
      <Route path="/student/projects/:id/updates"><ProtectedRoute component={ProjectDetails} allowedRole="student" /></Route>
      <Route path="/student/profile"><ProtectedRoute component={StudentProfile} allowedRole="student" /></Route>

      {/* Admin Routes */}
      <Route path="/admin/dashboard"><ProtectedRoute component={AdminDashboard} allowedRole="admin" /></Route>
      <Route path="/admin/projects"><ProtectedRoute component={AdminProjects} allowedRole="admin" /></Route>
      <Route path="/admin/users"><ProtectedRoute component={AdminUsers} allowedRole="admin" /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
