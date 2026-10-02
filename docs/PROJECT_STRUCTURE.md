# AR-Fit Project Structure

> An Augmented Reality System for Accurate Furniture Sizing and Order Precision  
> **Stack:** React 19 + Vite + TypeScript | Express.js + MongoDB + Supabase | Vercel

```
ARfurniture-main/
│
├── public/                     # Static assets
│   └── products/
│       ├── 3dmodels/           # GLB 3D furniture models
│       └── images/             # Product thumbnail images
│
├── src/                        # Application source code
│   ├── pages/                  # Route-level page components
│   │   ├── Customer/           # Customer-facing views
│   │   │   ├── Shop.tsx                    # Product catalog & browsing
│   │   │   ├── ProductDetail.tsx           # Single product view with AR button
│   │   │   ├── ARView.tsx                  # Primary AR viewer (model-viewer + QR)
│   │   │   ├── ARViewer.tsx                # Alternative AR entry point
│   │   │   ├── Cart.tsx                    # Shopping cart & checkout flow
│   │   │   ├── Orders.tsx                  # Order history & tracking
│   │   │   ├── Profile.tsx                 # User profile & address management
│   │   │   └── About.tsx                   # About / contact page
│   │   └── Admin/              # Admin dashboard views
│   │       ├── Dashboard.tsx               # Analytics & KPI overview
│   │       ├── ProductManager.tsx          # CRUD for products & variants
│   │       ├── OrderManagement.tsx         # Order processing & status updates
│   │       ├── MarketingManager.tsx        # Banner & promotion management
│   │       ├── Settings.tsx                # Store settings & configuration
│   │       └── AdminLogin.tsx              # Admin authentication gate
│   │
│   ├── components/             # Reusable UI components
│   │   ├── Layout.tsx                      # App shell: header, footer, nav, notifications
│   │   ├── AuthModal.tsx                   # Login / register modal overlay
│   │   ├── AddressManager.tsx              # PH-address form with autocomplete
│   │   ├── ModelViewerWrapper.tsx          # Google model-viewer integration
│   │   ├── ColorPicker.tsx                 # Variant color swatch selector
│   │   ├── ColorTintedImage.tsx            # CSS-filter image colorizer
│   │   ├── QRCodeModal.tsx                 # Mobile AR launch via QR code
│   │   └── ScrollToTop.tsx                 # Route-change scroll reset
│   │
│   ├── contexts/               # React global state
│   │   ├── AuthContext.tsx                 # User session, login, logout
│   │   └── CartContext.tsx                 # Cart items, add, remove, update
│   │
│   ├── services/               # External service integrations
│   │   ├── auth.ts                         # Auth API client (login, signup, reset)
│   │   ├── db.ts                           # Product, order, cart API client
│   │   ├── address.ts                      # PH-address lookup helper
│   │   └── gemini.ts                       # Google Gemini AI integration
│   │
│   ├── App.tsx                 # Root router, route guards, cart & auth wiring
│   ├── types.ts                # Shared TypeScript interfaces & enums
│   ├── constants.ts            # App config, currency, nav items, API helpers
│   └── index.tsx               # React DOM entry point
│
├── server/                     # Express.js backend API
│   ├── config/
│   │   ├── database.mjs                    # MongoDB connection & BSON adapter
│   │   └── storage.mjs                     # Supabase storage client init
│   ├── routes/                 # REST API route handlers
│   │   ├── auth.mjs                        # Customer & admin authentication
│   │   ├── products.mjs                    # Product CRUD + image uploads
│   │   ├── orders.mjs                        # Order creation, stock validation, email
│   │   ├── cart.mjs                          # Cart read/write per user
│   │   ├── admin.mjs                         # Dashboard stats & admin actions
│   │   ├── banners.mjs                       # Marketing banner CRUD
│   │   ├── settings.mjs                      # Store settings CRUD
│   │   ├── notifications.mjs                 # SSE real-time push + read status
│   │   ├── uploads.mjs                       # Multer file upload handler
│   │   ├── assets.mjs                        # Asset migration helpers
│   │   └── address.mjs                       # Address validation routes
│   ├── middleware/
│   │   ├── requestLogger.mjs               # Request ID + structured logging
│   │   ├── errorHandler.mjs                # Global async error catch
│   │   └── validators.mjs                    # Input validation (email, ObjectId)
│   ├── utils/
│   │   ├── logger.mjs                        # Pino-style structured logger
│   │   ├── normalize.mjs                     # MongoDB document normalizer
│   │   └── supabase.mjs                      # Storage path & folder helpers
│   ├── email-helper.mjs        # Nodemailer templates (invoice, reset, confirmation)
│   ├── index.mjs               # Express app bootstrap, CORS, route mounting
│   └── sql/
│       └── supabase_schema.sql             # PostgreSQL JSONB document table DDL
│
├── api/                        # Vercel serverless adapter
│   └── index.js                # Wraps Express for Vercel Fluid Compute
│
├── scripts/                    # DevOps & data utilities
│   ├── seed-products.mjs                   # Seed initial furniture catalog
│   ├── seed-banners.mjs                      # Seed marketing banners
│   ├── seed-superadmin.mjs                   # Create default admin account
│   ├── migrate-mongo-to-supabase.mjs         # Legacy data migration
│   ├── migrate-assets-to-storj.mjs           # Asset storage migration
│   ├── bootstrap-supabase.mjs                # Initial bucket & table setup
│   ├── setup-users.mjs                       # Batch user setup
│   ├── verify-admin.mjs                      # Admin account verifier
│   ├── upload-local-assets.mjs               # Bulk local asset uploader
│   ├── clear-products.mjs                    # Clear product data utility
│   ├── test-acl.mjs                          # Storage ACL tester
│   └── setup-storj-cors.mjs                  # CORS configuration for Storj
│
├── docs/                       # Project documentation
│   ├── lucidchart_ai_prompts_figures_2-9.md  # Diagram generation prompts
│   ├── SUPABASE_SETUP.md                     # Supabase provisioning guide
│   ├── order_system.md                       # Order lifecycle specification
│   ├── cart_schema.md                        # Cart data model notes
│   ├── notifications.md                      # SSE notification design
│   ├── email_system.md                       # Email template catalog
│   └── LOGS.MD                               # Development log / changelog
│
└── config files
    ├── package.json            # Dependencies: React 19, Express, MongoDB, Supabase
    ├── vite.config.ts          # Vite build configuration
    ├── tsconfig.json           # TypeScript compiler options
    ├── vercel.json             # Vercel routing & build settings
    ├── .env.example            # Required environment variables template
    ├── .env                    # Local environment variables (gitignored)
    ├── .gitignore              # Node_modules, dist, .env exclusions
    └── .vercelignore           # Files excluded from Vercel deployment
```

---

## Architecture Overview

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Client** | React 19 + Vite + TypeScript | SPA with real-time AR (model-viewer) |
| **State** | React Context API | Global auth + cart state |
| **Routing** | React Router DOM v7 | Customer routes + protected admin routes |
| **API** | Express.js 5 + Node.js 24 | RESTful backend, SSE notifications |
| **Database** | MongoDB Atlas | Document store: users, products, orders, carts |
| **Storage** | Supabase / Storj | Cloud bucket for 3D models (.glb) + images |
| **Auth** | bcryptjs + localStorage | Password hashing + session persistence |
| **Email** | Nodemailer | Order confirmations, password resets |
| **Deploy** | Vercel | Frontend static + API serverless functions |

---

## Key Entry Points

| File | Role |
|------|------|
| `index.html` | Vite entry; loads model-viewer CDN |
| `index.tsx` | React hydration root |
| `App.tsx` | Route definitions, auth guards, cart provider |
| `server/index.mjs` | Express server bootstrap |
| `api/index.js` | Vercel serverless function adapter |
| `types.ts` | Single source of truth for data contracts |
| `constants.ts` | API base URL resolution, nav config |

---

*Generated from live codebase scan on 2026-05-16.*
