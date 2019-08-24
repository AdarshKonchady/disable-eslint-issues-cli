# disable-eslint-issues-cli [![Build Status](https://travis-ci.org/akonchady/disable-eslint-issues-cli.svg?branch=master)](https://travis-ci.org/akonchady/disable-eslint-issues-cli)

This package can be used to disable all existing errors and warnings in your project by adding a comment to disable them.

## Motivation:

You might have an existing project which has a lot of errors or/and warnings but you do not want these errors, warnings to increase further. Use this package to comment all existing occurences and put in ESLint rule henceforth to detect all bad code.

## Usage:
This CLI is available on NPM and you can use it as mentioned below. 

```console
$ npx disable-eslint-issues-cli --help

disable-eslint-issues-cli [options] <paths>

Options:
  --help                 Show help                                     [boolean]
  --version              Show version number                           [boolean]
  --include-fixable, -f  Also disable auto-fixable ESLint rules.       [boolean]
```

### Example:

```console
$ npx disable-eslint-issues-cli src/**/*.js test/**/*.js
```
