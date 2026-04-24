import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';
import { LoginInput, RegisterInput } from '../validators/auth.validator';

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

/**
 * Login user
 */
export const login = async (input: LoginInput): Promise<AuthResponse> => {
  const { email, password } = input;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  // Create user session
  await prisma.userSession.create({
    data: {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      loginTime: new Date(),
    },
  });

  // Create activity log
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      action: 'Tizimga kirdi',
      details: `${user.name} tizimga kirdi`,
      type: 'login',
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

/**
 * Register new user (Admin only)
 */
export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  const { name, email, password, role = 'admin' } = input;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

/**
 * Get current user
 */
export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

/**
 * Logout user
 */
export const logout = async (userId: string): Promise<void> => {
  // Find active session
  const session = await prisma.userSession.findFirst({
    where: {
      userId,
      logoutTime: null,
    },
    orderBy: {
      loginTime: 'desc',
    },
  });

  if (session) {
    // Update session with logout time
    await prisma.userSession.update({
      where: { id: session.id },
      data: { logoutTime: new Date() },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId,
        userName: session.userName,
        userEmail: session.userEmail,
        action: 'Tizimdan chiqdi',
        details: `${session.userName} tizimdan chiqdi`,
        type: 'logout',
      },
    });
  }
};
