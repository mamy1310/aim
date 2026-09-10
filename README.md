# AIm

Plateforme d'apprentissage à l'IA : des cours gratuits par niveaux, et une newsletter quotidienne
payante qui résume l'actualité IA.

Stack : Next.js 16 (App Router) · React 19 · TypeScript strict · MUI v9 · Prisma + PostgreSQL ·
Auth.js v5 · Stripe · Resend · DeepSeek · next-intl · Vitest + Playwright.

## Prérequis

- Node 22.12 LTS ou Node 24 LTS (contrainte de Vitest 5)
- pnpm 10
- Docker et Docker Compose

## Démarrage local

```bash
pnpm install
docker compose up -d db stripe-mock
pnpm db:deploy
pnpm db:seed
pnpm dev
```

Les tests d'intégration utilisent une base jetable séparée, démarrée par `pnpm test:integration`.
Les tests de bout en bout ont besoin de `stripe-mock` pour le parcours de paiement ; sans lui, ce
scénario est ignoré et les autres tournent normalement.

L'application démarre sur http://localhost:3000 sans aucune clé d'API réelle : les valeurs de
`.env` sont factices et tous les services tiers sont simulés (stripe-mock, mocks Resend et
DeepSeek dans les tests). Les générations IA sont coupées par `AI_SUMMARIZATION_ENABLED=false`.

Comptes du seed : `admin@aim.local` et `etudiant@aim.local`, mot de passe `motdepasse1`.

## Commandes

| Commande                              | Rôle                                                                   |
| ------------------------------------- | ---------------------------------------------------------------------- |
| `pnpm dev`                            | serveur de développement                                               |
| `pnpm build` / `pnpm start`           | build et serveur de production                                         |
| `pnpm lint` / `pnpm lint:fix`         | ESLint                                                                 |
| `pnpm typecheck`                      | `tsc --noEmit`                                                         |
| `pnpm format` / `pnpm format:check`   | Prettier                                                               |
| `pnpm test` / `pnpm test:watch`       | tests unitaires (Vitest)                                               |
| `pnpm test:integration`               | tests d'intégration (démarre la base de test, applique les migrations) |
| `pnpm test:e2e` / `pnpm test:e2e:ui`  | tests end to end (Playwright)                                          |
| `pnpm db:migrate` / `pnpm db:deploy`  | migrations Prisma                                                      |
| `pnpm db:generate` / `pnpm db:studio` | client Prisma et Prisma Studio                                         |
| `pnpm db:seed` / `pnpm db:test:seed`  | données de départ                                                      |
| `pnpm verify`                         | lint + typecheck + tests unitaires + build                             |

## Structure

```
app/          routes App Router : (marketing), (auth), (app), api
lib/          logique métier testable : db, ai, newsletter, auth, stripe
prisma/       schéma, migrations, seed
messages/     traductions next-intl (fr)
tests/        unit, integration, e2e
.github/      CI et workflows cron
```

## Environnements

`.env` contient les valeurs de développement (factices, versionnées). `.env.test` sert aux tests
d'intégration. `.env.example` liste les variables à renseigner en préproduction et en production.

## Déploiement

Le déploiement demande des comptes tiers ; le développement, lui, n'en demande aucun.

### 1. Bases de données Supabase

Créer deux projets, `aim-preview` et `aim-prod`, et noter le mot de passe généré à la création
(il n'est plus consultable ensuite). Pour chaque projet, relever les deux chaînes de connexion :

- `DATABASE_URL` : le pooler, port 6543, avec `?pgbouncer=true`
- `DIRECT_URL` : la connexion directe, port 5432, utilisée par les migrations

### 2. Stripe

Créer un compte, rester en mode test, puis créer le produit « Newsletter AIm » avec un prix
récurrent mensuel de 2,99 euros. Relever `STRIPE_SECRET_KEY`,
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` et `STRIPE_PRICE_ID`. Créer ensuite l'endpoint de webhook
vers `https://<domaine>/api/stripe/webhook` en s'abonnant à `checkout.session.completed`,
`customer.subscription.created`, `customer.subscription.updated`,
`customer.subscription.deleted`, `invoice.payment_failed` et `invoice.payment_succeeded`, puis
relever `STRIPE_WEBHOOK_SECRET`. Activer Stripe Tax si la facturation avec TVA est souhaitée.
En production, ne pas définir `STRIPE_API_BASE` : cette variable ne sert qu'à viser stripe-mock.

### 3. Resend

Créer un compte, vérifier le domaine d'envoi, relever `RESEND_API_KEY`, puis définir `EMAIL_FROM`
et `ADMIN_NOTIFICATION_EMAIL`.

### 4. DeepSeek

Créer un compte, relever `DEEPSEEK_API_KEY` et créditer quelques dollars. Laisser
`AI_SUMMARIZATION_ENABLED=false` jusqu'à ce que le reste du pipeline soit validé en production.

### 5. Vercel

Créer le projet à partir du dépôt, plan Hobby suffisant. Renseigner toutes les variables de
`.env.example`. La commande de build (`pnpm build`) génère le client Prisma ; ajouter
`prisma migrate deploy` à la commande de build ou l'exécuter avant chaque mise en production.
Activer « Wait for Checks » pour que Vercel attende la CI. Brancher le domaine.

### 6. Crons GitHub Actions

Les cinq workflows `.github/workflows/cron-*.yml` appellent les endpoints `/api/cron/*`. Ajouter
les secrets de dépôt `APP_URL` (URL de production, sans barre oblique finale) et `CRON_SECRET`
(valeur identique à la variable d'environnement Vercel). Déclencher chaque workflow une fois à la
main via `workflow_dispatch` avant de compter sur les horaires.

| Workflow                    | Horaire UTC    | Endpoint                         |
| --------------------------- | -------------- | -------------------------------- |
| `cron-newsletter-fetch`     | 5 h            | `/api/cron/newsletter-fetch`     |
| `cron-newsletter-summarize` | 6 h, 8 h, 10 h | `/api/cron/newsletter-summarize` |
| `cron-newsletter-build`     | 11 h           | `/api/cron/newsletter-build`     |
| `cron-newsletter-autosend`  | 16 h           | `/api/cron/newsletter-autosend`  |
| `cron-cleanup-logs`         | dimanche 3 h   | `/api/cron/cleanup-logs`         |

### 7. Google OAuth (facultatif)

Créer un projet Google Cloud, configurer l'écran de consentement, créer un identifiant OAuth et
déclarer la redirection `https://<domaine>/api/auth/callback/google`. Sans `GOOGLE_CLIENT_ID` ni
`GOOGLE_CLIENT_SECRET`, le bouton Google n'est pas affiché.

### 8. Contenu

Le contenu des cours se saisit depuis `/admin/courses`.
