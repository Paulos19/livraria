"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Como faço para comprar um livro?",
    answer:
      "Navegue pela nossa coleção, adicione os livros desejados ao carrinho e siga para o checkout. O processo é simples e seguro!",
  },
  {
    question: "Quais formas de pagamento são aceitas?",
    answer:
      "Aceitamos os principais cartões de crédito (Visa, MasterCard, Amex), PIX e boleto bancário.",
  },
  {
    question: "Qual o prazo de entrega?",
    answer:
      "O prazo de entrega varia conforme sua localidade e a modalidade de frete escolhida. Você pode calcular o prazo exato na página do produto ou no carrinho.",
  },
  {
    question: "Posso trocar ou devolver um livro?",
    answer:
      "Sim, nossa política de troca e devolução garante seus direitos. Consulte nossa página de 'Trocas e Devoluções' para mais detalhes.",
  },
  {
    question: "Como entro em contato com o suporte?",
    answer:
      "Você pode nos contatar através do formulário em nossa página de 'Contato', por email (suporte@sebosolivraria.com) ou pelo chat online durante o horário comercial.",
  },
];

const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
};

export function FAQSection() {
  return (
    <motion.section
        id="faq"
        className="py-16 md:py-24 bg-muted/30 dark:bg-zinc-900/30"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container mx-auto px-4">
        <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
          Perguntas Frequentes
        </motion.h2>
        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
          {faqItems.map((item, index) => (
            <motion.div key={index} variants={itemVariants} custom={index}>
                 <AccordionItem value={`item-${index}`} className="border-b border-border/50">
                    <AccordionTrigger className="text-left hover:no-underline py-4 text-lg">
                        {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-4 text-muted-foreground">
                        {item.answer}
                    </AccordionContent>
                </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </motion.section>
  );
}