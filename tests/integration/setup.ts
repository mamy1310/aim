import { afterAll, beforeEach } from 'vitest';

import { prisma } from '@/lib/db';

const TABLES = [
  'AIGenerationLog',
  'NewsletterIssueItem',
  'NewsletterIssue',
  'NewsletterArticleSummary',
  'NewsletterArticle',
  'NewsletterSource',
  'NewsletterSubscription',
  'StripeSubscription',
  'Badge',
  'LessonCompletion',
  'Enrollment',
  'QuizAttempt',
  'Question',
  'Quiz',
  'Lesson',
  'Course',
  'VerificationToken',
  'Session',
  'Account',
  'User',
];

beforeEach(async () => {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${TABLES.map((table) => `"${table}"`).join(', ')} RESTART IDENTITY CASCADE`,
  );
});

afterAll(async () => {
  await prisma.$disconnect();
});
