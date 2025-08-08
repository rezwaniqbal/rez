# Culture Fair III B Trainer (Static Web App)

Run locally in any modern browser. No backend. Built with HTML, CSS, JavaScript.

## Features
- Practice all major types: matrix reasoning, series, classification, analogies, number sequences
- Large set of mock questions via procedural generators (fresh each run)
- Immediate feedback with “explain like I’m 10” text and visual animations for rules
- Rule Learning Mode with interactive demos for: rotation, reflection, alternation, progression, add/remove, shading, numeric logic
- Exam Mode: configurable count and timer, score tracking, per-type breakdown
- Clean, modern, responsive UI with dark/light theme toggle

## How to Use
- Open `index.html` in your browser (or serve the folder)
- Practice: choose a type or Mixed, click “New Question”
- Rule Learning: select a rule to see animations and practice
- Exam Mode: set question count and time, then Start Exam

## Notes
- All items are original mock content generated on the fly to simulate Culture Fair patterns. Not affiliated with any test publisher.
- Works offline. No data is sent anywhere.

## Optional Local Server
If your browser blocks local file access, use a tiny local server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080/workspace/index.html
```
