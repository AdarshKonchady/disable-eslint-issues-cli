This package can be used to disable all existing errors and warnings in your project by adding a comment to disable them.

- Motivation:
  You might have an existing project which has a lot of errors or/and warnings but you do not want these errors, warnings to increase further. Use this package to comment all existing occurences and put in ESLint rule henceforth to detect all bad code.

- Usage:

```
npx disable-eslint-issues-cli <directory_path>
```

Example:

```
npx disable-eslint-issues-cli src/**/*.js
```
