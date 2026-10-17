import { userFromRequest, hasSecret } from '../../../lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const user = userFromRequest(request);
  return Response.json({
    user: user ? { id: user.id, username: user.username } : null,
    configured: hasSecret(),
    signupCode: Boolean(process.env.SIGNUP_CODE),
  });
}
