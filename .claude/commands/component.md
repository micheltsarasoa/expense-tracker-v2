Add a shadcn/ui component to the web app. The component name is $ARGUMENTS.

Steps:
1. Verify the component exists in shadcn/ui by resolving the latest registry via Context7
2. Run: `pnpm --filter web dlx shadcn@latest add $ARGUMENTS`
3. The component lands in `apps/web/components/ui/` — do not move it
4. If the component introduces CSS variables, check that they are mapped to the Tailwind v4
   `@theme` block in `apps/web/app/globals.css` — add any missing tokens there
5. Report: what was added, what peer deps were installed, any manual token wiring done

Do not modify the generated component file unless the user explicitly asks.
