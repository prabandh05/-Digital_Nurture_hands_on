# JavaScript Exercises - Local Community Event Portal

Open `index.html` through a local web server so `fetch("data/events.json")` can load the mock API file.

## Exercise Coverage

1. `index.html` uses `<script src="main.js"></script>`, logs a welcome message, and shows an alert on load.
2. `main.js` uses `const`, `let`, template literals, and seat decrement/increment.
3. It hides past/full events, loops with `forEach()`, and wraps registration in `try-catch`.
4. It defines `addEvent()`, `registerUser()`, `filterEventsByCategory()`, a category registration closure, and callback-based filtering.
5. `PortalEvent` models events, uses `checkAvailability()` on the prototype, and prints `Object.entries()`.
6. The event array uses `push()`, `filter()`, and `map()`.
7. Event cards are rendered with `querySelector()`, `createElement()`, and dynamic UI updates.
8. Register buttons use `onclick`, category uses `onchange`, and search uses `keydown`.
9. Mock event loading uses `fetch`, `.then()`, `.catch()`, `async/await`, and a loading spinner.
10. Modern JS features include default parameters, destructuring, and spread cloning.
11. The registration form uses `form.elements`, `preventDefault()`, validation, and inline errors.
12. Registration POST uses `fetch()` with a delayed `setTimeout()` fallback mock response.
13. Debugging notes are included in the page and console logs show submission steps and payloads.
14. jQuery handles `#registerBtn` click and uses `fadeIn()` / `fadeOut()`; the page notes a React/Vue benefit.

## Run Locally

From this folder:

```bash
python3 -m http.server 8000
```

Then open:

`http://localhost:8000`
