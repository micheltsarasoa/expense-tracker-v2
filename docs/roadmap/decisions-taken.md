# Décisions tranchées

À convertir en ADR (`docs/decisions/`) lors de la tâche correspondante.

## Tour 1

| ID   | Décision                                                                                                                                                                                                |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D-01 | Auto-hébergement seul ; la porte reste ouverte à un service plus tard                                                                                                                                   |
| D-02 | Better Auth (migration depuis Stack Auth)                                                                                                                                                               |
| D-03 | Postgres standard partout (`node-postgres`) ; Neon reste un hébergeur possible                                                                                                                          |
| D-04 | `numeric(15,2)` en base, chaînes de bout en bout, type `Money` unique dans `packages/core`                                                                                                              |
| D-05 | Une devise par foyer / utilisateur                                                                                                                                                                      |
| D-06 | App enfant : PWA installable d'abord, Expo natif ensuite                                                                                                                                                |
| D-07 | Français par défaut + anglais au lancement                                                                                                                                                              |
| D-08 | Les canvases de démo font foi (Ledger, thème lilas famille) ; le Figma est retiré des règles                                                                                                            |
| D-09 | 1.0 = Parent + Seul + Enfant ; hors 1.0 : synchro bancaire, OCR, patrimoine, dettes, impôts                                                                                                             |
| D-10 | BMAD : garder `review-edge-case-hunter`, `create-prd` (+ `edit-prd`, `validate-prd`), `create-architecture`, `technical-research`, `advanced-elicitation`, `checkpoint-preview` ; retirer tout le reste |
| D-11 | Préférences du propriétaire dans `CLAUDE.md` versionné                                                                                                                                                  |
| D-12 | Code, commits, issues, docs contributeur en anglais ; guide utilisateur FR + EN ; feuille de route et ADR existants laissés en l'état                                                                   |
| D-13 | Docs périmées déplacées dans `docs/archive/` avec bandeau « périmé »                                                                                                                                    |
| D-14 | `main` protégée, checks requis, fusion par squash, une PR par tâche                                                                                                                                     |

## Tour 2

| ID   | Décision                                                                                                                                                                                   |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D-15 | Licence AGPL-3.0                                                                                                                                                                           |
| D-16 | Lignes possédées par `user_id` ; `household_id` seulement sur les objets partagés ; accès croisés via `authorize()`                                                                        |
| D-17 | `packages/tokens` + `packages/ui` web (React DOM, Tailwind v4, shadcn) pour `apps/web` et `apps/kid` ; complété quand Expo arrive                                                          |
| D-18 | pg-boss dans un conteneur `apps/worker`                                                                                                                                                    |
| D-19 | `StorageProvider` : disque local par défaut, S3-compatible en option (profil MinIO) ; OCR hors 1.0                                                                                         |
| D-20 | Aucune synchro bancaire en 1.0 ; import de fichiers ; `BankProvider` conçu après                                                                                                           |
| D-21 | Socle mineurs (compte créé par le parent, sans e-mail enfant, tranche d'âge, consentement parental enregistré, aucun traceur, effacement par le parent) + relecture juridique avant la 1.0 |
| D-22 | Commande `seed:demo <profil>` issue des dataplans                                                                                                                                          |
| D-23 | Espaces de noms i18n par tranche d'âge, repli sur le texte standard                                                                                                                        |
| D-24 | Traductions : fichiers dans git, contributions par PR ; plateforme évaluée après la 1.0                                                                                                    |
| D-25 | Testcontainers Postgres 16 pour les tests d'intégration                                                                                                                                    |
| D-26 | Seuils CI bloquants (90 % `packages/core`, 80 % global, non-régression) + hook `tdd-guard`                                                                                                 |
| D-27 | Logs pino avec identifiant de requête, `/healthz` et `/readyz`, suivi d'erreurs compatible Sentry ; OpenTelemetry en profil compose optionnel                                              |

## Tour 3

| ID   | Décision                                                                                      |
| ---- | --------------------------------------------------------------------------------------------- |
| D-28 | Module `authorize()` + RLS Postgres en défense en profondeur                                  |
| D-29 | `current_balance` en cache + tâche de réconciliation + tests d'invariants                     |
| D-30 | Notifications 1.0 : in-app (source de vérité) + e-mail SMTP                                   |
| D-31 | REST `/api/v1`, OpenAPI généré depuis Zod, client typé `packages/api-client`                  |
| D-32 | Storybook + captures Playwright (régression visuelle) + axe                                   |
| D-33 | release-please                                                                                |
| D-34 | DCO (`Signed-off-by`)                                                                         |
| D-35 | Markdown dans `docs/` jusqu'à la phase 7, puis site statique `apps/docs`                      |
| D-36 | Pas de migration des comptes ; 2FA TOTP optionnelle pour les adultes, jamais pour les enfants |
| D-37 | Profil compose optionnel Caddy (TLS automatique) + doc pour proxy existant                    |

## Tour 4

| ID   | Décision                                                                                                                     |
| ---- | ---------------------------------------------------------------------------------------------------------------------------- |
| D-38 | Phases dans l'ordre 0 → 8, quick wins communautaires avancés                                                                 |
| D-39 | Sortie 1.0 : périmètre D-09 + revue ASVS L2 + WCAG 2.2 AA + seuils D-26 + test de restauration + relecture juridique mineurs |
