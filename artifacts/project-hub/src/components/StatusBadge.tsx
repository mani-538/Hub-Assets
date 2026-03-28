import { Badge } from "@/components/ui/badge";

type Status = "Pending" | "Approved" | "Rejected" | "Completed" | string;

export function StatusBadge({ status }: { status: Status }) {
  const variants: Record<string, string> = {
    Pending: "bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 border-yellow-500/30",
    Approved: "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/30",
    Completed: "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-500/30",
    Rejected: "bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-500/30",
  };

  return (
    <Badge variant="outline" className={`font-medium px-2.5 py-0.5 border ${variants[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </Badge>
  );
}
