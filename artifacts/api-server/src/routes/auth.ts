import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  SignupBody,
  VerifyOtpBody,
  SavePersonalDetailsBody,
  LoginBody,
  LoginResponse,
  GetMeResponse,
} from "@workspace/api-zod";
import type { Request } from "express";

declare module "express-session" {
  interface SessionData {
    userId: number;
    role: string;
  }
}

const router: IRouter = Router();

// Generate 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /auth/signup
router.post("/auth/signup", async (req: Request, res): Promise<void> => {
  const parsed = SignupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, username, password, role } = parsed.data;

  // Check if user already exists
  const existing = await db
    .select()
    .from(usersTable)
    .where(or(eq(usersTable.email, email), eq(usersTable.username, username)));

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  if (existing.length > 0) {
    const existingUser = existing[0];

    // If the user exists but is not yet verified, allow re-signup with a fresh OTP
    if (!existingUser.isVerified && existingUser.email === email) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db
        .update(usersTable)
        .set({ password: hashedPassword, username, role, otp, otpExpiresAt })
        .where(eq(usersTable.email, email));
      req.log.info({ email, otp }, `Resent OTP for ${email}: ${otp}`);
      res.status(201).json({ message: `New OTP generated. Your OTP is: ${otp}`, otp });
      return;
    }

    // Already verified or different user with same username/email
    res.status(400).json({ error: "Email or username already exists" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.insert(usersTable).values({
    email,
    username,
    password: hashedPassword,
    role,
    otp,
    otpExpiresAt,
    isVerified: false,
  });

  // Log OTP to console as fallback
  req.log.info({ email, otp }, `OTP for ${email}: ${otp}`);

  // Return the OTP in the response so the frontend can display it directly
  res.status(201).json({ message: `Account created successfully. Your OTP is: ${otp}`, otp });
});

// POST /auth/verify-otp
router.post("/auth/verify-otp", async (req: Request, res): Promise<void> => {
  const parsed = VerifyOtpBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, otp } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

  if (!user) {
    res.status(400).json({ error: "User not found" });
    return;
  }

  if (user.otp !== otp) {
    res.status(400).json({ error: "Invalid OTP" });
    return;
  }

  if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
    res.status(400).json({ error: "OTP has expired" });
    return;
  }

  await db.update(usersTable).set({ otp: null, otpExpiresAt: null }).where(eq(usersTable.id, user.id));

  res.json({ message: "OTP verified successfully" });
});

// POST /auth/personal-details
router.post("/auth/personal-details", async (req: Request, res): Promise<void> => {
  const parsed = SavePersonalDetailsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, name, mobile, dob, college, department, year } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(400).json({ error: "User not found" });
    return;
  }

  await db
    .update(usersTable)
    .set({ name, mobile, dob, college, department, year, isVerified: true })
    .where(eq(usersTable.id, user.id));

  res.json({ message: "Personal details saved successfully" });
});

// POST /auth/login
router.post("/auth/login", async (req: Request, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { identifier, password } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(or(eq(usersTable.email, identifier), eq(usersTable.username, identifier)));

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  req.session.userId = user.id;
  req.session.role = user.role;

  const userResponse = {
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
  };

  res.json(LoginResponse.parse({ message: "Login successful", user: userResponse }));
});

// POST /auth/logout
router.post("/auth/logout", (req: Request, res): void => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
});

// GET /auth/me
router.get("/auth/me", async (req: Request, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const userResponse = {
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
  };

  res.json(GetMeResponse.parse(userResponse));
});

export default router;
