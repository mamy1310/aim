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
      name: 'Étudiante de test',
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

  const courseData = {
    slug: 'comprendre-l-ia-generative',
    title: "Comprendre l'IA générative",
    description:
      "Les notions de base pour comprendre ce qu'est un modèle de langage, ce qu'il sait faire et où sont ses limites.",
    level: 1,
    order: 1,
    published: true,
    aiAssisted: false,
  };

  const course = await prisma.course.upsert({
    where: { slug: courseData.slug },
    update: courseData,
    create: courseData,
  });

  const lessons = [
    {
      title: "Ce qu'est un modèle de langage",
      order: 1,
      contentMd:
        "## Un modèle de langage prédit du texte\n\nUn modèle de langage apprend à prédire le mot suivant à partir de milliards d'exemples. Il ne consulte pas une base de connaissances : il produit la suite la plus vraisemblable.\n",
      estimatedMinutes: 8,
    },
    {
      title: 'Ce que le modèle ne sait pas faire',
      order: 2,
      contentMd:
        "## Les limites à connaître\n\nUn modèle peut affirmer une chose fausse avec assurance. Il n'a pas de notion de vérité, seulement de vraisemblance. La vérification reste à votre charge.\n",
      estimatedMinutes: 7,
    },
    {
      title: 'Formuler une demande utile',
      order: 3,
      contentMd:
        '## Donner du contexte\n\nUne demande précise produit une réponse précise : indiquez le rôle attendu, le format de sortie et les contraintes.\n',
      estimatedMinutes: 6,
    },
    {
      title: 'Vérifier une réponse',
      order: 4,
      contentMd:
        '## Recouper les sources\n\nDemandez les sources, vérifiez-les, et confrontez la réponse à une source primaire avant de la réutiliser.\n',
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
      text: "Que fait un modèle de langage lorsqu'il répond ?",
      options: [
        { label: 'Il prédit la suite de texte la plus vraisemblable', isCorrect: true },
        { label: 'Il consulte une base de données de faits vérifiés', isCorrect: false },
        { label: 'Il recopie une réponse écrite par un humain', isCorrect: false },
      ],
      explanation: 'Le modèle produit une suite probable, pas une vérité vérifiée.',
    },
    {
      order: 2,
      text: 'Une réponse assurée du modèle est-elle forcément exacte ?',
      options: [
        { label: 'Non, le ton assuré ne garantit rien', isCorrect: true },
        { label: 'Oui, le modèle signale toujours ses doutes', isCorrect: false },
      ],
      explanation: "L'assurance du style est indépendante de l'exactitude du contenu.",
    },
    {
      order: 3,
      text: "Qu'est-ce qui améliore le plus la qualité d'une réponse ?",
      options: [
        { label: 'Préciser le rôle, le format et les contraintes', isCorrect: true },
        { label: 'Écrire la demande en majuscules', isCorrect: false },
        { label: 'Répéter la question plusieurs fois', isCorrect: false },
      ],
      explanation: "Le contexte explicite réduit la marge d'interprétation.",
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
