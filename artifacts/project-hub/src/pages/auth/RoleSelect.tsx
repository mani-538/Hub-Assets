import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { GraduationCap, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

export default function RoleSelect() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full text-center mb-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-tight">
            Welcome to Project Hub
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Choose your role to get started with the centralized student project management system.
          </p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Link href="/signup?role=student" className="block h-full">
            <Card className="h-full p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:border-primary/50 group cursor-pointer border-2 border-transparent hover:-translate-y-1">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Student</h2>
              <p className="text-muted-foreground">Submit projects, track daily updates, and manage your academic progress.</p>
            </Card>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Link href="/login" className="block h-full">
            <Card className="h-full p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:border-primary/50 group cursor-pointer border-2 border-transparent hover:-translate-y-1">
              <div className="w-20 h-20 rounded-2xl bg-secondary text-secondary-foreground flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Administrator</h2>
              <p className="text-muted-foreground">Review submissions, approve projects, and monitor all student activities.</p>
            </Card>
          </Link>
        </motion.div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
