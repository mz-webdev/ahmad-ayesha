# Ayesha & Hamza Digital Wedding Invitation

A self-contained, responsive, config-driven wedding invitation built with vanilla HTML, CSS and JavaScript.

## Run locally

Open `index.html` directly in a modern browser, or serve the folder with any static server:

```bash
npx serve .
```

The site uses relative paths, so it also works on Netlify, Vercel or GitHub Pages without a build step.

## Edit all content

Change one file: `js/config.js`. Update `INVITATION_CONFIG` fields including:

- Couple and family names
- City and ISO wedding date
- `events` for Nikah, Baraat and Walima
- `programme` timelines
- `story` timeline
- `gallery`
- `guestInfo`
- Quran verse text
- WhatsApp number and RSVP messages
- Theme colors
- English and Urdu language strings

Do not change HTML to customise invitation copy. Date and time values must remain valid ISO 8601 strings, for example `2027-02-18T18:30:00+05:00`.

## Replace images

Place final WebP/JPG images in `assets/images/`. Recommended proportions:

- `hero.jpg`: 900 × 1400
- Event cards: 900 × 1200
- Gallery: 900 × 1200
- `texture-marble.jpg`: 1200 × 800

Update their paths in `js/config.js` and `index.html` hero fallback/preview. SVG demo placeholders are included and are valid browser image fallbacks. Set `loading="lazy"` and widths/heights are applied globally.

## Replace music

Replace:

- `assets/audio/music.mp3`
- `assets/audio/tap.mp3`

with licensed MP3 files. Keep names or update `musicFile` and `tapSoundFile` in `js/config.js`.

## Personalize guest links

Add a guest name to the URL:

```text
https://your-domain.com/?guest=Ahmed%20Family
```

The splash shows “Dear Ahmed Family” and the guest name is prefilled in RSVP.

## WhatsApp RSVP

Set `whatsapp.number` to digits only, including country code (for example `923001234567`). The yes/no buttons open WhatsApp with a prefilled response and optional guest count.

## Deploy

### Netlify

Drag the folder to Netlify Drop or create a site from your Git repository. Publish directory: `.`. Build command: none.

### Vercel

Import the repository and choose a static project. Framework preset: Other. Build command: none. Output directory: `.`.

### GitHub Pages

Push the project to a repository, open Settings → Pages, select the branch and `/ (root)`, then save. Use the exact repository URL for the canonical and social meta tags.

## QA checklist

- [ ] Test at 320, 360, 390, 768, 1024 and 1440 px widths.
- [ ] Verify no horizontal overflow.
- [ ] Open the splash and test 3D doors, sound and music.
- [ ] Verify countdown reaches the married state after the target date.
- [ ] Test all programme and venue tabs.
- [ ] Open every gallery image and test keyboard arrows, close and swipe.
- [ ] Download `.ics` files for all events and import one calendar entry.
- [ ] Submit RSVP as a yes and no, then test the WhatsApp URL.
- [ ] Switch to Urdu and verify RTL layout, text direction and localStorage persistence.
- [ ] Enable “reduce motion” and verify petals/parallax/transitions are reduced.
- [ ] Check keyboard focus, labels and the skip link.
- [ ] Replace placeholder images, MP3 files and metadata URLs before production.
