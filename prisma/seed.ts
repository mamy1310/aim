import 'dotenv/config';

import { hash } from 'bcryptjs';

import { prisma } from '@/lib/db';
import { type SourceCategory } from '@/lib/generated/prisma/enums';

const SOURCES: { name: string; rssUrl: string; category: SourceCategory }[] = [
  { name: 'OpenAI', rssUrl: 'https://openai.com/news/rss.xml', category: 'OFFICIAL' },
  { name: 'Google DeepMind', rssUrl: 'https://deepmind.google/blog/rss.xml', category: 'OFFICIAL' },
  { name: 'Hugging Face', rssUrl: 'https://huggingface.co/blog/feed.xml', category: 'OFFICIAL' },
  { name: 'Google AI', rssUrl: 'https://blog.google/technology/ai/rss/', category: 'OFFICIAL' },
  { name: 'arXiv cs.AI', rssUrl: 'https://rss.arxiv.org/rss/cs.AI', category: 'RESEARCH' },
  { name: 'arXiv cs.CL', rssUrl: 'https://rss.arxiv.org/rss/cs.CL', category: 'RESEARCH' },
  {
    name: 'MIT News AI',
    rssUrl: 'https://news.mit.edu/rss/topic/artificial-intelligence2',
    category: 'OFFICIAL',
  },
  {
    name: 'Anthropic News',
    rssUrl:
      'https://raw.githubusercontent.com/taobojlen/anthropic-rss-feed/main/anthropic_news_rss.xml',
    category: 'COMMUNITY',
  },
];

async function main() {
  const passwordHash = await hash('motdepasse1', 12);

  await prisma.user.upsert({
    where: { email: 'admin@aim.local' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@aim.local',
      name: 'Admin AIm',
      role: 'ADMIN',
      passwordHash,
      emailVerified: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: 'etudiant@aim.local' },
    update: {},
    create: {
      email: 'etudiant@aim.local',
      name: 'Etudiante de test',
      passwordHash,
      emailVerified: new Date(),
    },
  });

  for (const source of SOURCES) {
    await prisma.newsletterSource.upsert({
      where: { rssUrl: source.rssUrl },
      update: { name: source.name, category: source.category },
      create: source,
    });
  }

  const course = await prisma.course.upsert({
    where: { slug: 'comprendre-l-ia-generative' },
    update: {},
    create: {
      slug: 'comprendre-l-ia-generative',
      title: "Comprendre l'IA generative",
      description:
        "Les notions de base pour comprendre ce qu'est un modele de langage, ce qu'il sait faire et ou sont ses limites.",
      level: 1,
      order: 1,
      published: true,
      aiAssisted: false,
    },
  });

  const lessons = [
    {
      title: "Ce qu'est un modele de langage",
      order: 1,
      contentMd:
        "## Un modele de langage predit du texte\n\nUn modele de langage apprend a predire le mot suivant a partir de milliards d'exemples. Il ne consulte pas une base de connaissances : il produit la suite la plus vraisemblable.\n",
      estimatedMinutes: 8,
    },
    {
      title: 'Ce que le modele ne sait pas faire',
      order: 2,
      contentMd:
        "## Les limites a connaitre\n\nUn modele peut affirmer une chose fausse avec assurance. Il n'a pas de notion de verite, seulement de vraisemblance. La verification reste a votre charge.\n",
      estimatedMinutes: 7,
    },
    {
      title: 'Formuler une demande utile',
      order: 3,
      contentMd:
        '## Donner du contexte\n\nUne demande precise produit une reponse precise : indiquez le role attendu, le format de sortie et les contraintes.\n',
      estimatedMinutes: 6,
    },
    {
      title: 'Verifier une reponse',
      order: 4,
      contentMd:
        '## Recouper les sources\n\nDemandez les sources, verifiez-les, et confrontez la reponse a une source primaire avant de la reutiliser.\n',
      estimatedMinutes: 6,
    },
  ];

  for (const lesson of lessons) {
    const existing = await prisma.lesson.findFirst({
      where: { courseId: course.id, order: lesson.order },
    });
    if (existing) {
      await prisma.lesson.update({ where: { id: existing.id }, data: lesson });
    } else {
      await prisma.lesson.create({ data: { ...lesson, courseId: course.id } });
    }
  }

  const quiz = await prisma.quiz.upsert({
    where: { courseId: course.id },
    update: {},
    create: { courseId: course.id, passScore: 70 },
  });

  const questions = [
    {
      order: 1,
      text: 'Que fait un modele de langage lorsqu il repond ?',
      options: [
        { label: 'Il predit la suite de texte la plus vraisemblable', isCorrect: true },
        { label: 'Il consulte une base de donnees de faits verifies', isCorrect: false },
        { label: 'Il recopie une reponse ecrite par un humain', isCorrect: false },
      ],
      explanation: 'Le modele produit une suite probable, pas une verite verifiee.',
    },
    {
      order: 2,
      text: 'Une reponse assuree du modele est-elle forcement exacte ?',
      options: [
        { label: 'Non, le ton assure ne garantit rien', isCorrect: true },
        { label: 'Oui, le modele signale toujours ses doutes', isCorrect: false },
      ],
      explanation: "L'assurance du style est independante de l'exactitude du contenu.",
    },
    {
      order: 3,
      text: 'Qu est-ce qui ameliore le plus la qualite d une reponse ?',
      options: [
        { label: 'Preciser le role, le format et les contraintes', isCorrect: true },
        { label: 'Ecrire la demande en majuscules', isCorrect: false },
        { label: 'Repeter la question plusieurs fois', isCorrect: false },
      ],
      explanation: 'Le contexte explicite reduit la marge d interpretation.',
    },
  ];

  for (const question of questions) {
    const existing = await prisma.question.findFirst({
      where: { quizId: quiz.id, order: question.order },
    });
    if (existing) {
      await prisma.question.update({ where: { id: existing.id }, data: question });
    } else {
      await prisma.question.create({ data: { ...question, quizId: quiz.id } });
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
