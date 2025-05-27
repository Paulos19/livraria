"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BookCard, LivroSchema } from "../shared/BookCard";

interface BookCarouselSectionProps {
  title: string;
  livros: LivroSchema[];
  viewAllLink?: string; 
  className?: string;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1, 
    },
  },
};

export function BookCarouselSection({ title, livros, viewAllLink, className }: BookCarouselSectionProps) {
  if (!livros || livros.length === 0) {
    return null; 
  }

  return (
    <motion.section
      className={className}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible" 
      viewport={{ once: true, amount: 0.2 }} 
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        {viewAllLink && (
          <Button variant="outline" asChild>
            <Link href={viewAllLink}>
              Ver Todos <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
      <div className="relative">
        {}
        <div className="grid grid-flow-col auto-cols-[250px] sm:auto-cols-[280px] md:auto-cols-[300px] gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent">
          {livros.map((livro, index) => (
            <BookCard key={livro.id || index} livro={livro} index={index} />
          ))}
           {}
           {viewAllLink && livros.length > 3 && ( 
            <motion.div
              className="flex items-center justify-center auto-cols-[250px] sm:auto-cols-[280px] md:auto-cols-[300px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: livros.length * 0.1 + 0.2 }}
            >
              <Button variant="ghost" asChild className="h-full text-center text-primary hover:bg-primary/10">
                <Link href={viewAllLink} className="flex flex-col items-center justify-center p-6">
                  <ArrowRight className="mb-2 h-8 w-8" />
                  Ver todos de {title}
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  );
}