# InviteCraft — Premium Surprise Invitations

A frontend-only (no backend) studio for creating cinematic digital invitations for
weddings, engagements, birthdays, housewarmings, anniversaries and naming ceremonies.

## Run locally

```
npm install
npm run dev
```

Open http://localhost:5173 — the admin panel opens with a demo wedding (Priya & Rahul).

## Publish free on GitHub Pages

Live site: https://lvvnagendra.github.io/invitecraft/

After making changes, publish the update with:

```
npm run deploy
```

This builds the app and pushes `dist/` to the `gh-pages` branch, which GitHub Pages serves.
In the app, **Settings → Website address** must be the live URL so shared links point to it.

> Data (invitations, clients) is saved privately in the browser you create it in
> (IndexedDB). Use **Settings → Backup** to download / restore it.

## What guests experience

1. **Surprise envelope** — personalised “Dear Uncle Ramesh Garu”, golden wax seal, tap to open.
2. **Cinematic welcome** — portraits slide together, names in calligraphy, effects per occasion.
3. **Premium card** — gold borders, mandala, parents, families, date, muhurtham, venue.
4. **Event schedule** — Haldi, Sangeet, Reception…
5. **Live countdown** — days / hours / minutes / seconds.
6. **Photo gallery** — slideshow with zoom.
7. **Venue** — embedded map, View Location, Save the Date (Google / .ics), Send Wishes.
8. **RSVP** — attending + guest count, sent to the family on WhatsApp.
9. **Thank you** — fireworks finale, replay button.

Always available: music toggle, Skip animation, sticky action dock. English, Telugu & Hindi.

## How links work without a server

All invitation text is compressed (lz-string) into the URL fragment
`#/i/<data>?to=<guest name>`. Portrait photos are compressed to ~10 KB and can be
embedded too (Edit → Experience → photos in link). For very short links, paste photo
URLs instead of uploading. QR codes automatically leave out photos to stay scannable.

## Pages for your clients (no login needed)

| Page | Link | Use |
|---|---|---|
| Showcase & prices | `https://lvvnagendra.github.io/invitecraft/#/showcase` | Send to new enquiries: live demos, features, packages, FAQ |
| Client details form | `https://lvvnagendra.github.io/invitecraft/#/order` | Client fills names, date, venue, photos & package with live preview, then sends to you on WhatsApp |
| Live demos | `#/demo/wedding`, `#/demo/birthday`, `#/demo/housewarming`, `#/demo/engagement` | Open a sample like a guest would |

Use **Dashboard → Share with clients** to send these: the links there carry your business name,
WhatsApp number and package prices (set them in Settings first).
When the client sends the form, use **Import client details** and paste their WhatsApp message
(or choose the details file with photos). A draft invitation is created for you.

## Photos

- Photos you upload travel inside the share link. That's fine for portraits and a few gallery photos.
- For big galleries, turn on **Settings → Free photo hosting** (a GitHub token with
  "Contents: Read and write" on this repo). Photos are then stored in the repo's `media` branch and
  links stay short. The share page warns you when a link is too long for WhatsApp.
