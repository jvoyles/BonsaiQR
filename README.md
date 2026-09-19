# BonsaiQR

An interactive voxel bonsai that reveals a scannable QR code.

## Run locally

```sh
python3 -m http.server 4173 --directory dist
```

Open http://localhost:4173.

## Deploy

The site is static; publish the `dist` directory. No build command or backend is required.

Before hosting on another domain, update the share-link base URL in `dist/app.js` to your new site address.
