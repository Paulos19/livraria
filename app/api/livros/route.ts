// app/api/livros/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/db'; // Certifique-se que este caminho está correto
import { Prisma } from '@prisma/client'; // Importe Prisma para acesso aos tipos

/**
 * @swagger
 * components:
 * schemas:
 * Livro:
 * type: object
 * properties:
 * id:
 * type: string
 * format: uuid
 * description: O ID único do livro.
 * codigo:
 * type: string
 * nullable: true
 * description: Código do livro (ISBN, SKU, etc.).
 * livro:
 * type: string
 * nullable: true
 * description: Título do livro.
 * autor:
 * type: string
 * nullable: true
 * description: Autor do livro.
 * valor:
 * type: string
 * nullable: true
 * description: Preço do livro.
 * categoria:
 * type: string
 * nullable: true
 * description: Categoria do livro.
 * example:
 * id: "123e4567-e89b-12d3-a456-426614174000"
 * codigo: "978-3-16-148410-0"
 * livro: "O Guia do Mochileiro das Galáxias"
 * autor: "Douglas Adams"
 * valor: "42.00"
 * categoria: "Ficção Científica"
 */

/**
 * @swagger
 * /api/livros:
 * get:
 * summary: Lista livros com paginação e filtro
 * description: Retorna uma lista paginada e filtrada de livros cadastrados no banco de dados.
 * tags:
 * - Livros
 * parameters:
 * - in: query
 * name: page
 * schema:
 * type: integer
 * default: 1
 * description: Número da página para retornar.
 * - in: query
 * name: limit
 * schema:
 * type: integer
 * default: 10
 * description: Número de livros por página.
 * - in: query
 * name: search
 * schema:
 * type: string
 * description: Termo de busca para filtrar livros por título, autor, código ou categoria.
 * responses:
 * 200:
 * description: Lista de livros retornada com sucesso.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * data:
 * type: array
 * items:
 * $ref: '#/components/schemas/Livro'
 * totalCount:
 * type: integer
 * description: Número total de livros correspondentes ao filtro.
 * page:
 * type: integer
 * description: Página atual retornada.
 * limit:
 * type: integer
 * description: Limite de itens por página.
 * totalPages:
 * type: integer
 * description: Número total de páginas para os resultados filtrados.
 * 500:
 * description: Erro interno do servidor.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * error:
 * type: string
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const searchTerm = searchParams.get('search') || '';

    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.max(1, Math.min(100, limit));

    const skip = (validatedPage - 1) * validatedLimit;

    // Definindo explicitamente o tipo para whereClause
    const whereClause: Prisma.LivroWhereInput = searchTerm
      ? {
          OR: [
            { livro: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } },
            { autor: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } },
            { codigo: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } },
            { categoria: { contains: searchTerm, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const [livros, totalCount] = await prisma.$transaction([
      prisma.livro.findMany({
        skip: skip,
        take: validatedLimit,
        where: whereClause,
        orderBy: {
          livro: 'asc',
        },
      }),
      prisma.livro.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      data: livros,
      totalCount,
      page: validatedPage,
      limit: validatedLimit,
      totalPages: Math.ceil(totalCount / validatedLimit),
    });
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
    return NextResponse.json(
      { error: "Falha ao buscar livros no servidor." },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/livros:
 * post:
 * summary: Adiciona um novo livro
 * description: Cria um novo livro no banco de dados.
 * tags:
 * - Livros
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * codigo:
 * type: string
 * nullable: true
 * livro:
 * type: string
 * description: Título do livro (obrigatório).
 * autor:
 * type: string
 * nullable: true
 * valor:
 * type: string
 * nullable: true
 * categoria:
 * type: string
 * nullable: true
 * required:
 * - livro
 * responses:
 * 201:
 * description: Livro criado com sucesso.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Livro'
 * 400:
 * description: Dados inválidos fornecidos.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * error:
 * type: string
 * 409:
 * description: Conflito, livro com código/identificador único já existe.
 * 500:
 * description: Erro interno do servidor ao criar o livro.
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.livro || typeof data.livro !== 'string' || data.livro.trim() === '') {
      return NextResponse.json(
        { error: "O campo 'livro' (título) é obrigatório e não pode ser vazio." },
        { status: 400 }
      );
    }

    const novoLivro = await prisma.livro.create({
      data: {
        codigo: data.codigo,
        livro: data.livro.trim(),
        autor: data.autor,
        valor: data.valor,
        categoria: data.categoria,
      },
    });
    return NextResponse.json(novoLivro, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar livro:", error);
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      return NextResponse.json(
        { error: `Já existe um livro com este ${target ? target.join(', ') : 'valor único'}. Por favor, verifique os campos.` },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Falha ao criar livro no servidor." },
      { status: 500 }
    );
  }
}