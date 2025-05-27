// app/api/account/settings/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Ajuste o caminho se necessário
import { z } from 'zod';

// Schema de validação para os dados de entrada
const updateProfileSchema = z.object({
  name: z.string().min(1, "O nome não pode estar vazio.").max(255).optional(),
  image: z.string().url("URL da imagem inválida.").max(2048).optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado. Faça login para continuar.' }, { status: 401 });
    }

    const body = await request.json();
    const parseResult = updateProfileSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Dados inválidos.', issues: parseResult.error.issues }, { status: 400 });
    }

    const { name, image } = parseResult.data;

    // Monta o objeto de dados para atualização apenas com os campos fornecidos
    const dataToUpdate: { name?: string; image?: string } = {};
    if (name !== undefined) {
      dataToUpdate.name = name;
    }
    if (image !== undefined) {
      dataToUpdate.image = image;
    }

    if (Object.keys(dataToUpdate).length === 0) {
        return NextResponse.json({ message: 'Nenhum dado fornecido para atualização.' }, { status: 200 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
    });

    // Nota: A sessão do NextAuth pode precisar ser atualizada para refletir as mudanças imediatamente.
    // O NextAuth.js tem um evento "update" para o callback jwt que pode ser usado,
    // ou o cliente pode precisar recarregar a sessão/página.
    // Para atualizar a sessão do lado do servidor, você precisaria de uma lógica mais complexa
    // ou confiar que o cliente fará um `useSession().update()` ou `getSession()` novamente.

    return NextResponse.json({
      message: 'Perfil atualizado com sucesso!',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        role: updatedUser.role, // Se você tiver role
      },
    });

  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json({ error: 'Falha ao atualizar o perfil no servidor.' }, { status: 500 });
  }
}