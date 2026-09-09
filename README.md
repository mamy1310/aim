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
