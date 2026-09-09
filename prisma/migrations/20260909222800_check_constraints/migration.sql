ALTER TABLE "Course" ADD CONSTRAINT "Course_level_min" CHECK ("level" >= 1);
ALTER TABLE "NewsletterArticleSummary" ADD CONSTRAINT "NewsletterArticleSummary_level_min" CHECK ("level" >= 1);
ALTER TABLE "NewsletterSubscription" ADD CONSTRAINT "NewsletterSubscription_maxLevel_min" CHECK ("maxLevel" IS NULL OR "maxLevel" >= 1);
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_progress_range" CHECK ("progress" BETWEEN 0 AND 100);
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_passScore_range" CHECK ("passScore" BETWEEN 0 AND 100);
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_score_range" CHECK ("score" BETWEEN 0 AND 100);
