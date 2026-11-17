# Configuration cible des agents (`.claude/`)

Cible décidée (D-10, D-11, D-26) ; elle est écrite dans `.claude/` par les tâches P0-20 à P0-30 de [`phases.md`](./phases.md), chacune validée par le propriétaire.

## Préférences du propriétaire

| Préférence                       | Application                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------------ |
| Français dans le chat            | Réponses en français ; identifiants de code en anglais                                     |
| Ne jamais décider seul           | Toute décision produit, architecture, schéma, dépendance, périmètre → `AskUserQuestion`    |
| Option recommandée en premier    | Première option de chaque question, libellée « (Recommandé) », avec la raison en une ligne |
| Pas de quiz                      | Aucune question de compréhension ; les questions servent à décider, jamais à évaluer       |
| Format TDAH (`i-have-adhd`)      | Prochaine action en tête, étapes numérotées, état rappelé, pas de digression               |
| Concision                        | Tableaux plutôt que prose, pas de récapitulatif de ce qui vient d'être lu                  |
| Édition et lecture chirurgicales | Lire la plage utile, modifier le minimum, ne pas reformater autour                         |

Emplacement (D-11) : ces préférences vivent dans le `CLAUDE.md` versionné ; pas de `CLAUDE.local.md`.

## Arborescence cible

```text
AGENTS.md                      règles projet, lisibles par tout outil
CLAUDE.md                      court, en anglais ; importe AGENTS.md ; préférences du propriétaire incluses ; voir CLAUDE.proposed.md
.mcp.json                      serveurs MCP du projet, sans secret
.claudeignore
.claude/
  settings.json                permissions, hooks, env
  settings.local.json          non suivi
  rules/                       règles courtes, portée par chemin
  agents/                      sous-agents ciblés
  skills/                      skills gardés + skills projet
  commands/                    commandes courtes
  hooks/                       scripts des hooks (bash portable)
docs/agents/                   README (sources de vérité), issue-tracker, triage-labels, domain
```

## Sous-agents

Les deux agents actuels (`test-engineer`, 951 lignes ; `ui-ux-designer`, 526 lignes) sont génériques (Jest, sans rapport avec la pile) : à retirer.

Règle commune : un sous-agent ne peut pas ouvrir de fenêtre de question. S'il rencontre une décision, il s'arrête et renvoie la question à l'agent principal, qui la pose via `AskUserQuestion`.

| Agent                   | Modèle | Rôle                                                                                | Outils                                                |
| ----------------------- | ------ | ----------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `explorer`              | haiku  | Recherche ciblée dans le code ; renvoie chemins et lignes, jamais de fichier entier | Read, Grep, Glob                                      |
| `architect`             | opus   | System design : options et compromis, brouillon d'ADR ; ne tranche pas              | Read, Grep, Glob, Write (`docs/decisions/` seulement) |
| `test-writer`           | sonnet | Écrit le test rouge d'une tâche (Vitest, intégration Postgres, Playwright)          | Read, Grep, Glob, Edit, Write, Bash (tests)           |
| `security-reviewer`     | opus   | Fuites entre comptes, autorisation, secrets, flux mineurs                           | Read, Grep, Glob                                      |
| `db-migration-reviewer` | sonnet | Migrations : destructif, verrouillage, compatibilité N-1                            | Read, Grep, Glob, Bash (`drizzle-kit check`)          |
| `ui-reviewer`           | sonnet | Conformité au design system atomique et aux tokens                                  | Read, Grep, Glob                                      |
| `a11y-reviewer`         | sonnet | WCAG 2.2 AA, clavier, contrastes ; app enfant                                       | Read, Grep, Glob, MCP Playwright                      |
| `i18n-reviewer`         | haiku  | Chaînes en dur, clés manquantes, typographie française                              | Read, Grep, Glob                                      |
| `docs-writer`           | sonnet | JSDoc, README, `docs/` dans la même PR que le code                                  | Read, Grep, Glob, Edit, Write                         |
| `release-manager`       | sonnet | Notes de version, liste de contrôle de release (phase 7)                            | Read, Grep, Glob, Bash (`gh`, lecture)                |

Chaque fichier d'agent : moins de 60 lignes, renvoie aux règles plutôt que de les recopier.

## Tri des skills

Constat : ~25 skills Matt Pocock (licence MIT, fichier présent) et ~45 skills BMAD (261 fichiers, aucun fichier de licence dans le dépôt). D-10 : garder 8 skills BMAD, retirer les autres, ajouter l'avis de licence BMAD (P0-24b). `i-have-adhd` est installé au niveau utilisateur, pas dans le dépôt.

### Existants

| Skill                                                                                                                                                                                                  | Action          | Raison                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `grilling`, `grill-me`, `grill-with-docs`                                                                                                                                                              | Garder, adapter | Cœur de la règle « interroger » ; à adapter pour passer par `AskUserQuestion` et le libellé « (Recommandé) »                                                                           |
| `tdd`                                                                                                                                                                                                  | Garder          | Exigence TDD                                                                                                                                                                           |
| `domain-modeling`                                                                                                                                                                                      | Garder          | Glossaire et ADR                                                                                                                                                                       |
| `codebase-design`, `improve-codebase-architecture`                                                                                                                                                     | Garder          | Soin du system design                                                                                                                                                                  |
| `to-spec`, `to-tickets`, `implement`, `implement-spec`                                                                                                                                                 | Garder          | Chaîne spec → tickets → code ; `to-tickets` produit les tranches de `phases.md`                                                                                                        |
| `triage`                                                                                                                                                                                               | Garder          | Déjà relié aux étiquettes de `docs/agents/`                                                                                                                                            |
| `code-review`, `pr`                                                                                                                                                                                    | Garder          | Revue selon normes et spec ; corps de PR                                                                                                                                               |
| `diagnosing-bugs`, `prototype`, `research`                                                                                                                                                             | Garder          | Usages distincts, sans doublon                                                                                                                                                         |
| `handoff`, `retro`                                                                                                                                                                                     | Garder          | Passage de relais entre sessions ; amélioration de l'environnement des agents                                                                                                          |
| `wayfinder`                                                                                                                                                                                            | Garder          | Sert à dérouler `phases.md` ticket par ticket                                                                                                                                          |
| `writing-for-agents`                                                                                                                                                                                   | Garder          | Écriture des règles et des skills                                                                                                                                                      |
| `wizard`                                                                                                                                                                                               | Garder          | Étapes que seul un humain peut faire (secrets, DNS)                                                                                                                                    |
| `ask-matt`                                                                                                                                                                                             | Garder          | Aiguillage entre skills                                                                                                                                                                |
| `frontend-design` (skill)                                                                                                                                                                              | Garder          | Un seul exemplaire ; la commande du même nom fait doublon                                                                                                                              |
| `to-questionnaire`                                                                                                                                                                                     | Retirer         | Remplacé par `AskUserQuestion` ; pas de tiers à interroger                                                                                                                             |
| `teach`                                                                                                                                                                                                | Retirer         | Lié au Learning Mode, supprimé                                                                                                                                                         |
| `wait-what`                                                                                                                                                                                            | Retirer         | Le format TDAH et la règle de concision couvrent le besoin                                                                                                                             |
| `setup-matt-pocock-skills`                                                                                                                                                                             | Retirer         | Configuration déjà faite (`docs/agents/`)                                                                                                                                              |
| `bmad-review-edge-case-hunter`, `bmad-create-prd`, `bmad-edit-prd`, `bmad-validate-prd`, `bmad-create-architecture`, `bmad-technical-research`, `bmad-advanced-elicitation`, `bmad-checkpoint-preview` | Garder (D-10)   | Apportent ce que la chaîne ci-dessus ne couvre pas : cas limites, PRD, architecture, recherche technique, élicitation, relecture guidée ; avis de licence BMAD à ajouter dans `NOTICE` |
| Tous les autres `bmad-*`                                                                                                                                                                               | Retirer (D-10)  | Doublon de la chaîne ci-dessus, poids                                                                                                                                                  |

### À ajouter

| Skill                      | Raison                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| `i-have-adhd`              | Demandé par le propriétaire ; vendu dans le dépôt, puisque les préférences sont versionnées (D-11) |
| `add-feature-slice`        | Remplace la commande `/feature` obsolète : types → base → service → route → écran, test d'abord    |
| `tenant-isolation-tests`   | Gabarit des tests négatifs d'accès pour toute nouvelle route                                       |
| `new-adr`                  | Gabarit et numérotation des ADR, mise à jour de l'index                                            |
| `drizzle-migration`        | Procédure de migration : générer, relire, jamais modifier une migration appliquée                  |
| `port-canvas-to-component` | Passer d'un canvas de démo à des composants du design system sans porter le code dupliqué          |
| `seed-demo-from-dataplan`  | Dataplan → graine + tests d'invariants                                                             |
| `fr-copy-review`           | Typographie et ton des textes français, textes enfant                                              |

## Commandes

| Commande           | Action                | Raison                                                                                                              |
| ------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `/sync`            | Garder, mettre à jour | Brief de session : branche, tâche en cours, décisions ouvertes                                                      |
| `/commit`, `/pr`   | Garder                | Conventional Commits ; `/pr` s'appuie sur le skill `pr`                                                             |
| `/component`       | Mettre à jour         | Doit cibler `packages/ui` et le niveau atomique                                                                     |
| `/migrate`         | Réécrire              | Aujourd'hui « base Neon en production » ; base locale seulement, sinon question                                     |
| `/seed`            | Mettre à jour         | Graines de démo par profil                                                                                          |
| `/feature`         | Retirer               | Obsolète (centimes, mauvais chemins) ; remplacée par `add-feature-slice`                                            |
| `/frontend-design` | Retirer               | Doublon du skill                                                                                                    |
| `/test`            | Ajouter               | Lance les tests concernés par les fichiers modifiés                                                                 |
| `/review`          | Ajouter               | Skill `code-review` + relecteurs sécurité, a11y, i18n selon les fichiers touchés                                    |
| `/adr`             | Ajouter               | Skill `new-adr`                                                                                                     |
| `/decide`          | Ajouter               | Pose toute nouvelle décision via `AskUserQuestion` et la consigne dans un ADR ; les D-01 à D-39 sont déjà tranchées |

## Règles (`.claude/rules/`)

Un fichier par règle, moins de 40 lignes, chargé selon les chemins touchés.

| Fichier            | Portée                                               | Contenu                                                                                                                                                                                                     |
| ------------------ | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ask-first.md`     | tout                                                 | Jamais de décision seul ; `AskUserQuestion`, 2 à 4 options, recommandée en premier « (Recommandé) », 4 questions au plus par fenêtre ; pas de quiz ; outil indisponible → s'arrêter et lister les questions |
| `surgical.md`      | tout                                                 | Lire la plage utile (Grep puis Read avec bornes) ; modifier le minimum ; pas de reformatage ni de renommage hors tâche ; pas de fichier créé sans besoin                                                    |
| `concise.md`       | tout                                                 | Résultat d'abord ; tableaux ; pas de récapitulatif ; chemins et lignes plutôt que du code recopié                                                                                                           |
| `tdd.md`           | `apps/**`, `packages/**`                             | Test rouge avant le code ; un test par critère d'acceptation ; noms avec les termes du glossaire                                                                                                            |
| `tenancy.md`       | `apps/**/api/**`, `**/services/**`, `packages/db/**` | Toute requête bornée par l'acteur (`userId`, foyer) ; passage par `authorize()` ; test négatif obligatoire                                                                                                  |
| `money.md`         | `packages/core/**`, `**/services/**`                 | Jamais de flottant ; type `Money` ; règle d'arrondi unique                                                                                                                                                  |
| `db.md`            | `packages/db/**`                                     | Demander avant tout changement de schéma ; migrations en avant seulement ; ne jamais modifier une migration appliquée                                                                                       |
| `secrets.md`       | tout                                                 | Aucun secret dans le code, les logs, les tests ou le chat ; ne pas lire `.env*`                                                                                                                             |
| `ui.md`            | `packages/ui/**`, `apps/**/*.tsx`                    | Niveaux atomiques ; tokens seulement ; états chargement, erreur, vide ; pas de style en ligne                                                                                                               |
| `i18n.md`          | `apps/**/*.tsx`, `packages/i18n/**`                  | Aucune chaîne en dur ; typographie française                                                                                                                                                                |
| `a11y.md`          | `**/*.tsx`                                           | WCAG 2.2 AA ; clavier ; libellés                                                                                                                                                                            |
| `kids.md`          | `apps/kid/**`, code des flux enfant                  | Mineurs : aucun traceur, données minimales, signaler sans jamais bloquer                                                                                                                                    |
| `docs.md`          | tout                                                 | L'agent écrit la doc dans la même PR ; lier plutôt que dupliquer ; ADR pour tout choix structurant                                                                                                          |
| `system-design.md` | tout                                                 | Avant un nouveau module : options, compromis, couture testable → question au propriétaire → ADR                                                                                                             |
| `deps.md`          | `**/package.json`                                    | Demander avant d'ajouter une dépendance ; jamais à la racine ; vérifier la doc à jour de la version installée                                                                                               |

## Hooks

Scripts dans `.claude/hooks/`, bash portable, sans chemin absolu.

| Événement                 | Hook             | Effet                                                                                                                                                                    |
| ------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| SessionStart              | `install.sh`     | Sessions cloud : active pnpm (corepack), installe les dépendances                                                                                                        |
| PreToolUse (Edit, Write)  | `guard-paths.sh` | Bloque `.env*`, migrations déjà appliquées, lockfile                                                                                                                     |
| PreToolUse (Edit, Write)  | `tdd-guard.sh`   | Refuse une édition de code source si aucun test associé n'a été modifié dans la session — hook `tdd-guard`, décidé en D-26 avec les seuils de couverture bloquants en CI |
| PreToolUse (Bash)         | `guard-bash.sh`  | Bloque les commandes destructives non couvertes par la liste `deny`                                                                                                      |
| PostToolUse (Edit, Write) | `format.sh`      | Prettier + ESLint `--fix` sur le fichier modifié seulement                                                                                                               |
| Stop                      | `verify.sh`      | Typecheck + tests des workspaces touchés ; échec → l'agent reprend                                                                                                       |

Le hook actuel (lint + typecheck avant `git commit`) fait doublon avec husky : à retirer.

## Permissions (`settings.json`)

Aujourd'hui : `Bash(git *)`, `Bash(pnpm *)`, `Bash(npx *)` autorisés sans limite, aucune liste `deny`.

| Niveau  | Entrées proposées                                                                                                                                                                                                                                                                                                                               |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `allow` | `Bash(pnpm lint*)`, `Bash(pnpm typecheck*)`, `Bash(pnpm test*)`, `Bash(pnpm build*)`, `Bash(pnpm --filter * test*)`, `Bash(pnpm --filter db generate)`, `Bash(git status*)`, `Bash(git diff*)`, `Bash(git log*)`, `Bash(git add *)`, `Bash(git commit *)`, `Bash(git fetch*)`, `Bash(git checkout -b *)`, `Bash(drizzle-kit check*)`            |
| `ask`   | `Bash(git push*)`, `Bash(pnpm add*)`, `Bash(pnpm --filter * add*)`, `Bash(pnpm --filter db migrate*)`, `Bash(gh pr merge*)`, `Bash(docker compose down*)`, `Bash(npx *)`                                                                                                                                                                        |
| `deny`  | `Read(.env*)`, `Edit(.env*)`, `Read(**/secrets/**)`, `Edit(packages/db/migrations/**)`, `Edit(pnpm-lock.yaml)`, `Bash(rm -rf *)`, `Bash(git push --force*)`, `Bash(git push -f*)`, `Bash(git reset --hard*)`, `Bash(git clean *)`, `Bash(git commit --no-verify*)`, `Bash(drizzle-kit push*)`, `Bash(drizzle-kit drop*)`, `Bash(curl * \| sh*)` |

`settings.local.json` sort de git (P0-03).

## MCP (`.mcp.json`)

| Serveur                  | Usage                                  | Remarque                                                 |
| ------------------------ | -------------------------------------- | -------------------------------------------------------- |
| Context7                 | Doc à jour des frameworks              | Déjà exigé par le `CLAUDE.md` actuel, mais non configuré |
| GitHub                   | Issues, PR, étiquettes de tri          | Jeton hors dépôt                                         |
| Playwright               | Débogage E2E, relecture a11y           | Local seulement                                          |
| Postgres (lecture seule) | Inspection de la base de développement | Jamais une base de production                            |

La liste est à valider (P0-28). Aucun secret dans `.mcp.json` : variables d'environnement seulement.

## `.claudeignore`

Ajouter : `node_modules/`, `.turbo/`, `.next/`, `dist/`, `coverage/`, `pnpm-lock.yaml`, `.vercel/`, `playwright-report/`, `docs/archive/`.
Retirer la référence à `graphify-out/` (absent du dépôt).

## Ordre de mise en place

| Étape | Tâche                                        | Décision requise       |
| ----- | -------------------------------------------- | ---------------------- |
| 1     | Valider `CLAUDE.proposed.md`                 | D-11, D-12 (tranchées) |
| 2     | Permissions, hooks de garde, `.claudeignore` | —                      |
| 3     | Règles                                       | —                      |
| 4     | Tri des skills + licence BMAD                | D-10 (tranchée)        |
| 5     | Sous-agents et commandes                     | —                      |
| 6     | Hook `tdd-guard`                             | D-26 (tranchée)        |
| 7     | MCP                                          | validation de la liste |
