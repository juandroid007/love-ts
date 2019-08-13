<div align="center">
  <h1>LOVE TS</h1>
  <p>A command line tool to manage and release LÖVE 2D TypeScript projects.</p>
  <img src="https://i.imgur.com/IGcxwif.gif" />
</div>

Requires [LÖVE 2D](https://love2d.org/), NPM (installed via [Node.js](https://nodejs.org/)) and [Yarn](https://yarnpkg.com/).

`love`, `npm` and `yarn` should all be executable within a console.

LOVE TS is available via NPMJS.

```
yarn global add love-ts
```

Upon installation `love-ts` should now be available via the CLI.

```
love-ts help
```

## Features

- One command to start a project. (`love-ts start` or `love-ts .`)
  - Errors are traced back to their original TypeScript source files.
- One command to start, watch and dynamically update a running LÖVE 2D project with updating TypeScript code. (`love-ts watch`)
- Can initialize a skeleton project within a directory. (`love-ts init`)
  - Can initialize an even smaller project with typing information only. (`love-ts init --typings`)
- One command to bundle output Lua files, resources and even _dependencies_ into an output _.love_ file. (`love-ts release`)
  - Can package projects as libraries for other projects. (`love-ts release --library`)
- Lua libraries can be installed to _node\_modules_ from GitHub and immediately be used in the project.
- Can type-check and run projects without installing their dependencies.

## Creating a Project

```sh
love-ts init
love-ts init --typings
```

## Running a Project

```sh
love-ts start
love-ts .
love-ts /path/to/project
```

## Watching a Project

```sh
love-ts watch
```

## Releasing a Project

```sh
love-ts release
love-ts release --library
```

## Resources

Resource files should be placed into the _res/_ folder.

```diff
  res/
+   image.png
  src/
    main.ts
```

**main.ts**

```ts
love.graphics.newImage("res/image.png");
```
