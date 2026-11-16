// A package never imports an app (CLAUDE.md, "Layout and boundaries").
export const APPS = ['web', 'kid', 'worker'];

export const boundaries = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: APPS.flatMap((app) => [`@expense-tracker/${app}`, `@expense-tracker/${app}/*`]),
            message: 'A package must not import an app. Move the shared code into a package.',
          },
          {
            regex: '(^|/)apps/',
            message: 'A package must not import an app. Move the shared code into a package.',
          },
        ],
      },
    ],
  },
};
