import { ReactNode } from "react";
import { motion } from "framer-motion";

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="min-h-screen flex w-full relative bg-background">
      {/* Background Section */}
      <div className="hidden lg:flex flex-1 relative bg-muted items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 z-10" />
        <img
          src={`${import.meta.env.BASE_URL}images/auth-bg.png`}
          alt="Abstract Academic Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
        <div className="absolute bottom-12 left-12 z-20 text-foreground max-w-lg">
          <h1 className="text-4xl font-display font-bold mb-4">Empower Your Academic Journey</h1>
          <p className="text-lg text-muted-foreground">
            Centralized tracking, streamlined approvals, and transparent progress for every student project.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-[480px] xl:w-[560px] bg-background">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto w-full max-w-sm lg:w-96"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold text-foreground">{title}</h2>
            {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
