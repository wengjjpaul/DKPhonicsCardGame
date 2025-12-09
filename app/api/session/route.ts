// Session API route - manages cookie-based sessions without authentication
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, generateSessionId } from '@/lib/session/config';
import { SessionData, SessionResponse, UpdateSessionRequest } from '@/types/session';

// GET /api/session - Get or create session
export async function GET(): Promise<NextResponse<SessionResponse>> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  let isNew = false;

  // Create new session if none exists
  if (!session.sessionId) {
    session.sessionId = generateSessionId();
    session.createdAt = new Date().toISOString();
    isNew = true;
    await session.save();
  }

  return NextResponse.json({
    session: {
      sessionId: session.sessionId,
      playerName: session.playerName,
      createdAt: session.createdAt,
    },
    isNew,
  });
}

// POST /api/session - Update session (e.g., set player name)
export async function POST(request: NextRequest): Promise<NextResponse<SessionResponse>> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  // Ensure session exists
  if (!session.sessionId) {
    session.sessionId = generateSessionId();
    session.createdAt = new Date().toISOString();
  }

  // Update session data
  const body: UpdateSessionRequest = await request.json();

  if (body.playerName !== undefined) {
    session.playerName = body.playerName.trim().slice(0, 20); // Max 20 chars
  }

  await session.save();

  return NextResponse.json({
    session: {
      sessionId: session.sessionId,
      playerName: session.playerName,
      createdAt: session.createdAt,
    },
    isNew: false,
  });
}

// DELETE /api/session - Clear session (logout, though no real auth)
export async function DELETE(): Promise<NextResponse<{ success: boolean }>> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  session.destroy();

  return NextResponse.json({ success: true });
}
