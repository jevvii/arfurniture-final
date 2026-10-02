# Lucidchart AI Prompt — Project Structure Diagram

## Context
This diagram accompanies Section 4.2 (Project Structure) of the thesis. The documentation describes the structure as follows:

> "The project structure of the system is carefully designed to ensure an organized, efficient, and systematic development process. It consists of multiple interconnected components that work together to achieve the overall functionality of the application. Each part of the system is arranged in a logical manner, allowing for easier navigation, maintenance, and future improvements. The structure includes the user interface layer, application logic, data management components, and external integrations, all of which are developed to support seamless interaction and performance. By maintaining a well-defined project structure, the system ensures scalability, flexibility, and ease of debugging, enabling developers to efficiently manage and enhance the application over time."

---

## Prompt for Lucidchart AI

```
Create a Layered Project Structure Diagram for "AR-Fit: An Augmented Reality System for Accurate Furniture Sizing and Order Precision."

Style: Academic hierarchical block diagram. Clean, modern, and easy to read. Use rounded rectangles for layers, smaller rectangles for sub-components, and directional arrows showing interaction flow. Include a subtle color gradient per layer. No 3D effects.

Overall Layout: Four horizontal layers stacked vertically, top to bottom, with a vertical double-arrowed spine on the left labeled "Data Flow & Control."

---

[Layer 1 — Top — User Interface Layer — Color: Light Blue (#E0F2FE)]
Large rounded rectangle labeled "User Interface Layer"
  Sub-label: "React 19 + Vite + TypeScript SPA"
  Inside, arrange 4 small rounded rectangles side-by-side:
    - "Shop (Product Catalog)"
    - "Product Detail + AR View"
    - "Cart & Checkout"
    - "Admin Dashboard"
  A small label below them: "Responsive Web Browser (Desktop / Mobile)"

[Layer 2 — Application Logic Layer — Color: Light Green (#DCFCE7)]
Large rounded rectangle labeled "Application Logic Layer"
  Sub-label: "Express.js REST API + Business Rules"
  Inside, arrange 4 small rounded rectangles in a 2x2 grid:
    - "Authentication Service"
    - "Product & Variant Manager"
    - "Order Processing Engine"
    - "Real-Time Notification Service (SSE)"
  Small label below: "State: React Context API | Routing: React Router DOM"

[Layer 3 — Data Management Layer — Color: Light Orange (#FFEDD5)]
Large rounded rectangle labeled "Data Management Components"
  Sub-label: "Document Storage + Cloud File Storage"
  Inside, arrange 3 small rounded rectangles side-by-side:
    - "MongoDB Atlas"
      - Sub-items: users, products, orders, carts
    - "Supabase Storage"
      - Sub-items: 3D models (.glb), product images
    - "PostgreSQL (app_documents)"
      - Sub-item: JSONB document table

[Layer 4 — Bottom — External Integrations — Color: Light Purple (#F3E8FF)]
Large rounded rectangle labeled "External Integrations"
  Sub-label: "Third-party services & deployment"
  Inside, arrange 4 small rounded rectangles side-by-side:
    - "Nodemailer / SMTP"
      - Sub-item: Order confirmations & password resets
    - "Google Gemini AI"
      - Sub-item: Product assistant chat
    - "Vercel Hosting"
      - Sub-item: Edge delivery & serverless API
    - "Mobile AR Engine"
      - Sub-item: ARCore / ARKit / Scene Viewer

---

[Left Spine — Vertical double-arrow bar]
- A vertical bar with an upward arrow at the top and a downward arrow at the bottom
- Label: "Bidirectional Data Flow"
- Small annotations along the bar:
  - Between Layer 1 and 2: "REST API (JSON / HTTPS)"
  - Between Layer 2 and 3: "CRUD Queries / File URLs"
  - Between Layer 3 and 4: "SMTP / SDK / CDN"

[Right Side — Quality Attributes Badge]
- A vertical banner or sidebar with 4 badges/icons:
  - Scalability
  - Flexibility
  - Maintainability
  - Debuggability

---

Connections (draw arrows between layers):
- Layer 1 (UI)  —down arrow labeled "HTTP Requests"—>  Layer 2 (Logic)
- Layer 2 (Logic)  —down arrow labeled "Database Queries / Storage Calls"—>  Layer 3 (Data)
- Layer 3 (Data)  —up arrow labeled "Query Results / File URLs"—>  Layer 2 (Logic)
- Layer 2 (Logic)  —up arrow labeled "JSON Responses / SSE Events"—>  Layer 1 (UI)
- Layer 2 (Logic)  —down arrow labeled "SMTP / AI API / SDK Calls"—>  Layer 4 (External)
- Layer 4 (External)  —up arrow labeled "Email Delivery / AI Response / CDN Assets"—>  Layer 2 (Logic)

Include a legend at the bottom right:
- Light Blue = Presentation / User Interface
- Light Green = Application Logic / API
- Light Orange = Data Storage / Persistence
- Light Purple = External Services / Infrastructure
- Double-arrow line = Bidirectional interaction

Notes:
- Keep spacing generous so the diagram does not feel cramped.
- Use consistent font (Arial or Calibri), 12–14pt for layer titles, 10pt for sub-items.
- Ensure the diagram fits a standard A4 or letter page width (landscape orientation preferred).
```

---

## How to Use
1. Open **lucidchart.com** and create a new document.
2. Open **Lucidchart AI** (AI button or chat).
3. Paste the prompt above.
4. After generation, refine layer labels to match exact filenames from `docs/PROJECT_STRUCTURE.md`.
5. Add caption: **"Figure 4.2: Project Structure of AR-Fit System"** below the diagram.
6. Export as PNG or SVG for insertion into the thesis document.

---

*Prompt aligned with thesis Section 4.2 description and actual codebase structure.*
