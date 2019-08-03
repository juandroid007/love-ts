# Love TS

Command line tool to manage LÖVE 2D TypeScript projects.

**Available via NPM**

```
npm install -g love-ts
```

## Commands

### `love-ts init`

Initializes project files within the current directory. Must be run inside an empty directory.

Once complete, use `love-ts` to run the project.

### `love-ts`

Runs a project.

### `love-ts watch`

Runs the project updating as changes are made.

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