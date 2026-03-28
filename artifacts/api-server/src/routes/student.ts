import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, usersTable, projectsTable, projectUpdatesTable } from "@workspace/db";
import {
  CreateProjectBody,
  GetProjectParams,
  GetProjectUpdatesParams,
  AddProjectUpdateParams,
  AddProjectUpdateBody,
  UpdateStudentProfileBody,
} from "@workspace/api-zod";
import type { Request } from "express";

const router: IRouter = Router();

// Middleware to require student auth
function requireStudent(req: Request, res: any, next: any): void {
  if (!req.session.userId || req.session.role !== "student") {
    res.status(401).json({ error: "Not authenticated as student" });
    return;
  }
  next();
}

// GET /student/projects
router.get("/student/projects", requireStudent, async (req: Request, res): Promise<void> => {
  const projects = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.studentId, req.session.userId!))
    .orderBy(projectsTable.createdAt);

  res.json(
    projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status,
      studentId: p.studentId,
      createdAt: p.createdAt.toISOString(),
    })),
  );
});

// POST /student/projects
router.post("/student/projects", requireStudent, async (req: Request, res): Promise<void> => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [project] = await db
    .insert(projectsTable)
    .values({ ...parsed.data, studentId: req.session.userId!, status: "Pending" })
    .returning();

  res.status(201).json({
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status,
    studentId: project.studentId,
    createdAt: project.createdAt.toISOString(),
  });
});

// GET /student/projects/:projectId
router.get("/student/projects/:projectId", requireStudent, async (req: Request, res): Promise<void> => {
  const params = GetProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(and(eq(projectsTable.id, params.data.projectId), eq(projectsTable.studentId, req.session.userId!)));

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

// GET /student/projects/:projectId/updates
router.get("/student/projects/:projectId/updates", requireStudent, async (req: Request, res): Promise<void> => {
  const params = GetProjectUpdatesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  // Verify project belongs to student
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(and(eq(projectsTable.id, params.data.projectId), eq(projectsTable.studentId, req.session.userId!)));

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const updates = await db
    .select()
    .from(projectUpdatesTable)
    .where(eq(projectUpdatesTable.projectId, params.data.projectId))
    .orderBy(projectUpdatesTable.date);

  res.json(
    updates.map((u) => ({
      id: u.id,
      projectId: u.projectId,
      updateText: u.updateText,
      date: u.date.toISOString(),
    })),
  );
});

// POST /student/projects/:projectId/updates
router.post("/student/projects/:projectId/updates", requireStudent, async (req: Request, res): Promise<void> => {
  const params = AddProjectUpdateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = AddProjectUpdateBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  // Verify project belongs to student
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(and(eq(projectsTable.id, params.data.projectId), eq(projectsTable.studentId, req.session.userId!)));

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const [update] = await db
    .insert(projectUpdatesTable)
    .values({ projectId: params.data.projectId, updateText: body.data.updateText })
    .returning();

  res.status(201).json({
    id: update.id,
    projectId: update.projectId,
    updateText: update.updateText,
    date: update.date.toISOString(),
  });
});

// GET /student/profile
router.get("/student/profile", requireStudent, async (req: Request, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    name: user.name,
    mobile: user.mobile,
    dob: user.dob,
    college: user.college,
    department: user.department,
    year: user.year,
    isVerified: user.isVerified,
  });
});

// PUT /student/profile
router.put("/student/profile", requireStudent, async (req: Request, res): Promise<void> => {
  const parsed = UpdateStudentProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set(parsed.data)
    .where(eq(usersTable.id, req.session.userId!))
    .returning();

  res.json({
    id: updated.id,
    email: updated.email,
    username: updated.username,
    role: updated.role,
    name: updated.name,
    mobile: updated.mobile,
    dob: updated.dob,
    college: updated.college,
    department: updated.department,
    year: updated.year,
    isVerified: updated.isVerified,
  });
});

export default router;
