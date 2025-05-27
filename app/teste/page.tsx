import React from 'react'
import jsonData from '../../public/livros.json'
import prisma  from '@/lib/db'

const page = async () => {
    for( const item of jsonData){
        try{
            await prisma.livro.create({
                data: {
                    codigo: item.codigo,
                    livro: item.livro,
                    categoria: item.categoria,
                    autor: item.autor,
                    valor: item.valor,
                }
            })
            console.log('Livro cadastrado com sucesso')
        }catch(error){
            console.log('Erro ao cadastrar livro')
            return error
            //return item.codig}
    }
}
  return (
    <div>
      Seu Json
    </div>
  )
}

export default page
