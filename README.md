# Verisavo website

The connected intelligence layer for African markets. Built with [Next.js](https://nextjs.org) (App Router) and React.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

Node.js 20 or newer is required.

## Pages

| Route | What it is |
|---|---|
| `/` | Homepage: the 3D market story in eight chapters. About us, Research, Contact, Pricing and Careers open over the scene at `/#about-us`, `/#research`, `/#contact`, `/#pricing` and `/#careers`. |
| `/platform` | Platform page: the question box, sign in and the Verisavo Intelligence Assistant window. |

`/about-us`, `/research`, `/contact`, `/pricing` and `/careers` redirect to the matching homepage page. The old file names `/index.html` and `/assistant.html` redirect to `/` and `/platform`.

## How the code is organised

```
app/
  layout.jsx              fonts and viewport, shared by both pages
  page.jsx  home.css      homepage route and its styles
  platform/
    page.jsx  platform.css
components/
  home/                   homepage markup as React components (Header, Menu, AboutUsPage, ResearchPage, dialogs, ...)
    HomeClient.jsx        starts the homepage behaviour in the browser
  platform/               Platform page markup (Header, Main, AssistantWindow, dialogs, ...)
    PlatformClient.jsx    starts the Platform page behaviour in the browser
lib/
  home/                   homepage behaviour: auth.js (early access, sign in), soon.js, scene.js (three.js market scene,
                          chapters, inner pages, research, highlights), header.js
  platform/               main.js (question box, sign in, menu, assistant), soon.js
  sound.js                sound engine shared by both pages (music, clicks, keyboard sounds, mute toggle)
public/
  home-music.mp3          homepage music: "Elsweyr Beat" (Joseph Beg), looped on a bar
  bg-music.mp3            About us music: "I'm Yours" (Xack), remixed without drums and bass
```

The components hold the markup. The page behaviour in `lib/` runs once in the browser after the page renders, started by `HomeClient` or `PlatformClient`. The 3D scene uses `three` 0.128 from npm.

Moving between `/` and `/platform` uses full page loads, so each page keeps only its own styles.

## Not connected yet

- **Sign in and sign up** run in demo mode. Set `AUTH` in `lib/home/auth.js` and `lib/platform/main.js` (`googleUrl`, `emailEndpoint`) and turn `demo` off.
- **Intelligence Assistant** answers show "Not connected yet" until `ASSISTANT.endpoint` is set in `lib/platform/main.js`.
- **Early access** runs in demo mode (code `123456`). Set `CONFIG.mode`, `CONFIG.api` and `CONFIG.whatsappNumber` in `lib/home/auth.js` and `lib/platform/main.js`.
- **Contact form**: set `CONTACT_ENDPOINT` in `lib/home/scene.js`. Until then nothing is sent.

## Music licence

Both tracks come from Epidemic Sound. Check that your licence covers use on a website, including the remixed version.
