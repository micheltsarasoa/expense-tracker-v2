# Phases, epics et tâches

Les 39 décisions sont tranchées : voir [`decisions-taken.md`](./decisions-taken.md). Chaque `D-xx` devient un ADR dans `docs/decisions/` au démarrage de la tâche concernée.

## Lecture

| Colonne                | Sens                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------- |
| ID                     | `P<phase>-<nn>` ; **QW** = gain rapide (aucune décision, moins d'une demi-journée) |
| Résultat               | Ce qui est vrai une fois la tâche fusionnée                                        |
| Critères d'acceptation | Vérifiables, automatisés quand c'est possible                                      |
| Test d'abord           | Le premier test rouge à écrire                                                     |
| Dép.                   | Tâches à fusionner avant                                                           |
| Déc.                   | Décision tranchée à appliquer et à consigner en ADR dans la tâche (vide = aucune)  |

Règles communes à toutes les tâches (non répétées) : une tâche = une PR ; lint, typecheck, tests et build verts ; requêtes bornées par l'acteur ; textes via i18n dès la phase 2 ; doc mise à jour dans la même PR ; un ADR si un choix structurant apparaît — et dans ce cas l'agent s'arrête et interroge ; commits signés `Signed-off-by` (D-34), fusion par squash (D-14) ; textes FR + EN (D-07).

---

## Phase 0 — Fondations et outillage agents

But : un dépôt que n'importe qui (humain ou agent) peut cloner, installer et tester.

### Epic 0.1 — Hygiène du dépôt

| ID       | Résultat                                       | Critères d'acceptation                                                                                                                                              | Test d'abord                                        | Dép. | Déc. |
| -------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ---- | ---- |
| P0-01 QW | Hook husky portable                            | `.husky/pre-commit` appelle `pnpm` sans chemin absolu ; passe sur Linux, macOS, Windows                                                                             | Job CI qui exécute le hook                          | —    | —    |
| P0-02 QW | Groupe de routes renommé `(dashboard)`         | Plus aucune occurrence de `(dahsboard)` ; URLs inchangées                                                                                                           | Tests de routes existants + build                   | —    | —    |
| P0-03 QW | Fichiers locaux sortis de git                  | `.claude/settings.local.json` et `apps/web/.vercel/` non suivis et ignorés                                                                                          | `git ls-files` vide pour ces chemins (vérif. CI)    | —    | —    |
| P0-04 QW | Scripts Python rangés                          | `_parse_xlsx.py` et `packages/db/scripts/*.py` déplacés dans `tools/` avec un README, ou supprimés si inutilisés                                                    | — (déplacement)                                     | —    | —    |
| P0-05 QW | Outils épinglés                                | `.editorconfig`, `.nvmrc`, champ `engines` ; CI lit `.nvmrc`                                                                                                        | —                                                   | —    | —    |
| P0-06 QW | `.env.example` exact + validation au démarrage | Variables = celles lues par le code ; schéma Zod d'environnement ; démarrage refusé avec message clair si invalide                                                  | Test du schéma : variable manquante → erreur nommée | —    | —    |
| P0-07    | `GLOSSARY.md` à la racine                      | Termes FR/EN de la démo (foyer, pot commun, argent de poche, demande, signalement…) ; lié depuis `docs/agents/domain.md`                                            | Vérif. de liens en CI                               | —    | D-12 |
| P0-08    | Docs périmées traitées                         | Docs périmées déplacées dans `docs/archive/` avec bandeau « périmé » ; aucune doc active ne contredit le code ; `docs/agents/README.md` liste les sources de vérité | Vérif. de liens en CI                               | —    | D-13 |
| P0-09    | Licence posée                                  | `LICENSE` AGPL-3.0 + `NOTICE` (skills tiers vendus) ; champ `license` des `package.json`                                                                            | —                                                   | —    | D-15 |

### Epic 0.2 — CI socle

| ID       | Résultat                       | Critères d'acceptation                                                                                  | Test d'abord                                                | Dép.  | Déc. |
| -------- | ------------------------------ | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----- | ---- |
| P0-10 QW | Job `build` en CI              | `turbo build` requis sur PR ; `test` a un `dependsOn` dans `turbo.json`                                 | La CI échoue sur une erreur de build volontaire (PR témoin) | —     | —    |
| P0-11 QW | Contrôle des migrations        | `drizzle-kit check` en CI ; échec si schéma et migrations divergent                                     | PR témoin avec dérive → rouge                               | —     | —    |
| P0-12 QW | Analyse des dépendances        | Dependabot ou Renovate, `pnpm audit`, CodeQL actifs                                                     | —                                                           | —     | —    |
| P0-13 QW | Lint actif sur les packages    | `lint-staged` lance ESLint sur `packages/*` ; zéro erreur                                               | —                                                           | —     | —    |
| P0-14    | `main` protégée                | Checks requis, fusion par squash, une PR par tâche                                                      | —                                                           | P0-10 | D-14 |
| P0-15    | Configs partagées + frontières | `packages/config` (eslint, tsconfig) ; règle « un package n'importe jamais une app » appliquée par lint | Fichier témoin violant la frontière → lint rouge            | P0-13 | —    |

### Epic 0.3 — Agents

Détail dans [`agent-setup.md`](./agent-setup.md).

| ID       | Résultat                                     | Critères d'acceptation                                                                                                                                                                                                                                                                                                | Test d'abord                                                | Dép.         | Déc.       |
| -------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------ | ---------- |
| P0-20    | Nouveau `CLAUDE.md` (+ `AGENTS.md`)          | Validé par le propriétaire ; en anglais (D-12) ; préférences du propriétaire dans ce `CLAUDE.md` versionné, pas de `CLAUDE.local.md` ; sans Learning Mode, sans chemin Windows ; < 120 lignes                                                                                                                         | —                                                           | —            | D-11, D-12 |
| P0-21    | Règles `.claude/rules/`                      | Un fichier par règle, chacun < 40 lignes, portée par chemin                                                                                                                                                                                                                                                           | —                                                           | P0-20        | —          |
| P0-22    | Permissions et hooks                         | Liste `deny` et `ask` en place ; hooks portables, dont `tdd-guard` ; `Bash(git *)` retiré                                                                                                                                                                                                                             | Script de test des hooks : entrée simulée → blocage attendu | —            | D-26       |
| P0-23    | Sous-agents remplacés                        | Les 2 agents génériques supprimés ; agents ciblés, chacun < 60 lignes, outils minimaux                                                                                                                                                                                                                                | —                                                           | P0-21        | —          |
| P0-24    | Tri des skills appliqué                      | Garder `bmad-review-edge-case-hunter`, `bmad-create-prd`, `bmad-edit-prd`, `bmad-validate-prd`, `bmad-create-architecture`, `bmad-technical-research`, `bmad-advanced-elicitation`, `bmad-checkpoint-preview` ; retirer tous les autres `bmad-*` ; reste de la table de [`agent-setup.md`](./agent-setup.md) appliqué | —                                                           | —            | D-10       |
| P0-24b   | Licence BMAD pour les skills gardés          | Avis de licence BMAD ajouté dans `NOTICE` (et fichier de licence à côté des skills gardés)                                                                                                                                                                                                                            | — (vérif. de liens en CI)                                   | P0-24, P0-09 | D-10, D-15 |
| P0-25 QW | `/migrate` sécurisé                          | Refuse toute base non locale sans confirmation ; plus de mention « live Neon »                                                                                                                                                                                                                                        | —                                                           | —            | —          |
| P0-26    | Commandes rafraîchies                        | `/feature` obsolète retirée ; `/sync`, `/test`, `/review`, `/adr` à jour                                                                                                                                                                                                                                              | —                                                           | P0-24        | —          |
| P0-27 QW | `.claudeignore` complet                      | `node_modules`, `.turbo`, `.next`, lockfile, sorties de build ignorés                                                                                                                                                                                                                                                 | —                                                           | —            | —          |
| P0-28    | `.mcp.json`                                  | Serveurs validés par le propriétaire, aucun secret dans le fichier                                                                                                                                                                                                                                                    | —                                                           | —            | —          |
| P0-29    | Hook SessionStart (sessions cloud)           | Installe pnpm et les dépendances ; session cloud prête sans action manuelle                                                                                                                                                                                                                                           | Lancement dans un conteneur vierge                          | P0-01        | —          |
| P0-30    | Formulaires d'issue + définition de « fini » | Formulaires bug, fonctionnalité, tâche agent avec critères d'acceptation ; liste de contrôle dans le modèle de PR                                                                                                                                                                                                     | —                                                           | —            | D-12       |

### Epic 0.4 — Socle TDD

| ID    | Résultat                            | Critères d'acceptation                                                                                   | Test d'abord                                            | Dép.         | Déc. |
| ----- | ----------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------ | ---- |
| P0-31 | `packages/test-utils`               | Fabriques, `withTestDb` sur Testcontainers Postgres 16, `asUser` ; utilisable depuis tous les workspaces | Test : deux `withTestDb` en parallèle sont isolés       | —            | D-25 |
| P0-32 | Tests de caractérisation des soldes | `TransactionService` (création, édition, suppression, transfert) testé sur Postgres réel                 | Les tests eux-mêmes ; ils figent le comportement actuel | P0-31        | D-25 |
| P0-33 | Seuils de couverture                | Rapport fusionné en CI ; seuils bloquants : 90 % `packages/core`, 80 % global, non-régression            | PR témoin sous le seuil → rouge                         | P0-32        | D-26 |
| P0-34 | Squelette Playwright                | Un test de fumée (connexion → tableau de bord) en CI, bureau + 390 px                                    | Le test de fumée                                        | —            | —    |
| P0-35 | `docs/testing.md`                   | Conventions : nommage avec les termes du glossaire, pyramide, où va chaque type de test                  | —                                                       | P0-31, P0-34 | —    |

Sortie de phase : voir [`README.md`](./README.md).

---

## Phase 1 — Plateforme et sécurité

### Epic 1.1 — Sécurité immédiate

| ID       | Résultat                                        | Critères d'acceptation                                                                                 | Test d'abord                                                     | Dép.  | Déc. |
| -------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ----- | ---- |
| P1-01 QW | `proxy.ts` actif                                | Export `config` correct ; requête non authentifiée redirigée vers la connexion                         | Test : requête sans session sur une route protégée → redirection | —     | —    |
| P1-02    | Suite d'isolation des routes existantes         | Pour chaque route `/api/v1/*` : l'utilisateur B ne lit ni ne modifie les données de A (404 ou 403)     | Les tests négatifs, une PR par ressource                         | P0-31 | —    |
| P1-03    | En-têtes de sécurité                            | CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy` ; aucune violation CSP sur le parcours de fumée | Test des en-têtes sur une réponse                                | —     | —    |
| P1-04    | Limitation de débit                             | Indépendante du fournisseur ; connexion et import limités ; 429 avec `Retry-After`                     | Test : N+1 requêtes → 429                                        | P1-10 | D-03 |
| P1-05    | Contrôle d'origine sur le REST à cookie         | Requête d'origine étrangère en écriture refusée                                                        | Test : `Origin` étranger → 403                                   | —     | —    |
| P1-06 QW | Zéro `any` / `@ts-ignore`                       | Les 7 fichiers corrigés ; règle ESLint en erreur                                                       | Le lint                                                          | —     | —    |
| P1-07 QW | Plus de `parseFloat().toFixed` sur des montants | Formatage par une fonction unique                                                                      | Tests de formatage (grands montants, négatifs, arrondis)         | —     | —    |

### Epic 1.2 — Base portable

| ID       | Résultat                       | Critères d'acceptation                                                                                                                                                                                                                | Test d'abord                                                                                        | Dép.  | Déc.                           |
| -------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----- | ------------------------------ |
| P1-10    | Pilote `node-postgres`         | Postgres standard partout, plus de pilote Neon ; l'app et les tests tournent sur un Postgres 16 standard (Neon reste un hébergeur possible)                                                                                           | P0-32 vert sur Postgres standard                                                                    | P0-32 | D-03                           |
| P1-11    | `compose.dev.yml`              | `docker compose -f compose.dev.yml up` fournit Postgres + Mailpit ; documenté                                                                                                                                                         | Fumée Playwright contre ce compose                                                                  | P1-10 | —                              |
| P1-12    | Migrations en attente soldées  | CHECK → `pgEnum`, `updated_at` maintenu                                                                                                                                                                                               | Test : mise à jour d'une ligne → `updated_at` change                                                | P1-10 | —                              |
| P1-13    | Contraintes d'intégrité        | CHECK de signe ; un transfert exige un compte de destination                                                                                                                                                                          | Tests : insertion invalide rejetée par la base                                                      | P1-12 | —                              |
| P1-14    | Intégrité des soldes           | `current_balance` en cache + tâche de réconciliation + tests d'invariants ; écart solde / somme des transactions détecté                                                                                                              | Test de propriété : suite aléatoire d'opérations → solde = somme                                    | P1-50 | D-29                           |
| P1-15 QW | Graine idempotente             | Deux exécutions de la graine des catégories système = même état                                                                                                                                                                       | Test : double exécution, compte identique                                                           | P1-10 | —                              |
| P1-16    | Migrations qui partent de zéro | Une base Postgres vide atteint le schéma courant avec `pnpm --filter db migrate` seul ; la base Neon existante est marquée à jour sans perte ; `withTestDb` construit son modèle par les migrations et non plus par le schéma (P0-31) | Test : base vide → migrations → `check:migrations` sans écart et schéma identique au modèle de test | P1-10 | à poser (sort de la base Neon) |

### Epic 1.3 — Authentification

| ID    | Résultat                                         | Critères d'acceptation                                                                                                           | Test d'abord                                     | Dép.         | Déc.       |
| ----- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------ | ---------- |
| P1-20 | ADR auth (Better Auth) + `spec-auth.md` réécrite | ADR accepté ; spec sans bcrypt/JWT maison ; pas de migration des comptes Stack Auth                                              | —                                                | —            | D-02       |
| P1-21 | Couture `getActor()`                             | Tout le code lit l'acteur par une seule fonction ; faux acteur pour les tests                                                    | Test : service appelé sans acteur → erreur typée | P1-20        | D-02       |
| P1-22 | Inscription, connexion, session sur Better Auth  | Parcours E2E vert ; aucune dépendance à un service hébergé ; la fumée P0-34 couvre connexion → tableau de bord (bureau + 390 px) | E2E inscription → connexion → déconnexion        | P1-21, P1-11 | D-02, D-36 |
| P1-23 | Mot de passe oublié + vérification d'e-mail      | E-mails visibles dans Mailpit ; jetons à usage unique et expirants                                                               | Test : jeton réutilisé → refus                   | P1-22        | —          |
| P1-24 | 2FA TOTP optionnelle                             | Adultes seulement, jamais pour les enfants ; activation, codes de secours, désactivation                                         | Test : connexion sans second facteur → refus     | P1-22        | D-36       |

### Epic 1.4 — Autorisation

| ID    | Résultat                                    | Critères d'acceptation                                                                                                                                                | Test d'abord                                     | Dép.         | Déc. |
| ----- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------ | ---- |
| P1-30 | ADR modèle de tenant                        | Lignes possédées par `user_id`, `household_id` seulement sur les objets partagés, accès croisés via `authorize()` ; ADR accepté ; ADR-005/006 mis à jour ou remplacés | —                                                | —            | D-16 |
| P1-31 | Module `authorize(actor, action, resource)` | Pur, dans `packages/core` ; couvre « ses propres données »                                                                                                            | Table de vérité : chaque couple acteur/action    | P1-30, P1-50 | D-16 |
| P1-32 | Services branchés sur `authorize`           | Un service par PR ; plus de filtrage `userId` ad hoc ; lint interdisant les requêtes brutes hors `packages/db`                                                        | P1-02 reste vert à chaque PR                     | P1-31, P1-02 | —    |
| P1-33 | RLS Postgres (défense en profondeur)        | Politiques par table ; variable de session posée par transaction                                                                                                      | Test : requête SQL directe sans acteur → 0 ligne | P1-32        | D-28 |

### Epic 1.5 — Observabilité minimale

| ID       | Résultat                                     | Critères d'acceptation                                   | Test d'abord                                              | Dép.  | Déc. |
| -------- | -------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------- | ----- | ---- |
| P1-40    | Logs pino, identifiant de requête + masquage | Chaque log porte `requestId` ; e-mails et jetons masqués | Test : log d'une requête → champs attendus, pas de secret | —     | —    |
| P1-41 QW | `/healthz` et `/readyz`                      | `readyz` échoue si la base est injoignable               | Test des deux états                                       | —     | —    |
| P1-42    | Suivi d'erreurs compatible Sentry            | Interface + adaptateur ; désactivé sans configuration    | Test : erreur non gérée → adaptateur factice appelé       | P1-40 | D-27 |

### Epic 1.6 — `packages/core`

| ID    | Résultat                              | Critères d'acceptation                                                                                                                                         | Test d'abord                                 | Dép.         | Déc.       |
| ----- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------ | ---------- |
| P1-50 | Type `Money` + règle d'arrondi unique | `numeric(15,2)` en base, chaînes de bout en bout, une devise par foyer / utilisateur ; zéro dépendance ; addition, soustraction, répartition, formatage neutre | Tests de propriété : somme des parts = total | —            | D-04, D-05 |
| P1-51 | `balance-delta` extrait dans `core`   | Services inchangés en comportement                                                                                                                             | P0-32 reste vert ; tests unitaires du delta  | P1-50, P0-32 | —          |

---

## Phase 2 — Design system et i18n

### Epic 2.1 — Tokens

| ID    | Résultat            | Critères d'acceptation                                                                                                               | Test d'abord                                  | Dép.  | Déc.       |
| ----- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- | ----- | ---------- |
| P2-01 | `packages/tokens`   | Source JSON (format W3C) → variables CSS ; clair, sombre, thème enfant ; basé sur les canvases de démo (Ledger, thème lilas famille) | Test de génération : instantané des variables | —     | D-08, D-17 |
| P2-02 | Contrastes garantis | Chaque paire texte/fond ≥ 4,5:1, contrôles ≥ 3:1                                                                                     | Test automatique des paires de tokens         | P2-01 | —          |

### Epic 2.2 — `packages/ui` atomique

| ID       | Résultat                             | Critères d'acceptation                                                                                                                                                              | Test d'abord                                       | Dép.         | Déc.       |
| -------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------ | ---------- |
| P2-10    | Package + Storybook                  | `packages/ui` web (React DOM, Tailwind v4, shadcn) partagé par `apps/web` et `apps/kid`, dossiers `atoms`, `molecules`, `organisms`, `templates` ; Storybook lancé par une commande | Story témoin + test axe                            | P2-01        | D-17, D-32 |
| P2-11    | Primitives déplacées (atomes)        | Primitives shadcn de `apps/web/components/ui` → `packages/ui` ; une famille par PR                                                                                                  | Test de rendu + axe par atome                      | P2-10        | —          |
| P2-12    | Atomes métier                        | `Money`, `MemberTag`, `Badge`, `Icon`                                                                                                                                               | Tests : `Money` formate selon locale et devise     | P2-11, P1-50 | —          |
| P2-13    | Molécules                            | `AmountField`, `AccountCard`, `ProgressBar`, `Toast` ; une par PR                                                                                                                   | Tests d'interaction clavier                        | P2-12        | —          |
| P2-14    | Organismes                           | `TransactionTable`, `BudgetCard`, `Sheet` ; un par PR                                                                                                                               | Tests : actions de ligne accessibles au clavier    | P2-13        | —          |
| P2-15    | Gabarits                             | Coque adulte, coque enfant (390 px)                                                                                                                                                 | Test de rendu aux deux tailles                     | P2-14        | —          |
| P2-16    | Régression visuelle                  | Captures Playwright de référence en CI                                                                                                                                              | PR témoin modifiant un token → différence détectée | P2-10        | D-32       |
| P2-17 QW | Blocages a11y de l'audit UX corrigés | Actions de ligne visibles au clavier et au toucher ; champs date étiquetés                                                                                                          | Tests axe + clavier sur les écrans concernés       | —            | —          |
| P2-18    | Écrans web migrés                    | Une route par PR ; `apps/web` n'a plus de primitive locale                                                                                                                          | Fumée E2E + capture par route                      | P2-14        | —          |
| P2-19    | Lint a11y                            | `jsx-a11y` en erreur ; axe sur les stories et le parcours de fumée                                                                                                                  | Le lint                                            | P2-17        | —          |

### Epic 2.3 — i18n

| ID    | Résultat                          | Critères d'acceptation                                                                                                       | Test d'abord                                | Dép.  | Déc. |
| ----- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----- | ---- |
| P2-30 | `packages/i18n` + intégration web | Catalogues ICU ; FR par défaut + EN au lancement ; espaces de noms par tranche d'âge avec repli sur le texte standard (D-23) | Test : clé manquante → échec du build       | —     | D-07 |
| P2-31 | Lint « pas de chaîne en dur »     | Règle en avertissement, puis en erreur après P2-32                                                                           | Le lint                                     | P2-30 | —    |
| P2-32 | Chaînes extraites                 | Une route par PR ; zéro littéral restant                                                                                     | Le lint passe en erreur sur la route        | P2-31 | —    |
| P2-33 | Typographie française             | Espaces insécables avant `: ; ? ! % €`, apostrophe typographique                                                             | Test du catalogue FR                        | P2-32 | —    |
| P2-34 | Locale et fuseau par utilisateur  | Réglage persistant ; dates et montants suivent                                                                               | Test : changement de locale → rendu attendu | P2-30 | —    |
| P2-35 | Pseudo-locale                     | Aucun texte tronqué ni non traduit sur le parcours de fumée                                                                  | E2E en pseudo-locale                        | P2-32 | —    |

---

## Phase 3 — Domaine cœur en TDD

Chaque epic suit le même fil : logique pure dans `core` (tests unitaires et de propriété) → table et service (test d'intégration) → route et action (test de contrat) → écran (E2E).

### Epic 3.1 — Transactions

| ID    | Résultat                   | Critères d'acceptation                                                  | Test d'abord                               | Dép.  | Déc. |
| ----- | -------------------------- | ----------------------------------------------------------------------- | ------------------------------------------ | ----- | ---- |
| P3-01 | Drapeau « validée » + note | Filtrable ; modifiable en ligne                                         | Intégration : filtre `validated`           | P1-32 | —    |
| P3-02 | Dédoublonnage à l'import   | `source` + `external_id` uniques ; réimport du même fichier = 0 doublon | Intégration : double import                | P3-01 | —    |
| P3-03 | Historique des imports     | `import_jobs` listés avec statut et compte de lignes                    | Intégration : import → entrée d'historique | P3-02 | —    |
| P3-04 | Export CSV                 | Point d'accès borné par l'acteur ; colonnes documentées                 | Contrat : en-têtes et une ligne attendue   | P3-01 | —    |

### Epic 3.2 — Comptes

| ID    | Résultat                   | Critères d'acceptation                                                                   | Test d'abord                                   | Dép.         | Déc. |
| ----- | -------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------ | ---- |
| P3-10 | Type de compte + archivage | `kind` (courant, crédit, épargne, espèces, prêt) ; un compte archivé sort des sélecteurs | Intégration : archivé exclu des listes actives | P1-32        | —    |
| P3-11 | Carte à débit différé      | Date de prélèvement calculée dans `core`                                                 | Tests de propriété sur les fins de mois        | P3-10, P1-50 | —    |

### Epic 3.3 — Budgets

| ID    | Résultat                          | Critères d'acceptation                                 | Test d'abord                                   | Dép.         | Déc. |
| ----- | --------------------------------- | ------------------------------------------------------ | ---------------------------------------------- | ------------ | ---- |
| P3-20 | Progression et seuils dans `core` | Statut (ok, proche, dépassé) pur et testé              | Table de cas aux bornes (79, 80, 100, 101 %)   | P1-50        | —    |
| P3-21 | Alerte à 80 %                     | Une notification par franchissement, pas de répétition | Intégration : deux dépenses → une seule alerte | P3-20, P3-70 | —    |

### Epic 3.4 — Tâches de fond

| ID    | Résultat                            | Critères d'acceptation                            | Test d'abord                                         | Dép.  | Déc. |
| ----- | ----------------------------------- | ------------------------------------------------- | ---------------------------------------------------- | ----- | ---- |
| P3-30 | `apps/worker` (conteneur) + pg-boss | Une tâche témoin planifiée et exécutée            | Intégration : tâche mise en file → exécutée une fois | P1-10 | D-18 |
| P3-31 | Registre de tâches                  | Idempotence, reprises avec délai, file des échecs | Test : double livraison → un seul effet              | P3-30 | —    |

### Epic 3.5 — Récurrents

| ID    | Résultat                    | Critères d'acceptation                                        | Test d'abord                                                 | Dép.         | Déc. |
| ----- | --------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------ | ------------ | ---- |
| P3-40 | Règles récurrentes (CRUD)   | `recurring_rules` ; prochaine échéance calculée dans `core`   | Propriété : échéances mensuelles (29–31, février)            | P1-50        | —    |
| P3-41 | Matérialisation quotidienne | La tâche crée la transaction due, une seule fois              | Intégration : deux exécutions le même jour → une transaction | P3-40, P3-31 | —    |
| P3-42 | Suggestions détectées       | Récurrences repérées dans l'historique, à accepter ou ignorer | Jeu du dataplan Seul → suggestions attendues                 | P3-40        | —    |

### Epic 3.6 — Calendrier et prévision

| ID    | Résultat                | Critères d'acceptation                                        | Test d'abord                                      | Dép.         | Déc. |
| ----- | ----------------------- | ------------------------------------------------------------- | ------------------------------------------------- | ------------ | ---- |
| P3-50 | Solde prévu dans `core` | Calcul à partir des récurrents et des transactions planifiées | Cas du dataplan : solde prévu = valeur de la démo | P3-40        | —    |
| P3-51 | Écran Calendrier        | Échéances et solde prévu par jour                             | E2E : échéance visible à la bonne date            | P3-50, P2-14 | —    |

### Epic 3.7 — Objectifs

| ID    | Résultat               | Critères d'acceptation                                  | Test d'abord                          | Dép.         | Déc. |
| ----- | ---------------------- | ------------------------------------------------------- | ------------------------------------- | ------------ | ---- |
| P3-60 | Objectifs + versements | `goals`, `goal_contributions` ; progression dans `core` | Intégration : versement → progression | P1-32        | —    |
| P3-61 | Écran Objectifs        | Création, versement, objectif atteint                   | E2E du parcours                       | P3-60, P2-14 | —    |

### Epic 3.8 — Notifications

| ID    | Résultat                                         | Critères d'acceptation                                       | Test d'abord                                                         | Dép.         | Déc. |
| ----- | ------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------------------- | ------------ | ---- |
| P3-70 | Notifications in-app                             | Table + boîte d'envoi (outbox) ; cloche, lu / non lu         | Intégration : événement → notification du bon destinataire seulement | P3-31        | —    |
| P3-71 | Préférences par type                             | Un type désactivé n'émet rien                                | Intégration : préférence coupée → 0 notification                     | P3-70        | —    |
| P3-72 | Canaux : in-app (source de vérité) + e-mail SMTP | Adaptateurs par canal ; lien de désinscription pour l'e-mail | Canal factice : contenu et destinataire attendus                     | P3-71, P1-11 | D-30 |

### Epic 3.9 — Justificatifs

| ID    | Résultat                            | Critères d'acceptation                                                                                       | Test d'abord                                 | Dép.         | Déc. |
| ----- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------- | ------------ | ---- |
| P3-80 | `StorageProvider`                   | Disque local par défaut, S3-compatible en option (profil MinIO) ; limites de taille et de type ; EXIF retiré | Contrat commun exécuté sur chaque adaptateur | —            | D-19 |
| P3-81 | Joindre un ticket à une transaction | URL signée ; inaccessible à un autre utilisateur                                                             | Test négatif d'accès                         | P3-80, P3-01 | —    |
| P3-82 | Détection de ticket en double       | Même empreinte → avertissement                                                                               | Intégration : double envoi                   | P3-81        | —    |

### Epic 3.10 — Recherche, activité, compte

| ID    | Résultat                                  | Critères d'acceptation                                      | Test d'abord                                                    | Dép.         | Déc. |
| ----- | ----------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------- | ------------ | ---- |
| P3-90 | Recherche + palette de commandes          | Recherche bornée par l'acteur ; récents                     | Test négatif d'isolation                                        | P1-32        | —    |
| P3-91 | Journal d'activité                        | Qui a fait quoi ; sert aussi d'audit                        | Intégration : action → entrée                                   | P1-32        | —    |
| P3-95 | Assistant de première ouverture           | Type de profil, langue, devise, premier compte              | E2E du parcours                                                 | P1-22, P2-30 | D-05 |
| P3-96 | Export complet des données (RGPD art. 20) | Archive téléchargeable, tâche asynchrone                    | Intégration : l'archive ne contient que les données de l'acteur | P3-31        | —    |
| P3-97 | Suppression de compte (art. 17)           | Purge différée, identité d'auth supprimée                   | Intégration : après purge, 0 ligne restante                     | P3-96        | —    |
| P3-98 | Données de démo « Seul » + invariants     | Commande `seed:demo seul` ; invariants du dataplan en tests | Les tests d'invariants                                          | P3-60, P3-40 | D-22 |

---

## Phase 4 — Foyer et colocation

### Epic 4.1 — Foyer

| ID    | Résultat                              | Critères d'acceptation                                             | Test d'abord                             | Dép.         | Déc. |
| ----- | ------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------- | ------------ | ---- |
| P4-01 | Créer un foyer                        | `households`, `household_members(role)` ; un foyer par utilisateur | Intégration : second foyer refusé        | P1-31        | D-16 |
| P4-02 | Invitation par e-mail + acceptation   | Jeton expirant ; texte de consentement explicite enregistré        | Test : jeton expiré ou réutilisé → refus | P4-01, P3-72 | —    |
| P4-03 | Retirer un membre                     | Ses données restent les siennes ; les accès croisés tombent        | Test négatif après retrait               | P4-02        | —    |
| P4-04 | Visibilité co-parent en lecture seule | Paramètre `member=` ; écriture refusée                             | Matrice : lecture OK, écriture 403       | P4-02        | D-28 |
| P4-05 | Matrice d'accès foyer complète        | Chaque case parent / co-parent / colocataire a un test négatif     | Les tests de la matrice                  | P4-04        | —    |

### Epic 4.2 — Pot commun et colocation

| ID    | Résultat                      | Critères d'acceptation                                                             | Test d'abord                                              | Dép.         | Déc. |
| ----- | ----------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------ | ---- |
| P4-10 | Moteur de partage dans `core` | Égal, prorata, règle du reste (le payeur garde le reste)                           | Propriété : somme des parts = total, au centime           | P1-50        | —    |
| P4-11 | Pot commun                    | `shared_ledgers` + lignes (dépôt, dépense, règlement) ; solde calculé côté serveur | Intégration : jeu du dataplan Parent → soldes de la démo  | P4-10, P4-01 | —    |
| P4-12 | « Marquer comme réglé »       | Crée un transfert lié qui ne compte pas en dépense                                 | Intégration : dépenses du mois inchangées après règlement | P4-11        | —    |
| P4-13 | Contacts sans compte          | Colocataire sans connexion, présent dans les partages                              | Intégration : partage à 3 dont 1 contact                  | P4-11        | —    |
| P4-14 | Écran Colocation              | Qui doit quoi à qui ; règlement                                                    | E2E du parcours Seul                                      | P4-13, P2-14 | —    |
| P4-15 | Écran Compte commun           | Dépôts, factures, avances, solde                                                   | E2E du parcours Parent                                    | P4-12, P2-14 | —    |

### Epic 4.3 — Budgets et vues foyer

| ID    | Résultat                                       | Critères d'acceptation                   | Test d'abord                                     | Dép.         | Déc. |
| ----- | ---------------------------------------------- | ---------------------------------------- | ------------------------------------------------ | ------------ | ---- |
| P4-20 | Budgets de portée foyer                        | `scope` personnel / foyer                | Intégration : dépense d'un membre → budget foyer | P4-01, P3-20 | —    |
| P4-21 | Filtres par membre (tableau de bord, rapports) | Tous = Moi + co-parent + Foyer           | Test d'invariant du dataplan                     | P4-04        | —    |
| P4-30 | Données de démo « Parent » + invariants        | `seed:demo parent` + invariants en tests | Les tests d'invariants                           | P4-15, P4-21 | D-22 |

---

## Phase 5 — App enfant

### Epic 5.1 — Comptes enfant

| ID    | Résultat                                | Critères d'acceptation                                                                        | Test d'abord                                           | Dép.         | Déc.       |
| ----- | --------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------ | ---------- |
| P5-01 | Le parent crée un compte enfant         | Sans e-mail enfant, avec tranche d'âge ; création atomique (identité + membre + portefeuille) | Intégration : échec partiel → rien de créé             | P4-01, P1-22 | D-02, D-21 |
| P5-02 | Le parent réinitialise le mot de passe  | Journalisé ; sessions de l'enfant révoquées                                                   | Test : ancienne session refusée                        | P5-01        | —          |
| P5-03 | Rôle enfant restreint                   | L'enfant ne voit que ses données ; aucune route adulte accessible                             | Matrice négative sur toutes les routes                 | P5-01        | D-21       |
| P5-04 | Registre des consentements + effacement | Consentement parental horodaté et versionné ; effacement par le parent ; aucun traceur        | Intégration : création d'enfant → consentement présent | P5-01        | D-21       |

### Epic 5.2 — Argent de poche

| ID    | Résultat              | Critères d'acceptation                                           | Test d'abord                                      | Dép.         | Déc. |
| ----- | --------------------- | ---------------------------------------------------------------- | ------------------------------------------------- | ------------ | ---- |
| P5-10 | Versement manuel      | Deux lignes liées par `transferGroupId`, une transaction de base | Intégration : échec d'une ligne → aucune des deux | P5-01        | —    |
| P5-11 | Versement automatique | Règle hebdomadaire ou mensuelle, exécutée une fois               | Intégration : double exécution → un versement     | P5-10, P3-41 | —    |

### Epic 5.3 — Demandes

| ID    | Résultat                                 | Critères d'acceptation                                                       | Test d'abord                                         | Dép.                | Déc. |
| ----- | ---------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------- | ---- |
| P5-20 | Machine à états des demandes dans `core` | En attente → approuvée / refusée / annulée ; transitions interdites rejetées | Table des transitions                                | —                   | —    |
| P5-21 | Demande d'argent enfant → parent         | Création, modification en attente, fil de commentaires                       | Intégration + test négatif (autre foyer)             | P5-20, P5-03        | —    |
| P5-22 | File de revue parent                     | Approuver crée le transfert ; notification à l'enfant                        | Intégration : approbation → transfert + notification | P5-21, P5-10, P3-70 | —    |

### Epic 5.4 — Règles « signaler, jamais bloquer »

| ID    | Résultat                     | Critères d'acceptation                                                                                      | Test d'abord                                          | Dép.         | Déc. |
| ----- | ---------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------ | ---- |
| P5-30 | Moteur de règles dans `core` | Plafond par dépense, catégories surveillées, limites par catégorie, portefeuille négatif ; ne bloque jamais | Propriété : aucune règle ne rejette une écriture      | P1-50        | —    |
| P5-31 | Signalements                 | Dépense signalée visible par l'enfant et dans la file du parent                                             | Intégration : dépense hors règle → signalement ouvert | P5-30, P5-03 | —    |
| P5-32 | Correction par le parent     | Historique avec auteur ; visible par l'enfant ; l'enfant ne peut plus modifier la ligne                     | Intégration : correction → révision + refus d'édition | P5-31        | —    |

### Epic 5.5 — Application enfant

| ID    | Résultat                            | Critères d'acceptation                                                                                | Test d'abord                             | Dép.         | Déc.       |
| ----- | ----------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------ | ---------- |
| P5-40 | `apps/kid` (PWA installable, coque) | Connexion enfant, manifeste, coque du design system web, thème enfant                                 | E2E 390 px : connexion → accueil         | P2-15, P5-03 | D-06, D-17 |
| P5-41 | `packages/api-client`               | Client typé généré depuis l'OpenAPI (REST `/api/v1`, schémas Zod) ; rupture de contrat détectée en CI | Test de contrat                          | P5-03        | D-31       |
| P5-42 | Écran Accueil                       | Solde, limites, demandes                                                                              | E2E + axe                                | P5-40, P5-41 | —          |
| P5-43 | Écran Ajouter + photo du ticket     | Dépense saisie en moins de 3 actions                                                                  | E2E + axe                                | P5-42, P3-81 | —          |
| P5-44 | Écran Objectifs (tirelire)          | Objectif avec date ; visible par le parent                                                            | E2E + test d'accès parent                | P5-42, P3-60 | —          |
| P5-45 | Écran Notifications                 | Événements enfant (approbation, signalement, argent de poche)                                         | E2E                                      | P5-42, P5-22 | —          |
| P5-46 | Textes adaptés à l'âge              | Espaces de noms i18n par tranche d'âge ; repli sur le texte standard                                  | Test : tranche d'âge → variante attendue | P5-42        | D-23       |
| P5-47 | Hors-ligne (service worker PWA)     | Saisie mise en file et rejouée ; bandeau « Tu es hors ligne »                                         | E2E réseau coupé puis rétabli            | P5-43        | D-06       |
| P5-48 | Push web (hors 1.0)                 | Hors des notifications 1.0 (in-app + e-mail) ; abonnement, envoi, désabonnement                       | Canal factice                            | P5-45        | D-30       |

### Epic 5.6 — Vues famille

| ID    | Résultat                                               | Critères d'acceptation                   | Test d'abord                          | Dép.         | Déc. |
| ----- | ------------------------------------------------------ | ---------------------------------------- | ------------------------------------- | ------------ | ---- |
| P5-50 | « Le mois des enfants » + section enfants des rapports | Agrégats bornés au foyer                 | Invariant : total = somme des enfants | P5-31, P4-21 | —    |
| P5-51 | Données de démo « Enfant » + invariants                | `seed:demo enfant` + invariants en tests | Les tests d'invariants                | P5-45, P5-50 | D-22 |

---

## Phase 6 — Intégrations

Hors 1.0 (D-09, D-20) : synchro bancaire (P6-10 à P6-13), patrimoine, dettes, impôts (P6-30 à P6-32), OCR (P6-41), app Expo native (P6-60 à P6-62). Dans la 1.0 : import de fichiers (P6-01, P6-02) et OpenAPI (P6-50). Les autres tâches ne figurent pas dans D-39 et ne bloquent pas la 1.0.

| ID    | Résultat                                                             | Critères d'acceptation                                                    | Test d'abord                                         | Dép.         | Déc.            |
| ----- | -------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------- | ------------ | --------------- |
| P6-01 | Import OFX / QIF                                                     | Analyseurs purs dans `core`                                               | Fichiers témoins → transactions attendues            | P3-02        | —               |
| P6-02 | Préréglages CSV de banques + écran de correspondance                 | Un préréglage par PR                                                      | Fichier témoin par banque                            | P6-01        | —               |
| P6-10 | Interface `BankProvider` + fournisseur factice (conçue après la 1.0) | Synchronisation de bout en bout sur le factice                            | Contrat du fournisseur                               | P3-31, P3-02 | D-20            |
| P6-11 | Jetons bancaires chiffrés                                            | Chiffrement par enveloppe ; clé hors base                                 | Test : la base ne contient aucun jeton en clair      | P6-10        | D-20            |
| P6-12 | Premier agrégateur réel                                              | Bac à sable du fournisseur ; clé fournie par l'auto-hébergeur             | Contrat exécuté sur le bac à sable                   | P6-11        | D-20            |
| P6-13 | Expiration du consentement                                           | Rappel avant 90 jours ; bandeau de reconnexion                            | Intégration : consentement à J-7 → notification      | P6-12, P3-70 | D-20            |
| P6-20 | Anomalies                                                            | Hausse d'un récurrent, doublon, montant inhabituel                        | Jeu du dataplan → anomalies de la démo               | P3-41        | D-09            |
| P6-21 | Suggestions de budget                                                | Règles sur l'historique                                                   | Jeu témoin → suggestions attendues                   | P3-20        | D-09            |
| P6-30 | Patrimoine                                                           | Instantané mensuel                                                        | Intégration : tâche → instantané                     | P3-31        | D-09 (hors 1.0) |
| P6-31 | Dettes                                                               | Échéancier dans `core`                                                    | Propriété : somme des échéances = capital + intérêts | P1-50        | D-09 (hors 1.0) |
| P6-32 | Estimation d'impôt (indicative)                                      | Mention « indicatif » partout                                             | Cas de la démo (3 parts)                             | P6-31        | D-09 (hors 1.0) |
| P6-40 | Rapports enregistrés + export PDF                                    | Portée par membre                                                         | Contrat de l'export                                  | P4-21        | D-09            |
| P6-41 | OCR des tickets                                                      | Derrière une interface, désactivé par défaut                              | Adaptateur factice                                   | P3-81        | D-19 (hors 1.0) |
| P6-50 | OpenAPI publié                                                       | REST `/api/v1`, généré depuis Zod ; différence de contrat contrôlée en CI | PR témoin cassant le contrat → rouge                 | P5-41        | D-31            |

### Epic 6.6 — App native Expo (après la 1.0)

Non requise pour la 1.0 (D-06 : PWA d'abord, D-09). À planifier après la phase 7.

| ID    | Résultat                             | Critères d'acceptation                                          | Test d'abord                        | Dép.         | Déc. |
| ----- | ------------------------------------ | --------------------------------------------------------------- | ----------------------------------- | ------------ | ---- |
| P6-60 | `apps/mobile` (Expo Router, coque)   | Connexion enfant, réutilise `packages/api-client` et les tokens | Test de contrat client ; fumée Expo | P5-41, P7-40 | D-06 |
| P6-61 | `packages/ui` complété pour le natif | Variantes natives des atomes utilisés par l'app enfant          | Tests de rendu natif par atome      | P6-60        | D-17 |
| P6-62 | Push natif                           | Canal ajouté derrière l'interface de notifications              | Canal factice                       | P6-60        | D-30 |

---

## Phase 7 — Auto-hébergement et release

### Epic 7.1 — Docker

| ID    | Résultat                               | Critères d'acceptation                                  | Test d'abord                                           | Dép.         | Déc.       |
| ----- | -------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------ | ------------ | ---------- |
| P7-01 | Image `web`                            | Multi-étapes, `standalone`, non-root, healthcheck       | Fumée CI : conteneur → `/readyz` OK                    | P1-41        | —          |
| P7-02 | Image `worker`                         | Même base, arrêt propre                                 | Fumée : tâche témoin exécutée dans le conteneur        | P3-30        | —          |
| P7-03 | `compose.yml` de production            | `docker compose up` sur machine vierge → app utilisable | E2E de fumée contre le compose en CI                   | P7-01, P7-02 | —          |
| P7-04 | Migrations au démarrage                | Commande d'initialisation dédiée ; idempotente          | Test : deux démarrages → pas d'erreur                  | P7-03        | —          |
| P7-05 | Sauvegarde et restauration             | Service `pg_dump` planifié ; guide de restauration      | CI : sauvegarde → restauration → invariants verts      | P7-03        | —          |
| P7-06 | Mise à niveau N-1 → N                  | Politique de compatibilité des migrations écrite        | CI : base de la version précédente → migration → fumée | P7-04        | —          |
| P7-07 | Profil compose Caddy (TLS automatique) | Profil optionnel + doc pour proxy existant              | Fumée HTTPS en local                                   | P7-03        | D-37       |
| P7-08 | Profils optionnels                     | MinIO (stockage S3), OpenTelemetry                      | Fumée par profil                                       | P7-03        | D-19, D-27 |

### Epic 7.2 — Chaîne de release

| ID    | Résultat                                 | Critères d'acceptation                              | Test d'abord                    | Dép.         | Déc. |
| ----- | ---------------------------------------- | --------------------------------------------------- | ------------------------------- | ------------ | ---- |
| P7-10 | Construction + analyse des images sur PR | Analyse de vulnérabilités ; échec sur gravité haute | PR témoin                       | P7-01        | —    |
| P7-11 | release-please                           | SemVer, CHANGELOG, release GitHub                   | Release d'essai `0.x`           | P0-14        | D-33 |
| P7-12 | Publication des images                   | Registre GHCR, amd64 + arm64, SBOM, signature       | Vérification de signature en CI | P7-11, P7-10 | —    |
| P7-13 | E2E nocturne                             | Parcours complets contre le compose                 | —                               | P7-03        | —    |

### Epic 7.3 — Revue de sécurité

| ID    | Résultat                                    | Critères d'acceptation                           | Test d'abord | Dép.  | Déc. |
| ----- | ------------------------------------------- | ------------------------------------------------ | ------------ | ----- | ---- |
| P7-20 | Modèle de menaces (STRIDE) famille / enfant | Document + un test par menace retenue            | Les tests    | P5-03 | —    |
| P7-21 | Revue ASVS L2                               | Liste de contrôle ; écarts transformés en issues | —            | P7-20 | —    |

### Epic 7.4 — Documentation

| ID    | Résultat                          | Critères d'acceptation                                                                                          | Test d'abord                                  | Dép.         | Déc. |
| ----- | --------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------ | ---- |
| P7-30 | Guide d'auto-hébergement          | Suivi à la lettre sur machine vierge par un tiers                                                               | Le guide est rejoué en CI (extraits exécutés) | P7-03        | —    |
| P7-31 | Référence de configuration        | Générée depuis le schéma d'environnement (P0-06)                                                                | Dérive doc / schéma → CI rouge                | P0-06        | —    |
| P7-32 | Site de documentation `apps/docs` | Site statique construit depuis `docs/` (Markdown jusqu'ici) ; liens vérifiés en CI                              | Vérif. de liens                               | P7-30        | D-35 |
| P7-33 | Guide utilisateur + captures      | FR + EN ; captures produites depuis les données de démo                                                         | —                                             | P5-51        | D-07 |
| P7-34 | Modèles RGPD pour auto-hébergeurs | Cartographie des données, modèle de politique de confidentialité, mention « n'est pas un avis juridique »       | —                                             | P3-97        | D-21 |
| P7-35 | Relecture juridique mineurs       | Relecture du socle mineurs (D-21) par un juriste, écarts traités                                                | —                                             | P5-04, P7-34 | D-21 |
| P7-40 | Release 1.0                       | Périmètre D-09 + revue ASVS L2 + WCAG 2.2 AA + seuils D-26 + test de restauration + relecture juridique mineurs | —                                             | tout         | D-39 |

---

## Phase 8 — Communauté

Quick wins communautaires avancés (D-38) : à faire dès la phase 0.

| ID       | Résultat                       | Critères d'acceptation                                                                          | Test d'abord                                           | Dép.  | Déc. |
| -------- | ------------------------------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----- | ---- |
| P8-01 QW | README d'accueil               | Démarrage en 5 commandes, captures, lien d'auto-hébergement                                     | Les commandes sont rejouées en CI                      | P1-11 | D-12 |
| P8-02 QW | `CONTRIBUTING.md`              | Prise en main < 10 min ; TDD, conventions de commit, flux de PR                                 | —                                                      | P0-35 | D-12 |
| P8-03 QW | `CODE_OF_CONDUCT.md`           | Contributor Covenant                                                                            | —                                                      | —     | —    |
| P8-04 QW | `SECURITY.md`                  | Canal de divulgation privé, versions supportées                                                 | —                                                      | —     | —    |
| P8-05 QW | Modèle de PR + `CODEOWNERS`    | Liste : tests, docs, i18n, a11y, migration                                                      | —                                                      | —     | —    |
| P8-06    | Devcontainer                   | Ouverture → tests verts sans réglage                                                            | Fumée CI du devcontainer                               | P1-11 | —    |
| P8-07    | DCO                            | `Signed-off-by` exigé, vérifié sur PR                                                           | PR témoin sans signature → rouge                       | —     | D-34 |
| P8-08    | Étiquettes et premières issues | `good first issue`, `help wanted` ; 10 issues prêtes                                            | —                                                      | P0-30 | —    |
| P8-09    | Flux de traduction             | Fichiers dans git, contributions par PR ; guide du traducteur (plateforme évaluée après la 1.0) | Test : catalogue incomplet → repli FR, pas de plantage | P2-32 | D-24 |
| P8-10    | Gouvernance                    | `GOVERNANCE.md`, `MAINTAINERS.md`, `SUPPORT.md`                                                 | —                                                      | —     | D-15 |
| P8-11    | Jeu d'évaluation des agents    | Quelques tâches de référence (route avec isolation, clé de traduction) rejouables               | Les tâches de référence                                | P0-21 | —    |

---

## Gains rapides (récapitulatif)

Aucune décision ne les bloque : P0-01, P0-02, P0-03, P0-04, P0-05, P0-06, P0-10, P0-11, P0-12, P0-13, P0-25, P0-27, P1-01, P1-06, P1-07, P1-41, P2-17, P8-03, P8-04, P8-05.
Libérés par les décisions : P1-15 (D-03), P8-01 et P8-02 (D-12).
