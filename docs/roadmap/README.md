# Feuille de route — Expense Tracker open source

Statut : **décisions tranchées** (39, voir [`decisions-taken.md`](./decisions-taken.md)). Les tâches de [`phases.md`](./phases.md) les appliquent ; chacune devient un ADR au démarrage de la tâche.
Date : 2026-11-16. Source : audit d'écart (sections A–E) + exigences du propriétaire.

## Vision

Une application de finances personnelles et familiales (profils **Parent**, **Seul**, **Enfant**), libre, auto-hébergeable en une commande Docker, maintenable par une communauté. Niveau de qualité visé : celui d'un projet comme OneUptime (fiable, clair, bien organisé).

## Barre de qualité

| Axe              | Cible                                                                                            | Aujourd'hui                                             |
| ---------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| Fiabilité        | Logique d'argent pure et testée (propriétés), invariants de solde vérifiés en CI                 | 25 lignes de test sur les soldes                        |
| Sécurité         | OWASP ASVS L2, isolation entre comptes testée par des tests négatifs, aucun secret dans le dépôt | `proxy.ts` inerte, pas de rate limit, pas de CSP        |
| Tests            | TDD, pyramide complète (unit, intégration Postgres réel, E2E, a11y), seuils de couverture        | Vitest web seul, services simulés, pas d'E2E            |
| Auto-hébergement | `docker compose up`, Postgres standard, sauvegarde et restauration documentées                   | Vercel + Neon uniquement                                |
| Design           | Design system atomique partagé web adulte + app enfant                                           | Copies shadcn dans `apps/web`                           |
| Accessibilité    | WCAG 2.2 AA, axe en CI                                                                           | Blocages clavier relevés dans `docs/ux-audit.md`        |
| i18n             | FR par défaut, catalogues de messages, aucune chaîne en dur                                      | Chaînes anglaises en dur                                |
| Communauté       | Licence libre, CONTRIBUTING, modèles d'issues, prise en main < 10 min sur Linux/macOS/Windows    | Aucun fichier communautaire, chemin pnpm Windows en dur |
| Agents IA        | Règles courtes, permissions restreintes, l'agent interroge toujours le propriétaire              | CLAUDE.md personnel, 2 agents génériques, ~70 skills    |

## Principes

| #   | Principe                                        | Conséquence                                                                                                                  |
| --- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | Le propriétaire décide, l'agent propose         | Toute décision produit ou architecture passe par `AskUserQuestion`, option recommandée en premier, libellée « (Recommandé) » |
| 2   | Test d'abord                                    | Chaque tâche commence par un test rouge ; pas de fusion sans test                                                            |
| 3   | Tranches verticales petites                     | Une tâche = une PR, livrable seule, relisible en moins de 30 minutes                                                         |
| 4   | L'argent n'est jamais un flottant               | Un seul type `Money`, une seule règle d'arrondi, dans `packages/core`                                                        |
| 5   | Isolation par défaut                            | Toute requête est bornée par l'acteur ; chaque case de la matrice d'accès a un test négatif                                  |
| 6   | Auto-hébergement d'abord                        | Aucune dépendance obligatoire à un service hébergé ; tout fournisseur est derrière une interface                             |
| 7   | Soin du system design                           | Toute décision structurante laisse un ADR dans `docs/decisions/`                                                             |
| 8   | Les canvases de démo sont la spec d'acceptation | Leurs dataplans deviennent des jeux de données et des tests d'invariants, pas du code porté tel quel                         |
| 9   | La doc vit avec le code                         | Les agents écrivent la doc (JSDoc, README, `docs/`) ; elle est relue en revue                                                |

## Comment lire la feuille de route

| Fichier                                      | Contenu                                                                                         | À lire quand                                      |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| [`decisions-taken.md`](./decisions-taken.md) | Les 39 décisions tranchées D-01 à D-39                                                          | En premier : elles s'imposent à toutes les tâches |
| [`decisions-open.md`](./decisions-open.md)   | Note : plus de décision ouverte ; correspondance avec l'audit                                   | Pour relier l'audit aux décisions                 |
| [`phases.md`](./phases.md)                   | Phases → epics → tâches (id, résultat, critères, test d'abord, dépendances, décision appliquée) | Pour choisir la prochaine tâche                   |
| [`agent-setup.md`](./agent-setup.md)         | Cible pour `.claude/` : agents, skills, commandes, hooks, règles, permissions, MCP              | Avant la phase 0, epic « Agents »                 |
| [`CLAUDE.proposed.md`](./CLAUDE.proposed.md) | Remplacement de `CLAUDE.md`, en anglais                                                         | À valider avant écriture à la racine              |

Conventions :

- Identifiants : décisions `D-xx`, tâches `P<phase>-<nn>`.
- **QW** = gain rapide : aucune décision requise, moins d'une demi-journée.
- La colonne « Déc. » d'une tâche cite la décision tranchée à appliquer ; l'ADR correspondant est écrit dans la tâche.
- Les phases se recouvrent : l'ordre est celui des dépendances, pas un calendrier. Ordre 0 → 8, quick wins communautaires avancés (D-38).

## Vue d'ensemble des phases

| Phase                             | But                                                                                                    | Critères de sortie                                                                                                                                                                                          | Dépend de                                |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 0. Fondations et outillage agents | Dépôt propre, CI complète, agents configurés, socle de test                                            | Clone + install + tests verts sur Linux/macOS/Windows ; CI : lint, typecheck, tests, build, contrôle des migrations ; nouveau `CLAUDE.md` validé ; un test d'intégration sur Postgres réel (Testcontainers) | D-10 à D-15, D-25, D-26                  |
| 1. Plateforme et sécurité         | Auth, base portable, autorisation, observabilité minimale                                              | Toutes les routes protégées ; suite d'isolation verte ; l'app tourne sur Postgres 16 en conteneur ; `packages/core` avec `Money`                                                                            | Phase 0 ; D-02, D-03, D-04, D-16         |
| 2. Design system et i18n          | `packages/tokens`, `packages/ui` atomique, `packages/i18n`                                             | Écrans web migrés vers `packages/ui` ; zéro chaîne en dur ; axe vert sur les stories                                                                                                                        | Phase 0 ; D-06, D-07, D-08, D-17         |
| 3. Domaine cœur en TDD            | Parité finances personnelles (profil Seul hors colocation)                                             | Récurrents, calendrier, objectifs, notifications, justificatifs, export ; invariants du dataplan Seul verts                                                                                                 | Phases 1 et 2 ; D-18, D-19               |
| 4. Foyer et colocation            | Foyer, invitations, pot commun, colocation                                                             | Matrice d'accès parent / co-parent / colocataire entièrement testée ; invariants du dataplan Parent verts                                                                                                   | Phase 3 ; D-16, D-28                     |
| 5. App enfant                     | Comptes enfant, argent de poche, demandes, règles, app enfant (PWA, D-06)                              | 4 écrans enfant ; rôle enfant restreint testé ; E2E 390 px ; invariants du dataplan Enfant verts                                                                                                            | Phase 4 ; D-06, D-21, D-31               |
| 6. Intégrations                   | Formats d'import (1.0) ; hors 1.0 : synchro bancaire, patrimoine, dettes, impôts, OCR, app Expo native | Import de fichiers et OpenAPI pour la 1.0 ; le reste après (D-06, D-09, D-20)                                                                                                                               | Phase 3 ; D-20                           |
| 7. Auto-hébergement et release    | Images, compose, sauvegardes, docs, 1.0                                                                | `docker compose up` sur machine vierge ; images signées multi-arch ; test de restauration en CI ; guide d'auto-hébergement                                                                                  | Phases 1 à 5 ; D-33, D-39                |
| 8. Communauté                     | Gouvernance, contribution, traductions                                                                 | Fichiers communautaires, modèles d'issues, devcontainer, premières « good first issue »                                                                                                                     | D-15, D-34 ; les QW peuvent être avancés |

## Déjà tranché par le propriétaire

Tout est dans [`decisions-taken.md`](./decisions-taken.md) (D-01 à D-39). Rappel des points structurants :

| Sujet              | Décision                                                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Design system      | Atomique, dans un package partagé web adulte + app enfant                                                                  |
| Monorepo           | Contient l'app enfant et le web adulte                                                                                     |
| Méthode            | TDD                                                                                                                        |
| Agents             | Interrogent toujours via `AskUserQuestion`, ne décident jamais seuls ; édition et lecture chirurgicales ; sorties concises |
| `CLAUDE.md`        | Learning Mode retiré, fichier simplifié, en anglais (D-12) ; à valider avant écriture                                      |
| Documentation      | Les agents écrivent la doc, relue en revue                                                                                 |
| Distribution       | AGPL-3.0 (D-15), Docker pour l'auto-hébergement (D-01)                                                                     |
| Pile               | Better Auth (D-02), `node-postgres` (D-03), pg-boss dans `apps/worker` (D-18)                                              |
| App enfant         | PWA installable `apps/kid` ; Expo natif après la 1.0 (D-06)                                                                |
| Périmètre 1.0      | Parent + Seul + Enfant (D-09, D-39)                                                                                        |
| Préférences agents | Dans le `CLAUDE.md` versionné (D-11)                                                                                       |
