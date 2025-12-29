
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

// Diagnostic: module initialization log (helps capture import/init ordering in production)
console.log('[main] module init', new Date().toISOString());

// Mount the React application
const rootEl = document.getElementById('root');
if (!rootEl) {
  console.error('[main] root element not found');
} else {
  const root = createRoot(rootEl);
  root.render(<App />);
}
