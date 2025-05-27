// app/api/categorias/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const categorias = await prisma.livro.findMany({
      where: {
        categoria: {
          not: null, // Não considera livros sem categoria
          notIn: [''],   // Não considera categorias vazias
        },
      },
      distinct: ['categoria'],
      select: {
        categoria: true,
      },
      orderBy: {
        categoria: 'asc',
      },
    });

    // Extrai apenas os nomes das categorias do array de objetos
    const nomesCategorias = categorias.map(item => item.categoria).filter(Boolean) as string[];

    return NextResponse.json(nomesCategorias);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return NextResponse.json(
      { error: "Falha ao buscar categorias no servidor." },
      { status: 500 }
    );
  }
}