# Svelte-5 Frontend

Rebuild of the UI in `/frontend` using sveltekit along with svelte 5, and the shadcn UI library.
Unlike the SPA nature of the original UI, this version aims to offer a more traditional per page get/save, allowing the user to choose to save multiple changes at once or back out of the page even. An additional feature, besides the less claustorphobic layout, is that event exports will have error checking before and after the api call.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

Followed by

```bash
node build
```

To run it.