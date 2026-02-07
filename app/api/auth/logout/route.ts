import { NextResponse } from 'next/server';
import { api } from '../../api';
import { cookies } from 'next/headers';
import { isAxiosError } from 'axios';
import { logErrorResponse } from '../../_utils/utils';

export async function POST() {
  const cookieStore = await cookies();

  try {
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    await api.post('auth/logout', null, {
      headers: {
        Cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}`,
      },
    });
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error.response?.data);
      // We still clear local auth cookies to avoid redirect loops on stale tokens.
      cookieStore.delete('accessToken');
      cookieStore.delete('refreshToken');
      return NextResponse.json({ message: 'Logged out locally' }, { status: 200 });
    }
    logErrorResponse({ message: (error as Error).message });
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    return NextResponse.json({ message: 'Logged out locally' }, { status: 200 });
  }

  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
  return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
}
