<div align="center">
  <h1>LOVE TS</h1>
  <p>A command line tool to manage and release LÖVE 2D TypeScript projects.</p>
  <img src="https://i.imgur.com/IGcxwif.gif" />
</div>

**This project is a Work In Progress**

It is available for download via NPM.

```
yarn global add love-ts
```

LÖVE 2D must be available via the command line (`lovec`) for _love-ts_ to run correctly.

## Commands

### `love-ts init`

Initializes project files within the current directory. Must be run inside an empty directory.

Once complete, use `love-ts` to run the project.

### `love-ts`

Runs a project.

Errors are traced back to the source original _.ts_ files where the code failed.

### `love-ts watch`

Runs the project updating as changes are made.

### `love-ts release`

Creates a _.love_ file with all the compiled game files.

- Copies all resources under _res/_
- Copies all dependencies listed in _package.json_ under _node\_modules_

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
