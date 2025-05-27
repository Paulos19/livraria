import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/db'; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      // Return JSON error response
      return NextResponse.json({ message: 'Missing email, name, or password' }, { status: 400 });
    }

    const exist = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (exist) {
      // Return JSON error response
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Verificar se o email corresponde ao admin do .env
    const isAdmin = email === process.env.EMAIL_ADMIN_USER;

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: isAdmin ? 'ADMIN' : 'USER',
      },
    });

    return NextResponse.json(user); // Successful response is JSON
  } catch (error) {
    console.error('REGISTRATION_ERROR', error);
    // Return JSON error response for catch block as well
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}