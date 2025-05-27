// components/layout/footer.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { BookMarked, Mail, Phone, MapPin, Send } from "lucide-react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa"; // Usando react-icons para mais variedade
import { motion } from "framer-motion";

// Ícone da Logo (pode ser o mesmo da Navbar ou uma variação)
function FooterLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 group mb-4">
      <BookMarked className="h-8 w-8 text-primary transition-transform group-hover:scale-110 duration-300" />
      <span className="text-2xl font-bold">
        <span className="text-primary">Seboso</span>{" "}
        <span className="text-foreground">| Livraria</span>
      </span>
    </Link>
  );
}

// Seções de Links
const linkSections = [
  {
    title: "Institucional",
    links: [
      { label: "Sobre Nós", href: "/sobre" },
      { label: "Nossa Missão", href: "/missao" },
      { label: "Trabalhe Conosco", href: "/carreiras" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Ajuda e Suporte",
    links: [
      { label: "Perguntas Frequentes (FAQ)", href: "/faq" },
      { label: "Como Comprar", href: "/como-comprar" },
      { label: "Política de Entrega", href: "/entrega" },
      { label: "Trocas e Devoluções", href: "/trocas" },
      { label: "Fale Conosco", href: "/contato" },
    ],
  },
  {
    title: "Categorias Populares",
    // Estes links podem ser dinâmicos ou fixos para as categorias mais importantes
    links: [
      { label: "Ficção Científica", href: "/livros/categoria/ficcao-cientifica" },
      { label: "Romance", href: "/livros/categoria/romance" },
      { label: "Suspense e Mistério", href: "/livros/categoria/suspense" },
      { label: "Fantasia", href: "/livros/categoria/fantasia" },
      { label: "História", href: "/livros/categoria/historia" },
    ],
  },
];

// Ícones de Redes Sociais
const socialLinks = [
  { label: "Facebook", icon: FaFacebookF, href: "https://facebook.com/sebosolivraria" },
  { label: "Twitter", icon: FaTwitter, href: "https://twitter.com/sebosolivraria" },
  { label: "Instagram", icon: FaInstagram, href: "https://instagram.com/sebosolivraria" },
  { label: "LinkedIn", icon: FaLinkedinIn, href: "https://linkedin.com/company/sebosolivraria" },
  { label: "Youtube", icon: FaYoutube, href: "https://youtube.com/sebosolivraria" },
];


export function MainFooter() {
  const currentYear = new Date().getFullYear();

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };


  return (
    <motion.footer
      className="bg-muted/50 dark:bg-zinc-900/70 text-muted-foreground border-t border-border/50"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={sectionVariants}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Seção Superior: Links e Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 mb-10">
          {/* Logo e Descrição Breve */}
          <motion.div className="lg:col-span-2 xl:col-span-2" variants={itemVariants}>
            <FooterLogo />
            <p className="text-sm mb-4 max-w-md">
              Sua jornada pelo universo da leitura começa aqui. Explore, descubra e apaixone-se por novas histórias todos os dias.
            </p>
            <div className="space-y-2 text-sm">
                <p className="flex items-center"><Mail className="w-4 h-4 mr-2 text-primary"/> contato@sebosolivraria.com.br</p>
                <p className="flex items-center"><Phone className="w-4 h-4 mr-2 text-primary"/> (XX) XXXX-XXXX</p>
                <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-primary"/> Rua das Letras, 123 - Bairro Literário, Cidade dos Livros - UF</p>
            </div>
          </motion.div>

          {/* Seções de Links */}
          {linkSections.slice(0, 2).map((section) => ( // Mostra as 2 primeiras seções de links aqui
            <motion.div key={section.title} variants={itemVariants}>
              <h3 className="text-md font-semibold text-foreground mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Newsletter - movida para ser a última coluna no layout xl */}
          <motion.div className="md:col-span-2 lg:col-span-1 xl:col-span-1" variants={itemVariants}>
            <h3 className="text-md font-semibold text-foreground mb-4">Fique por Dentro</h3>
            <p className="text-sm mb-3">Receba novidades, promoções exclusivas e dicas de leitura em seu e-mail.</p>
            <form className="flex gap-2">
              <Input type="email" placeholder="Seu melhor e-mail" className="bg-background dark:bg-zinc-800" />
              <Button type="submit" variant="default" size="icon" aria-label="Inscrever na Newsletter">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        </div>

        {/* Seção de Categorias Populares (Opcional, pode ser repetitivo se já na navbar) */}
        {/* Se desejar, pode adicionar a terceira seção de links aqui, talvez com um layout diferente */}
        {/* Exemplo:
        <motion.div className="mb-10" variants={itemVariants}>
            <h3 className="text-md font-semibold text-foreground mb-4 text-center md:text-left">Categorias em Destaque</h3>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 justify-center md:justify-start">
            {linkSections[2].links.map((link) => (
                <li key={link.label}>
                <Button variant="link" asChild className="p-0 h-auto text-sm text-muted-foreground hover:text-primary">
                    <Link href={link.href}>{link.label}</Link>
                </Button>
                </li>
            ))}
            </ul>
        </motion.div>
        */}

        <Separator className="my-8 bg-border/60" />

        {/* Seção Inferior: Copyright e Redes Sociais */}
        <motion.div className="flex flex-col md:flex-row items-center justify-between text-sm" variants={itemVariants}>
          <p className="mb-4 md:mb-0">
            &copy; {currentYear} Seboso | Livraria. Todos os direitos reservados.
            <br className="sm:hidden"/> Desenvolvido com ❤️ e ☕.
          </p>
          <div className="flex items-center space-x-1 mb-4 md:mb-0">
            <Link href="/termos-de-servico" className="hover:text-primary transition-colors px-2">Termos</Link>
            <span className="text-border">|</span>
            <Link href="/politica-de-privacidade" className="hover:text-primary transition-colors px-2">Privacidade</Link>
          </div>
          <div className="flex space-x-4">
            {socialLinks.map((social) => (
              <Link key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <social.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}