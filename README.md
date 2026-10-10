# GPN CALC

A mobile-friendly engineering calculator for mechanical engineering study and quick estimates.

## Features

- Scientific calculator with degrees, radians, gradians, memory, history, graphing, and a notebook.
- Mechanical, thermal, and fluid engineering formula helpers.
- Unit conversion, constants, steam-table interpolation, and linear-system solving.
- Installable progressive web app with an offline cache.

## Use it

Open the site in a modern browser. To install it on a phone, use the browser's install option when available. The calculator can also be hosted from GitHub Pages: enable Pages for the `main` branch and repository root.

The app caches its HTML, styles, scripts, manifest, and icons for offline use after the first successful load. The external web font may not be available offline; system fonts are used as a fallback.

## Voice input

The microphone supports the selected English (India/Hinglish), Hindi, Marathi, or Gujarati recognition locale when the browser speech service supports it. Spoken equations are converted to calculator notation and shown in an editable review dialog before they are inserted; they are never evaluated automatically. Recognition quality depends on the browser, device, language model, and network. Browser speech recognition may send audio to the browser provider for processing, and voice input may not work offline.

## Checks

Run the built-in test suite with Node.js 20 or newer:

```sh
npm test
```

Tests cover scientific notation and expression parsing, invalid expressions, and representative engineering formula defaults. Formula results are educational estimates: confirm design-critical calculations, assumptions, and applicable standards independently.
