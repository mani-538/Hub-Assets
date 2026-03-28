import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db, usersTable, projectsTable } from "@workspace/db";
import {
  UpdateProjectStatusParams,
  UpdateProjectStatusBody,
  DeleteUserParams,
} from "@workspace/api-zod";
import type { Request } from "express";

const router: IRouter = Router();

// Middleware to require admin auth
function requireAdmin(req: Request, res: any, next: any): void {
  if (!req.session.userId || req.session.role !== "admin") {
    res.status(401).json({ error: "Not authenticated as admin" });
    return;
  }
  next();
}

// GET /admin/dashboard
router.get("/admin/dashboard", requireAdmin, async (req: Request, res): Promise<void> => {
  const [userCount] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, "student"));
  const [projectCount] = await db.select({ count: count() }).from(projectsTable);

  const allProjects = await db.select({ status: projectsTable.status }).from(projectsTable);
  const pendingProjects = allProjects.filter((p) => p.status === "Pending").length;
  const completedProjects = allProjects.filter((p) => p.status === "Completed").length;

  res.json({
    totalUsers: Number(userCount.count),
    totalProjects: Number(projectCount.count),
    pendingProjects,
    completedProjects,
  });
});

// GET /admin/projects
router.get("/admin/projects", requireAdmin, async (req: Request, res): Promise<void> => {
  const projects = await db
    .select({
      id: projectsTable.id,
      title: projectsTable.title,
      description: projectsTable.description,
      status: projectsTable.status,
      studentId: projectsTable.studentId,
      createdAt: projectsTable.createdAt,
      studentName: usersTable.name,
      studentUsername: usersTable.username,
    })
    .from(projectsTable)
    .leftJoin(usersTable, eq(projectsTable.studentId, usersTable.id))
    .orderBy(projectsTable.createdAt);

  res.json(
    projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status,
      studentId: p.studentId,
      createdAt: p.createdAt.toISOString(),
      studentName: p.studentName,
      studentUsername: p.studentUsername ?? "",
    })),
  );
});

// PUT /admin/projects/:projectId/status
router.put("/admin/projects/:projectId/status", requireAdmin, async (req: Request, res): Promise<void> => {
  const params = UpdateProjectStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateProjectStatusBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [project] = await db
    .update(projectsTable)
    .set({ status: body.data.status })
    .where(eq(projectsTable.id, params.data.projectId))
    .returning();

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json({
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status,
    studentId: project.studentId,
    createdAt: project.createdAt.toISOString(),
  });
});

// GET /admin/users
router.get("/admin/users", requireAdmin, async (req: Request, res): Promise<void> => {
  const users = await db
    .select()
    .from(usersTable)
    .orderBy(usersTable.createdAt);

  res.json(
    users.map((u) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      role: u.role,
      name: u.name,
      mobile: u.mobile,
      dob: u.dob,
      college: u.college,
      department: u.department,
      year: u.year,
      isVerified: u.isVerified,
    })),
  );
});

// DELETE /admin/users/:userId
router.delete("/admin/users/:userId", requireAdmin, async (req: Request, res): Promise<void> => {
  const params = DeleteUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db.delete(usersTable).where(eq(usersTable.id, params.data.userId)).returning();

  if (!deleted) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ message: "User deleted successfully" });
});

export default router;
