# Verisavo website

The connected intelligence layer for African markets.

## Files

| File | What it is |
|---|---|
| `index.html` | Homepage: the 3D market story, plus the About us, Research, Contact, Pricing and Careers pages |
| `assistant.html` | Platform page, with sign in and the Verisavo Intelligence Assistant window |
| `sound.js` | Sound engine shared by both pages (ambient score, clicks, keyboard sounds, mute toggle) |
| `home-music.mp3` | Homepage music: "Elsweyr Beat" (Joseph Beg), looped |
| `bg-music.mp3` | About us music: "I'm Yours" (Xack), remixed without drums and bass |

Keep all files in the same folder. Open `index.html` through a web server (for example `python3 -m http.server`) so the music and page links load.

## Not connected yet

- Sign in and sign up run in demo mode (`AUTH` in both pages).
- The Intelligence Assistant shows "Not connected yet" until `ASSISTANT.endpoint` is set in `assistant.html`.
- The contact form and early-access OTP need their endpoints set before anything is sent.
- The music tracks come from Epidemic Sound; check that your licence covers use on a website.
