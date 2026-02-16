# Mini Bo Enterprise - Ultimate Edition
## Manufacturing Management System (PWA)

### 📁 PROJECT STRUCTURE

```
mini-bo-enterprise/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── SplashScreen.tsx          # Framer Motion animated splash
│   │   │   └── PrintableReport.tsx       # ISO Smart-Pagination Print Engine
│   │   │
│   │   ├── layouts/
│   │   │   └── MainLayout.tsx            # NextUI Navigation Layout
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx             # Overview with stats
│   │   │   ├── FreshProduction.tsx       # Fresh entry (Hours 1-12)
│   │   │   ├── FrozenProduction.tsx      # Frozen entry (Boxes/Weight)
│   │   │   ├── ProductionHistory.tsx     # View/Print/Export history
│   │   │   ├── ProductsSettings.tsx      # Product CRUD (SKU visible)
│   │   │   ├── BrandsSettings.tsx        # Brand management
│   │   │   └── NotFound.tsx              # 404 page
│   │   │
│   │   ├── routes.ts                     # React Router config
│   │   └── App.tsx                       # Main entry point
│   │
│   ├── services/                         # 🏗️ REPOSITORY PATTERN
│   │   ├── types.ts                      # TypeScript interfaces
│   │   ├── database.ts                   # Dexie.js schema + seeding
│   │   ├── LocalRepository.ts            # IndexedDB implementation (ACTIVE)
│   │   ├── ApiRepository.ts              # REST API stub (FUTURE)
│   │   └── ServiceFactory.ts             # Centralized service container
│   │
│   ├── utils/
│   │   ├── calculations.ts               # Production calculations
│   │   └── exportUtils.ts                # Excel export (exceljs)
│   │
│   └── styles/
│       ├── index.css                     # Main styles
│       ├── fonts.css                     # Font imports
│       ├── tailwind.css                  # Tailwind directives
│       └── theme.css                     # Design tokens
│
└── package.json
```

---

## 🏛️ ARCHITECTURE HIGHLIGHTS

### 1. **Repository Pattern Service Layer**
**File:** `/src/services/ServiceFactory.ts`

```typescript
import { Services } from '@/services/ServiceFactory';

// Usage in components:
const brands = await Services.brands.getAll();
const products = await Services.products.getAll();
const entries = await Services.production.getAllEntries();
```

**Switch Modes:**
- **Local Mode (Default):** Set `VITE_USE_CLOUD_API=false` → Uses Dexie.js
- **Cloud Mode:** Set `VITE_USE_CLOUD_API=true` → Uses Axios REST API

---

### 2. **SKU Visibility Logic**

| Context            | SKU Visible? | Reason                          |
|--------------------|--------------|---------------------------------|
| Production Entry   | ❌ Hidden    | Reduces operator clutter        |
| Settings Page      | ✅ Visible   | Admin needs to manage SKUs      |
| Excel Export       | ✅ Visible   | Warehouse tracking requirement  |

---

### 3. **ISO Smart-Pagination Print Engine**
**File:** `/src/app/components/PrintableReport.tsx`

**Algorithm:**
1. Filter out items with `quantity === 0`
2. Chunk items into pages (max 6 items per page)
3. Render separate `.a4-page` containers for each chunk
4. Repeat header & footer on EVERY page
5. CSS: `page-break-after: always` between pages

**Layout:** A4 Landscape, 10mm margins, ISO-compliant format

---

### 4. **Database Schema (Dexie.js)**
**File:** `/src/services/database.ts`

**Tables:**
- `brands` - Product brands (English/Arabic)
- `products` - SKU, unit_weight, brand_id
- `production_entries` - Date, shift, type, supervisor
- `fresh_items` - Hourly production (hour_1 to hour_12)
- `frozen_items` - Boxes, net_weight, gross_weight

**Auto-Seeding:** Initial data loads on first run

---

## 🎨 UI TECHNOLOGY STACK

| Component      | Library         | Purpose                    |
|----------------|-----------------|----------------------------|
| UI Components  | NextUI (HeroUI) | Tables, Modals, Inputs     |
| Styling        | Tailwind CSS    | Utility-first CSS          |
| Animation      | Framer Motion   | Splash screen & transitions|
| State/DB       | Dexie.js        | Offline IndexedDB storage  |
| Routing        | React Router v7 | Multi-page navigation      |
| Notifications  | Sonner          | Toast messages             |

---

## 📊 KEY FEATURES

### ✅ Fresh Production Module
- **12-Hour Grid:** Columns for each hour (H1-H12)
- **Auto-Calculation:** Total Qty = Sum of hours
- **Weight Conversion:** Total Weight = Qty × Unit Weight

### ✅ Frozen Production Module
- **Fields:** Quantity (Boxes), Net Weight, Gross Weight, Notes
- **Flexible Entry:** No rigid time slots

### ✅ Export Engine
- **Excel:** ExcelJS with formulas, bold headers, SKU column
- **PDF/Print:** Smart pagination via CSS print media queries

### ✅ Offline-First
- All data stored in IndexedDB (Dexie.js)
- Works without internet connection
- Future cloud sync capability ready

---

## 🚀 QUICK START

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

---

## 🔧 CONFIGURATION

### Environment Variables (.env)
```env
# Use Local Offline Mode (Default)
VITE_USE_CLOUD_API=false

# Use Cloud API Mode (Future)
# VITE_USE_CLOUD_API=true
# VITE_API_BASE_URL=https://api.minibo.com/v1
```

---

## 📝 USAGE GUIDE

### 1. Add Products & Brands
1. Navigate to **Settings → Products**
2. Add brands first
3. Add products with SKU, unit weight, and brand

### 2. Create Production Entry
1. Choose **Fresh Production** or **Frozen Production**
2. Fill in date, shift, and supervisor
3. Enter production data in the grid
4. Click **Save Entry**

### 3. Print Reports
1. Go to **Production History**
2. Select an entry
3. Click **Print** → Generates ISO-compliant report
4. Or click **Excel** → Downloads formatted spreadsheet

---

## 🎯 TECHNICAL DECISIONS

### Why Repository Pattern?
- **Testability:** Easy to mock services
- **Flexibility:** Switch between Local/Cloud instantly
- **Maintainability:** Centralized data access logic

### Why Dexie.js?
- **Offline-First:** IndexedDB wrapper
- **Reactive:** Observable queries
- **Migrations:** Schema versioning support

### Why NextUI?
- **Production-Ready:** Enterprise-grade components
- **Accessibility:** ARIA compliant
- **Customizable:** Tailwind CSS integration

---

## 📄 ISO REPORT COMPLIANCE

**Printed Reports Include:**
- Company header (Mini Bo Enterprise)
- Entry metadata (Date, Shift, Supervisor)
- Production data table (auto-paginated)
- Signature blocks (Prepared, Reviewed, Approved)
- Page numbers (Page X of Y)
- Generation timestamp

**Print Preview:** Uses `react-to-print` with custom CSS media queries

---

## 🌐 RTL SUPPORT (ARABIC)

- All products have `name_ar` field
- Reports display both English and Arabic
- Ready for `dir="rtl"` implementation

---

## 📦 DEPLOYMENT CHECKLIST

- [ ] Set production environment variables
- [ ] Build with `npm run build`
- [ ] Deploy `dist/` folder to web server
- [ ] Configure service worker for PWA (future)
- [ ] Set up cloud API endpoint (if switching to cloud mode)

---

## 🛡️ LICENSE & CREDITS

**Mini Bo Enterprise - Ultimate Edition**
Built with React, TypeScript, NextUI, Dexie.js, and ❤️

---

## 🆘 TROUBLESHOOTING

### Issue: "Products not loading"
**Solution:** Check browser console. IndexedDB might be disabled.

### Issue: "Print layout broken"
**Solution:** Ensure you're using `react-to-print` and CSS print media queries are not overridden.

### Issue: "SKU not showing in Excel"
**Solution:** This is intentional in operator view. Check Settings page or Excel export.

---

## 📞 SUPPORT

For questions or issues, please refer to the source code documentation in each file.

**Built by Senior Software Architect & Lead Frontend Engineer**
