"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, BookOpenText } from "lucide-react"; 
import { Badge } from "@/components/ui/badge";     

export interface LivroSchema {
  id: string;
  livro?: string | null; 
  autor?: string | null;
  valor?: string | null; 
  categoria?: string | null;
  imagemCapa?: string | null; 
}

interface BookCardProps {
  livro: LivroSchema;
  index?: number; 
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

export function BookCard({ livro, index }: BookCardProps) {
  const placeholderImage = "https://firebasestorage.googleapis.com/v0/b/gerador-2-c8519.appspot.com/o/uploads%2Fpexels-kassiamelox-15591238.jpg?alt=media&token=6187c6f1-69c3-4a9f-8dd2-82b45a85465f";

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden group border-border hover:border-primary/50 transition-colors duration-300">
        <CardHeader className="p-0 relative aspect-[2/3] overflow-hidden">
          <Link href={`/livros/${livro.id}`} passHref className="block w-full h-full">
            <Image
              src={livro.imagemCapa || placeholderImage}
              alt={livro.livro || "Capa do Livro"}
              width={300}
              height={450}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 ease-in-out"
              priority={index !== undefined && index < 4} 
            />
          </Link>
          {livro.categoria && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              {livro.categoria}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <Link href={`/livros/${livro.id}`} passHref>
            <CardTitle className="text-lg font-semibold leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
              {livro.livro || "Título Indisponível"}
            </CardTitle>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {livro.autor || "Autor Desconhecido"}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-col items-start gap-3">
          <p className="text-xl font-bold text-primary">{livro.valor || "Preço Sob Consulta"}</p>
          <div className="w-full flex gap-2">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href={`/livro/${livro.id}`}>
                <BookOpenText className="mr-2 h-4 w-4" /> Ver Detalhes
              </Link>
            </Button>
            {}
            {}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}