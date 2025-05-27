// app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Ajuste o caminho se necessário

export async function GET() {
  const session = await getServerSession(authOptions);

  // Proteção da Rota: Verifique se o usuário está logado e se é um admin (se aplicável)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  // Exemplo de verificação de role (descomente e ajuste se tiver roles no seu modelo User)
  // if (session.user.role !== 'ADMIN') {
  //   return NextResponse.json({ error: 'Acesso negado. Somente administradores.' }, { status: 403 });
  // }

  try {
    // 1. Quantidade de livros cadastrados
    const totalLivros = await prisma.livro.count();

    // 2. Quantidade de categorias distintas
    const categoriasDistintas = await prisma.livro.findMany({
      where: {
        categoria: {
          not: null, // Não conta categorias nulas
          notIn: [''], // Não conta categorias vazias
        },
      },
      distinct: ['categoria'],
      select: {
        categoria: true,
      },
    });
    const totalCategorias = categoriasDistintas.length;

    // 3. Quantidade de pedidos reservados
    // Esta parte assume que você tem um modelo `Pedido` com um campo `status`
    let totalPedidosReservados = 0;
    try {
      // Verifique se o modelo Pedido existe antes de tentar consultá-lo
      // Em um cenário ideal, você saberia se o modelo existe.
      // Esta verificação é mais para evitar quebrar se o modelo não existir.
      if (prisma.pedido) {
        totalPedidosReservados = await prisma.pedido.count({
          where: {
            status: 'RESERVADO', // Ajuste este valor conforme o status usado no seu sistema
          },
        });
      } else {
        console.warn("Modelo 'Pedido' não encontrado no schema Prisma. Estatística de pedidos reservados será 0.");
      }
    } catch (e) {
        // Captura erro específico se a tabela/modelo Pedido não existir, etc.
        console.warn("Erro ao buscar pedidos reservados (modelo 'Pedido' pode não existir ou 'status' não definido):", e);
        totalPedidosReservados = 0; // Retorna 0 se houver erro
    }


    return NextResponse.json({
      totalLivros,
      totalCategorias,
      totalPedidosReservados,
    });

  } catch (error) {
    console.error("Erro ao buscar estatísticas do admin:", error);
    return NextResponse.json(
      { error: 'Falha ao buscar estatísticas no servidor.' },
      { status: 500 }
    );
  }
}