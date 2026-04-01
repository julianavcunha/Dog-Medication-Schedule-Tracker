# Dog Medication Schedule Tracker

A small, single-page web app to help track a 15-day schedule of topical eye medications for a dog. It supports daily and full-program views, per-dose checkmarks with persistence, suggested times with 5-minute spacing between medications, and a print-friendly layout for caregivers.

## Features

- Fixed list of medications (Oflox, Nevanac, Azorga, Viofta) with doses and frequencies
- Two views:
  - **Hoje**: shows only today’s doses
  - **Programação completa**: shows the full 15-day schedule
- Per-dose checkmarks that are saved in the browser (localStorage)
- Suggested times for the first day with 5-minute gaps between medications
- Clean, print-optimized version of the full schedule

## Getting Started

This is a static site (HTML/CSS/JS only). You can run it locally or host it on GitHub Pages.

### Run locally

1. Clone or download this repository.
2. Open `index.html` directly in your browser.

No build step or dependencies are required.

### Deploy on GitHub Pages

1. Push this project to a GitHub repository.
2. In the repository settings, enable **GitHub Pages** and select the `main` (or `master`) branch as the source.
3. After a few minutes, your site will be available at the URL GitHub provides.

## Customization

You can adjust the medication list and schedule in `script.js`:

- The `MEDS` array controls names, dosage instructions, frequency labels, duration, doses per day, and the first-day start time.
- The `TOTAL_DAYS` constant controls how many days are shown in the full schedule.

Styling is defined in `style.css`. The layout is responsive and optimized for ~800px width and for printing.

## Browser Support & Data

- Works in any modern browser with JavaScript enabled.
- Checkmarks are stored in `localStorage` under the key `dog-med-tracker-v1`.
- Clearing browser storage or using a different browser/device will reset the checkmarks.

## License

You can use and adapt this project freely for personal use.
