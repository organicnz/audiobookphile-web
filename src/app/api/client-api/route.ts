import { cookies } from 'next/headers';

export async function GET() {
  const cookiesStore = await cookies();
  
  return Response.json({
    auth: 'cookies', // Fixed: was 'none' - now includes cookies in requests
  });
}
