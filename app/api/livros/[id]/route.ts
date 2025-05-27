// app/api/livros/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { Prisma } from '@prisma/client'; // Para tipos e QueryMode
import { z } from 'zod'; // Para validação

// Schema de validação para atualização do livro (PUT/PATCH)
// Todos os campos são opcionais, pois é uma atualização parcial
const updateLivroSchema = z.object({
  codigo: z.string().max(50).optional().nullable(),
  livro: z.string().min(1, "O título do livro não pode ser vazio.").max(255).optional(),
  autor: z.string().max(255).optional().nullable(),
  valor: z.string().max(50).optional().nullable(), // Considere validação de formato de moeda se necessário
  categoria: z.string().max(100).optional().nullable(),
});

// Handler para GET (obter um livro específico - útil para pré-popular formulário de edição)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'ID do livro não fornecido.' }, { status: 400 });
    }

    const livro = await prisma.livro.findUnique({
      where: { id },
    });

    if (!livro) {
      return NextResponse.json({ error: 'Livro não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(livro);
  } catch (error) {
    console.error("Erro ao buscar livro:", error);
    return NextResponse.json({ error: 'Falha ao buscar o livro no servidor.' }, { status: 500 });
  }
}


// Handler para PUT (atualizar um livro existente)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'ID do livro não fornecido.' }, { status: 400 });
    }

    const body = await request.json();
    const parseResult = updateLivroSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Dados inválidos.', issues: parseResult.error.issues }, { status: 400 });
    }

    const dataToUpdate = parseResult.data;

    // Verifica se há pelo menos um campo para atualizar
    if (Object.keys(dataToUpdate).length === 0) {
        return NextResponse.json({ message: 'Nenhum dado fornecido para atualização.' }, { status: 400 });
    }

    const updatedLivro = await prisma.livro.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedLivro);

  } catch (error: any) {
    console.error("Erro ao atualizar livro:", error);
    if (error.code === 'P2025') { // Erro do Prisma: Registro a ser atualizado não encontrado
      return NextResponse.json({ error: 'Livro não encontrado para atualização.' }, { status: 404 });
    }
    if (error.code === 'P2002') { // Erro do Prisma para constraint única violada (ex: código duplicado)
        const target = error.meta?.target as string[] | undefined;
        return NextResponse.json(
          { error: `Já existe um livro com este ${target ? target.join(', ') : 'valor único'}.` },
          { status: 409 }
        );
      }
    return NextResponse.json({ error: 'Falha ao atualizar o livro no servidor.' }, { status: 500 });
  }
}

// Handler para DELETE (excluir um livro)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'ID do livro não fornecido.' }, { status: 400 });
    }

    await prisma.livro.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Livro excluído com sucesso.' }, { status: 200 }); // Ou 204 No Content

  } catch (error: any) {
    console.error("Erro ao excluir livro:", error);
    if (error.code === 'P2025') { // Erro do Prisma: Registro a ser excluído não encontrado
      return NextResponse.json({ error: 'Livro não encontrado para exclusão.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Falha ao excluir o livro no servidor.' }, { status: 500 });
  }
}