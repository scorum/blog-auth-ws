# Scorum auth

Auth web service for Scorum

## Getting Started

```zsh
$ git clone git@github.com:scorum/blog-auth-ws.git .
```

```zsh
$ yarn
$ yarn start
OR
$ npm install
$ npm start
```

## What's in the package?

* `npm run` scripts.
* [`bluebird`][bluebird] featured promise library.
* [`eslint`][eslint] as JavaScript linter.
* [`prettier`][prettier] code formatting, configured to work with `eslint` out of the box.
* [`husky`][husky] for git hooks.
* [`koa-bodyparser`][koa-bodyparser] for parsing request bodies.
* [`koa-helmet`][koa-helmet] adds important security headers.
* [`koa-validate`][koa-validate] validate request params and format request params.
* [`koa2-cors`][cors] CORS middleware for cross-domain requests.
* [`dotenv-safe`][dotenv-safe] for environment variable management.
* [`winston`][winston] for logging.
* [`lodash`][lodash] utility library.
* [`mongoose`][mongoose] as elegant mongodb object modeling for node.js.

## `npm run` scripts

There are a few defined run scripts, here's a list of them with a description of what they do. To run them, simply execute `npm run <script name>` - e.g. `npm run lint`

* `start`: Used for simple start app.
* `test`: Runs tests
* `lint`: Lints

## Environment variables

Rename (or copy and rename) .env.example into .env

```
cp .env.example .env
```

The environment variables can be reached via dotenv package.

```
require('dotenv-safe').config({ allowEmptyValues: true, path: path.join(__dirname, '/.env') });
```

[bluebird]: https://github.com/petkaantonov/bluebird
[koa-router]: https://github.com/alexmingoia/koa-router
[koa-helmet]: https://github.com/venables/koa-helmet
[koa-validate]: https://github.com/RocksonZeta/koa-validate
[koa-bodyparser]: https://github.com/koajs/bodyparser
[eslint]: https://github.com/eslint/eslint
[prettier]: https://github.com/prettier/prettier
[husky]: https://github.com/typicode/husky
[cors]: https://github.com/koajs/cors
[dotenv-safe]: https://github.com/rolodato/dotenv-safe
[winston]: https://github.com/winstonjs/winston
[lodash]: https://github.com/lodash/lodash
[mongoose]: https://github.com/Automattic/mongoose
