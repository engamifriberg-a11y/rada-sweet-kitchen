import {
  checkPasscode,
  createGate,
  gateCookie,
  gateRequired,
  gateFromRequest,
} from '../../lib/auth';
import { hit, clientIp } from '../../lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** האם השער פתוח לדפדפן הזה */
export async function GET(request) {
  return Response.json({
    required: gateRequired(),
    open: gateFromRequest(request),
  });
}

export async function POST(request) {
  if (!gateRequired()) {
    return Response.json({ ok: true, required: false });
  }

  // השער הוא סוד משותף וקצר, ולכן הוא היעד הקל ביותר לניחוש.
  // חמישה ניסיונות לרבע שעה לכל כתובת.
  const gate = hit(`gate:${clientIp(request)}`, 5, 15 * 60 * 1000);
  if (!gate.ok) {
    return Response.json(
      { error: `יותר מדי ניסיונות. נסו שוב בעוד ${gate.retrySec} שניות.` },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'בקשה לא תקינה.' }, { status: 400 });
  }

  if (!checkPasscode(body?.passcode)) {
    return Response.json({ error: 'סיסמת הכניסה שגויה.' }, { status: 401 });
  }

  return Response.json({ ok: true }, { headers: { 'Set-Cookie': gateCookie(createGate()) } });
}
