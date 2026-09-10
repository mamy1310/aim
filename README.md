# AIm

Plateforme d'apprentissage a l'IA : des cours gratuits par niveaux, et une newsletter
quotidienne payante qui resume l'actualite IA.

Stack : Next.js 16 (App Router) · React 19 · TypeScript strict · MUI v9 · Prisma + PostgreSQL ·
Auth.js v5 · Stripe · Resend · DeepSeek · next-intl · Vitest + Playwright.

La specification fonctionnelle complete est le fichier `aim-spec.md` a la racine (non versionne).

## Prerequis

- Node 22 ou superieur
- pnpm 10
- Docker et Docker Compose

## Demarrage local

```bash
pnpm install
docker compose up -d db stripe-mock
pnpm db:deploy
pnpm db:seed
pnpm dev
```

Les tests d'integration utilisent une base jetable separee, demarree par `pnpm test:integration`.
Les tests de bout en bout ont besoin de `stripe-mock` pour le parcours de paiement ; sans lui, ce
scenario est ignore et les autres tournent normalement.

L'application demarre sur http://localhost:3000 sans aucune cle d'API reelle : les valeurs de
`.env` sont factices et tous les services tiers sont simules (stripe-mock, mocks Resend et
DeepSeek dans les tests). Les generations IA sont coupees par `AI_SUMMARIZATION_ENABLED=false`.

Comptes du seed : `admin@aim.local` et `etudiant@aim.local`, mot de passe `motdepasse1`.

## Commandes

| Commande                              | Role                                                                   |
| ------------------------------------- | ---------------------------------------------------------------------- |
| `pnpm dev`                            | serveur de developpement                                               |
| `pnpm build` / `pnpm start`           | build et serveur de production                                         |
| `pnpm lint` / `pnpm lint:fix`         | ESLint                                                                 |
| `pnpm typecheck`                      | `tsc --noEmit`                                                         |
| `pnpm format` / `pnpm format:check`   | Prettier                                                               |
| `pnpm test` / `pnpm test:watch`       | tests unitaires (Vitest)                                               |
| `pnpm test:integration`               | tests d'integration (demarre la base de test, applique les migrations) |
| `pnpm test:e2e` / `pnpm test:e2e:ui`  | tests end to end (Playwright)                                          |
| `pnpm db:migrate` / `pnpm db:deploy`  | migrations Prisma                                                      |
| `pnpm db:generate` / `pnpm db:studio` | client Prisma et Prisma Studio                                         |
| `pnpm db:seed` / `pnpm db:test:seed`  | donnees de depart                                                      |
| `pnpm verify`                         | lint + typecheck + tests unitaires + build                             |

## Structure

```
app/          routes App Router : (marketing), (auth), (app), api
lib/          logique metier testable : db, ai, newsletter, auth, stripe
prisma/       schema, migrations, seed
messages/     traductions next-intl (fr)
tests/        unit, integration, e2e
.github/      CI et workflows cron
```

## Environnements

`.env` contient les valeurs de developpement (factices, versionnees). `.env.test` sert aux tests
d'integration. `.env.example` liste les variables a renseigner en preproduction et en production.

## Deploiement

Le deploiement demande des comptes tiers ; le developpement, lui, n en demande aucun.

### 1. Bases de donnees Supabase

Creer deux projets, `aim-preview` et `aim-prod`, et noter le mot de passe genere a la creation
(il n est plus consultable ensuite). Pour chaque projet, relever les deux chaines de connexion :

- `DATABASE_URL` : le pooler, port 6543, avec `?pgbouncer=true`
- `DIRECT_URL` : la connexion directe, port 5432, utilisee par les migrations

### 2. Stripe

Creer un compte, rester en mode test, puis creer le produit « Newsletter AIm » avec un prix
recurrent mensuel de 2,99 euros. Relever `STRIPE_SECRET_KEY`,
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` et `STRIPE_PRICE_ID`. Creer ensuite l endpoint de webhook
vers `https://<domaine>/api/stripe/webhook` en s abonnant a `checkout.session.completed`,
`customer.subscription.created`, `customer.subscription.updated`,
`customer.subscription.deleted`, `invoice.payment_failed` et `invoice.payment_succeeded`, puis
relever `STRIPE_WEBHOOK_SECRET`. Activer Stripe Tax si la facturation avec TVA est souhaitee.
En production, ne pas definir `STRIPE_API_BASE` : cette variable ne sert qu a viser stripe-mock.

### 3. Resend

Creer un compte, verifier le domaine d envoi, relever `RESEND_API_KEY`, puis definir
`EMAIL_FROM` et `ADMIN_NOTIFICATION_EMAIL`.

### 4. DeepSeek

Creer un compte, relever `DEEPSEEK_API_KEY` et crediter quelques dollars. Laisser
`AI_SUMMARIZATION_ENABLED=false` jusqu a ce que le reste du pipeline soit valide en production.

### 5. Vercel

Creer le projet a partir du depot, plan Hobby suffisant. Renseigner toutes les variables de
`.env.example`. La commande de build (`pnpm build`) genere le client Prisma ; ajouter
`prisma migrate deploy` a la commande de build ou l executer avant chaque mise en production.
Activer « Wait for Checks » pour que Vercel attende la CI. Brancher le domaine.

### 6. Crons GitHub Actions

Les cinq workflows `.github/workflows/cron-*.yml` appellent les endpoints `/api/cron/*`. Ajouter
les secrets de depot `APP_URL` (URL de production, sans barre oblique finale) et `CRON_SECRET`
(valeur identique a la variable d environnement Vercel). Declencher chaque workflow une fois a
la main via `workflow_dispatch` avant de compter sur les horaires.

| Workflow                    | Horaire UTC    | Endpoint                         |
| --------------------------- | -------------- | -------------------------------- |
| `cron-newsletter-fetch`     | 5 h            | `/api/cron/newsletter-fetch`     |
| `cron-newsletter-summarize` | 6 h, 8 h, 10 h | `/api/cron/newsletter-summarize` |
| `cron-newsletter-build`     | 11 h           | `/api/cron/newsletter-build`     |
| `cron-newsletter-autosend`  | 16 h           | `/api/cron/newsletter-autosend`  |
| `cron-cleanup-logs`         | dimanche 3 h   | `/api/cron/cleanup-logs`         |

### 7. Google OAuth (facultatif)

Creer un projet Google Cloud, configurer l ecran de consentement, creer un identifiant OAuth et
declarer la redirection `https://<domaine>/api/auth/callback/google`. Sans
`GOOGLE_CLIENT_ID` ni `GOOGLE_CLIENT_SECRET`, le bouton Google n est pas affiche.

### 8. Contenu et informations legales

Les pages `mentions-legales`, `cgv`, `confidentialite` et `cookies` sont livrees comme gabarits
structures : les mentions marquees `[A completer par l editeur du site]` dans `messages/fr.json`
attendent l identite de l editeur, son adresse et son contact. Le contenu des cours se saisit
depuis `/admin/courses`.
