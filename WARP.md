# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Hand-to-Hand** is a Next.js 14 application built for managing and tracking Latin American mission data. It uses InstantDB for real-time database functionality and authentication, with a professional Tailwind CSS-styled UI.

### Technology Stack
- **Framework:** Next.js 14.2.24 (App Router)
- **Language:** TypeScript
- **Database:** InstantDB (Real-time database)
- **Authentication:** Custom JWT + bcrypt password authentication
- **UI Components:** Shadcn UI (New York style, Slate base)
- **Styling:** Tailwind CSS with custom dark navy theme
- **Validation:** Zod
- **Deployment:** Coolify (server: 178.156.197.214)

### InstantDB Credentials
- **App ID:** fd93719b-b44d-4edf-a070-819097ba20a3
- **Secret:** db4b4adc-6730-4a81-9ec8-8da0b4699775

---

## Directory Structure

```
/
├── app/                          # Next.js App Router directory
│   ├── actions/                  # Server actions
│   │   ├── auth.ts              # Authentication server actions (register, login, verify)
│   │   └── notes.ts             # Zod validation helpers for mutations
│   ├── admin/                    # Admin panel routes
│   │   └── page.tsx             # Admin dashboard (users, countries, gallery)
│   ├── dashboard/                # Main dashboard routes
│   │   ├── [country]/           # Dynamic country routes
│   │   │   ├── page.tsx         # Server component with auth check
│   │   │   └── CountryPageClient.tsx  # Client component for country page
│   │   ├── page.tsx             # Server component with auth check
│   │   └── DashboardClient.tsx  # Client component for dashboard
│   ├── login/                    # Login page route
│   │   └── page.tsx             # Login form with email/password
│   ├── register/                 # Registration page route
│   │   └── page.tsx             # Registration form with password
│   ├── verify/                   # Email verification route
│   │   └── page.tsx             # 6-digit code verification
│   ├── globals.css              # Global Tailwind styles
│   ├── layout.tsx               # Root layout component
│   └── page.tsx                 # Landing page with features
├── components/                   # UI Components
│   └── ui/                      # Shadcn UI components
│       ├── alert.tsx            # Alert component
│       ├── badge.tsx            # Badge component
│       ├── button.tsx           # Button component
│       ├── card.tsx             # Card components
│       ├── input.tsx            # Input component
│       ├── label.tsx            # Label component
│       ├── select.tsx           # Select dropdown component
│       ├── tabs.tsx             # Tabs component
│       └── textarea.tsx         # Textarea component
├── lib/                          # Shared utilities and configuration
│   ├── auth.ts                  # JWT and cookie authentication helpers
│   ├── countries.ts             # Country data constants (18 countries)
│   ├── instant-schema.ts        # InstantDB schema definitions
│   ├── instant.ts               # InstantDB client initialization
│   └── utils.ts                 # Utility functions (cn() for class merging)
├── public/                       # Static assets
│   └── demo-images/             # Placeholder for demo gallery images
├── .env.local                   # Environment variables (NOT committed)
├── components.json              # Shadcn UI configuration
├── .eslintrc.json               # ESLint configuration
├── .gitignore                   # Git ignore rules
├── next.config.js               # Next.js configuration
├── package.json                 # Dependencies and scripts
├── postcss.config.mjs           # PostCSS configuration
├── tailwind.config.ts           # Tailwind CSS configuration
└── tsconfig.json                # TypeScript configuration
```

---

## Core Components & Pages

### 1. Landing Page (`app/page.tsx`)
**Purpose:** Marketing homepage with call-to-action for authentication

**Key Features:**
- Beautiful gradient background (sky → blue → indigo)
- "Hand-to-Hand" title with animated gradient text
- Compelling subtitle: "Empowering Latin American Mission Management"
- Description of platform capabilities
- Two prominent call-to-action buttons:
  - "Sign In" → Routes to `/login`
  - "Create Account" → Routes to `/register`
- Features section with three cards:
  1. **18 Countries** - Coverage across Latin America
  2. **Organized Notes** - Real-time syncing
  3. **Secure & Private** - Enterprise-grade security
- Footer with copyright
- Auto-redirect to dashboard if user already logged in

**Authentication Check:**
- Server-side: Uses `getCurrentUser()` from `lib/auth.ts`
- Checks JWT token from HTTP-only cookie
- Redirects verified users to `/dashboard`

**State Management:**
- Server component (no client state)
- Static rendering with dynamic redirect

---

### 2. Login Page (`app/login/page.tsx`)
**Purpose:** Email and password authentication

**Key Features:**
- Email input field (validated)
- Password input field (minimum 8 characters)
- "Sign In" button with loading state
- Link to registration page for new users
- Link to verification page if email not verified
- Error messages for invalid credentials
- Success redirect to dashboard

**Authentication Flow:**
1. User enters email and password
2. Client calls `loginUser()` server action
3. Server validates credentials:
   - Finds user by email in InstantDB
   - Compares password hash using bcrypt
   - Checks `isVerified` status
4. If successful:
   - Generates JWT token with userId, email, isVerified
   - Sets HTTP-only cookie
   - Returns success
5. Client redirects to `/dashboard`

**Error Handling:**
- "Invalid email or password" for wrong credentials
- "Please verify your email" if not verified (with verification link)
- Generic error for unexpected failures

---

### 3. Registration Page (`app/register/page.tsx`)
**Purpose:** New user account creation with password

**Key Features:**
- Email input field (validated format)
- Password input field (minimum 8 characters)
- Confirm password field (must match)
- "Create Account" button with loading state
- Link to login page for existing users
- Success message and auto-redirect to verification

**Registration Flow:**
1. User enters email, password, and confirms password
2. Client validates:
   - Email format
   - Password minimum length
   - Password confirmation match
3. Client calls `registerUser()` server action
4. Server:
   - Checks if email already registered
   - Hashes password with bcrypt (10 rounds)
   - Generates 6-digit verification code
   - Sets code expiry (10 minutes)
   - Determines if user is admin (email === ADMIN_EMAIL)
   - Creates profile in InstantDB with:
     - email
     - passwordHash
     - isAdmin
     - isVerified: false
     - verificationCode
     - verificationCodeExpiry
     - createdAt: timestamp
   - Sends verification code via InstantDB email (falls back to console log)
5. Client shows success message
6. Client redirects to `/verify?email={email}` after 2 seconds

**Validation:**
- Zod schema validation on server
- Inline validation on client
- Duplicate email check

---

### 4. Email Verification Page (`app/verify/page.tsx`)
**Purpose:** Verify user email address with 6-digit code

**Key Features:**
- Email input field (pre-filled from query param)
- 6-digit code input (numeric, centered display)
- "Verify Email" button with loading state
- "Resend Code" button
- Success message and auto-redirect to dashboard
- Link to login page for already-verified users

**Verification Flow:**
1. User receives email with 6-digit code (currently logged to console)
2. User enters code on verification page
3. Client calls `verifyEmail()` server action with email and code
4. Server:
   - Finds user by email
   - Checks if already verified
   - Validates verification code matches
   - Checks code hasn't expired
   - Updates profile:
     - isVerified: true
     - verificationCode: null
     - verificationCodeExpiry: null
   - Generates JWT token
   - Sets HTTP-only cookie for auto-login
5. Client shows success message
6. Client redirects to `/dashboard` after 2 seconds

**Resend Code:**
- User clicks "Resend Code" button
- Client calls `resendVerificationCode()` server action
- Server generates new code with new expiry
- Updates user profile
- Sends new code via email

---
### 5. Dashboard (`app/dashboard/page.tsx`)
**Purpose:** Main navigation hub showing all 18 Latin American countries

**Key Features:**
- Protected route (server-side auth check with JWT)
- Redirects to `/login` if not authenticated or not verified
- Fetches user profile from InstantDB to check admin status
- Responsive grid of country cards (1-4 columns based on screen size)
- Each country card:
  - Flag emoji icon
  - Country name
  - Hover effects (shadow, transform, scale)
- Header with:
  - "Hand-to-Hand" title (links to dashboard)
  - User email display
  - "Admin Panel" button (only if isAdmin: true)
  - "Sign Out" button (calls logoutUser server action)

**Authentication:**
- Server component uses `getCurrentUser()` to verify JWT
- Fetches profile from InstantDB using InstantDB Admin SDK
- Passes user data and admin status to `DashboardClient`

**Client Component (`DashboardClient.tsx`):**
- Receives user and isAdmin props from server
- Renders country grid with links to country pages
- Handles logout with server action call

**Countries List (18 total):**
Argentina, Bolivia, Chile, Colombia, Costa Rica, Cuba, Dominican Republic, Ecuador, El Salvador, Guatemala, Honduras, Mexico, Nicaragua, Panama, Paraguay, Peru, Uruguay, Venezuela

---

### 6. Country Page (`app/dashboard/[country]/page.tsx`)
**Purpose:** Detailed view for each individual country

**Server Component:**
- Uses `getCurrentUser()` to verify JWT authentication
- Redirects to `/login` if not authenticated
- Passes userId and countrySlug to `CountryPageClient`

**Client Component (`CountryPageClient.tsx`):**

**Key Features:**
1. **Header Photo Section**
   - Empty placeholder rectangle (admin uploads later)
   - Displays photo if URL exists in database
   - Gray gradient background when empty

2. **Info Section**
   - Population (hardcoded initially, admin-editable)
   - Number of groups (default: 12, admin-editable)
   - Styled cards with gradient backgrounds

3. **Notes Section**
   - User-specific textarea (persisted per userId)
   - Auto-loads existing notes from InstantDB
   - "Save Notes" button with status feedback
   - Notes synced across devices via InstantDB
   - Uses crypto.randomUUID() for new note IDs

4. **Gallery Section**
   - 5 demo image placeholders
   - Admin can replace with real images
   - Responsive grid layout

**Data Initialization:**
- Auto-creates country data in InstantDB if doesn't exist:
  - Country name, slug, population, groups
  - 5 demo gallery images with placeholder URLs
  - Uses crypto.randomUUID() for entity IDs

**State Management:**
- Uses InstantDB client-side SDK (`db.useQuery()`)
- React state for note editing
- Manual save with `db.transact()`

---

### 7. Admin Panel (`app/admin/page.tsx`)
**Purpose:** Admin-only interface for managing users, countries, and galleries

**Access Control:**
- Checks user profile for `isAdmin: true`
- Redirects non-admins to `/dashboard`
- Only admins see "Admin Panel" button

**Three Tabs:**

#### Tab 1: Users
- Lists all registered users
- Shows email and admin status
- "Make Admin" / "Remove Admin" buttons
- Updates user profiles in real-time

#### Tab 2: Countries
- Edit interface for each of 18 countries
- Editable fields:
  - Population (text input)
  - Number of groups (number input)
  - Photo URL (text input for header image)
- "Edit" button opens inline editor
- "Save" commits changes to InstantDB
- "Cancel" discards changes

#### Tab 3: Gallery
- Country selector dropdown
- 5 image URL inputs per country
- Manages gallery images for selected country
- "Save Gallery" button:
  - Deletes existing images for country
  - Creates new images from inputs
  - Updates InstantDB in single transaction

**Implementation Notes:**
- All mutations use `db.transact()` for atomic updates
- Immediate UI feedback with alerts
- Real-time updates via InstantDB subscriptions

---

## Data Layer (InstantDB)

### Schema (`lib/instant-schema.ts`)

**Entities:**

1. **profiles**
   - `email`: string (user's email from auth)
   - `passwordHash`: string (bcrypt hashed password)
   - `isAdmin`: boolean (admin permissions flag)
   - `isVerified`: boolean (email verification status)
   - `verificationCode`: string? (optional 6-digit code for email verification)
   - `verificationCodeExpiry`: number? (optional timestamp for code expiration)
   - `createdAt`: number (timestamp)

2. **countries**
   - `name`: string ("Argentina", "Bolivia", etc.)
   - `slug`: string ("argentina", "bolivia", etc.)
   - `population`: string ("46,234,830", etc.)
   - `groups`: number (default 12)
   - `photoUrl`: string? (optional header image URL)

3. **notes**
   - `userId`: string (InstantDB auth user ID)
   - `countrySlug`: string (links to country)
   - `content`: string (user's note text)
   - `updatedAt`: number (last edit timestamp)

4. **galleryImages**
   - `countrySlug`: string (links to country)
   - `imageUrl`: string (URL to image)
   - `order`: number (1-5, display order)

### Client Initialization (`lib/instant.ts`)
- Exports `db` instance with App ID
- Used throughout app for queries and mutations
- Client-side only ('use client')

### Permissions Model
**Current State:** Open access (development mode)

**Production Requirements:**
- Users can only read/write their own `notes`
- Admins can modify `countries` and `galleryImages`
- All users can read `countries` and `galleryImages`
- `profiles` readable by all, writable by self + admins

---

## Authentication System (`lib/auth.ts` & `app/actions/auth.ts`)

### Authentication Helpers (`lib/auth.ts`)

**JWT Token Management:**
- `generateToken(payload)`: Creates JWT with 30-day expiration
- `verifyToken(token)`: Validates JWT and returns payload
- `generateVerificationCode()`: Creates random 6-digit code

**Cookie Management:**
- `setAuthCookie(token)`: Sets HTTP-only cookie with JWT
- `getAuthCookie()`: Retrieves JWT from cookie
- `removeAuthCookie()`: Deletes authentication cookie
- `getCurrentUser()`: Returns current user from JWT or null

**JWT Payload Interface:**
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  isVerified: boolean;
}
```

**Cookie Configuration:**
- Name: `auth-token`
- HttpOnly: true (not accessible via JavaScript)
- Secure: true in production
- SameSite: lax
- MaxAge: 30 days
- Path: /

### Server Actions (`app/actions/auth.ts`)

**1. `registerUser(data)`**
- **Purpose:** Create new user account with password
- **Input:** email, password, confirmPassword
- **Process:**
  1. Validates input with Zod schema
  2. Checks if email already registered
  3. Hashes password with bcrypt (10 rounds)
  4. Generates 6-digit verification code
  5. Sets code expiry (10 minutes)
  6. Determines admin status (email === ADMIN_EMAIL)
  7. Creates profile in InstantDB
  8. Sends verification code via email
- **Returns:** `{ success, message?, error?, requiresVerification? }`

**2. `loginUser(data)`**
- **Purpose:** Authenticate user with email and password
- **Input:** email, password
- **Process:**
  1. Validates input with Zod schema
  2. Finds user by email
  3. Compares password hash with bcrypt
  4. Checks if email is verified
  5. Generates JWT token
  6. Sets HTTP-only cookie
- **Returns:** `{ success, message?, error?, requiresVerification? }`

**3. `verifyEmail(data)`**
- **Purpose:** Verify user email with 6-digit code
- **Input:** email, code
- **Process:**
  1. Validates input with Zod schema
  2. Finds user by email
  3. Checks if already verified
  4. Validates verification code
  5. Checks code expiry
  6. Updates profile (isVerified: true)
  7. Generates JWT token
  8. Sets HTTP-only cookie for auto-login
- **Returns:** `{ success, message?, error? }`

**4. `resendVerificationCode(email)`**
- **Purpose:** Send new verification code
- **Input:** email
- **Process:**
  1. Finds user by email
  2. Checks if already verified
  3. Generates new 6-digit code
  4. Sets new code expiry (10 minutes)
  5. Updates profile
  6. Sends new code via email
- **Returns:** `{ success, message?, error? }`

**5. `logoutUser()`**
- **Purpose:** End user session
- **Process:**
  1. Deletes authentication cookie
- **Returns:** `{ success, message?, error? }`

**Validation Schemas:**
- `registerSchema`: email (valid format), password (min 8 chars), confirmPassword (must match)
- `loginSchema`: email (valid format), password (required)
- `verifyEmailSchema`: email (valid format), code (6 digits)

**Security Features:**
- Password hashing with bcrypt (10 rounds)
- JWT tokens for stateless sessions
- HTTP-only cookies prevent XSS attacks
- Verification codes expire after 10 minutes
- Admin status set server-side only

---

## Country Data (`lib/countries.ts`)

**COUNTRIES Array:**
- 18 pre-defined country objects
- Each has: `name`, `slug`, `population`
- Used for:
  - Dashboard country grid
  - Country page routing
  - Admin panel country selector
  - Initializing country data in InstantDB

**DEFAULT_GROUPS:**
- Constant: 12
- Initial value for all countries
- Admin-editable per country

**Type:** `CountrySlug` (union of all slug values)

---

## Server Actions & Validation (`app/actions/notes.ts`)

**Purpose:** Zod validation schemas for data mutations

**Note:** InstantDB requires client-side mutations via `db.transact()`, so these are validation helpers rather than traditional server actions.

**Schemas:**
1. `saveNoteSchema`: userId, countrySlug, content
2. `updateCountryDataSchema`: countrySlug, population?, groups?
3. `promoteUserSchema`: userId, isAdmin

**Exports:**
- `validateNoteData()`
- `validateCountryData()`
- `validatePromoteUser()`

These return `{ success: boolean, data/error }` for client-side validation.

---

## Styling & Design

### Luxury Design System
The application uses a premium, blue-themed design with glass-morphism, elegant typography, and subtle gradients. Dark mode is disabled for a consistent light background, emphasizing readability with dark text on light surfaces.

### Color Palette

#### Primary Colors (Navy)
- **luxury-navy-900:** `#0a1628` - Darkest navy for backgrounds
- **luxury-navy-800:** `#0f1f3a` - Dark navy for depth
- **luxury-navy-700:** `#142949` - Medium navy for cards
- **luxury-navy-600:** `#1a3558` - Navy for accents
- **luxury-navy-500:** `#1f4167` - Light navy

#### Accent Colors (Gold)
- **luxury-gold-500:** `#d4af37` - Primary gold for highlights
- **luxury-gold-400:** `#e6c453` - Medium gold
- **luxury-gold-300:** `#f2d879` - Light gold for text
- **luxury-gold-200:** `#f7e8a8` - Pale gold

#### Secondary Colors (Navy)
- **luxury-purple-600:** `#6b21a8` - Deep purple
- **luxury-purple-500:** `#7c3aed` - Medium purple
- **luxury-purple-400:** `#06b6d4` - Light purple

#### Status Colors
- **Success:** luxury-gold-400
- **Error:** Red-400 / Red-500
- **Info:** luxury-gold-300

### Typography

#### Font Families
- **Headings:** Playfair Display (serif)
  - Weights: 400, 500, 600, 700
  - Applied via `font-display` class
  - Used for: Page titles, section headings, "Hand-to-Hand" branding
  
- **Body Text:** Inter (sans-serif)
  - Weights: 300, 400, 500, 600, 700
  - Applied via `font-body` class (default)
  - Used for: Paragraphs, buttons, form inputs, general content

#### Font Loading
- Optimized with Next.js `next/font/google`
- CSS variables: `--font-playfair`, `--font-inter`
- Font display swap for performance
- Premium font smoothing: `-webkit-font-smoothing: antialiased`

### Glass-Morphism Effects

#### `.glass-card`
- Semi-transparent white background: `rgba(255, 255, 255, 0.9)`
- Backdrop blur: `blur(20px)`
- Gold border: `1px solid rgba(212, 175, 55, 0.2)`
- Usage: Main content cards, form containers

#### `.glass-morphism`
- Semi-transparent white background: `rgba(255, 255, 255, 0.85)`
- Backdrop blur: `blur(15px)`
- White border: `1px solid rgba(255, 255, 255, 0.3)`
- Usage: Headers, navigation bars

### Gradient Backgrounds

#### `.gradient-bg`
Primary page background gradient:
- Sky (#f0f9ff) → Blue (#dbeafe) → Indigo (#e0e7ff)
- Direction: 135 degrees

#### `.gradient-bg-alt`
Alternate page background gradient:
- Same colors as above
- Direction: to bottom right

#### `.bg-pattern`
Subtle radial pattern overlay:
- Navy circle accents at ~3-5% opacity
- Adds gentle depth over gradients without reducing readability

### Custom Shadows

- **luxury:** `0 10px 40px -10px rgba(212, 175, 55, 0.3)` - Standard gold glow
- **luxury-lg:** `0 20px 60px -15px rgba(212, 175, 55, 0.4)` - Large gold glow
- **luxury-xl:** `0 30px 80px -20px rgba(212, 175, 55, 0.5)` - Extra large glow
- **deep:** `0 25px 50px -12px rgba(0, 0, 0, 0.25)` - Deep shadow
- **shadow-luxury-glow:** Combined gold glow + standard shadow

### Animations

#### Keyframe Animations
1. **fade-in** (0.6s ease-in-out)
   - 0%: opacity 0, translateY(10px)
   - 100%: opacity 1, translateY(0)
   
2. **slide-up** (0.5s ease-out)
   - 0%: opacity 0, translateY(20px)
   - 100%: opacity 1, translateY(0)
   
3. **shimmer** (2s infinite)
   - Animated background position for shine effects
   - Used with `.shimmer` utility class
   
4. **pulse-slow** (3s infinite)
   - Slow breathing animation for background elements

#### Hover Effects
- **Scale transforms:** `hover:scale-105`, `hover:scale-[1.02]`
- **Active states:** `active:scale-95`, `active:scale-[0.98]`
- **Shadow transitions:** Smooth luxury shadow changes
- **Border animations:** Gold border opacity increases on hover

### Design Patterns

#### Cards
- **Base:** `.glass-card` with rounded-2xl
- **Border:** 2px solid gold with 20% opacity
- **Shadow:** luxury or luxury-xl
- **Hover:** Enhanced shadow and border opacity
- **Animation:** Staggered fade-in with delays

#### Buttons
- **Primary:** `.gradient-gold` with navy text
- **Secondary:** White/transparent with gold border
- **Hover:** Scale transform + enhanced shadow
- **Active:** Slight scale down for feedback
- **Disabled:** 50% opacity, no pointer events

#### Form Inputs
- **Background:** White/50 with backdrop blur
- **Border:** 2px solid slate-200/30%
- **Focus ring:** 2px accent-400
- **Hover:** Border opacity increases to 50%
- **Text:** slate-900 for high readability
- **Placeholder:** slate-500

#### Headers
- **Background:** `.glass-morphism`
- **Border bottom:** 2px gold/20%
- **Sticky:** Position sticky, z-index 10
- **Logo/Title:** Playfair Display with gold gradient

#### Country Cards (Dashboard)
- **Base:** `.glass-card` with shimmer overlay
- **Icon:** Gold gradient circular badge
- **Hover:** -translateY(8px) + scale(1.02)
- **Shadow:** Luxury shadow on hover
- **Animation:** Staggered by index (50ms delays)

### Responsive Breakpoints
- **sm:** 640px (2 columns, mobile landscape)
- **md:** 768px (3 columns, tablets)
- **lg:** 1024px (4 columns, desktops)

### Mobile-Friendly Features
- **Touch Optimization:** All interactive elements have `touch-manipulation`
- **Responsive Typography:** Font sizes scale from mobile to desktop
- **Flexible Layouts:** Headers stack vertically on mobile
- **Touch Targets:** Minimum 44x44px tap areas
- **Viewport Optimization:** Proper padding prevents edge clipping
- **Input Enhancement:** `inputMode="numeric"` for code inputs
- **Sticky Headers:** Position sticky for better navigation
- **Responsive Grids:** 1-4 columns based on breakpoint
- **Text Overflow:** `truncate` and `break-all` prevent breaking
- **Active States:** `active:` pseudo-classes for touch feedback
- **Backdrop Support:** Webkit prefixes for iOS Safari

### Custom Utility Classes

All defined in `app/globals.css`:
- `.glass-card` - Primary glass-morphism card style
- `.glass-morphism` - Header/navigation glass style
- `.gradient-bg` - Primary page background gradient (sky → blue → indigo)
- `.gradient-bg-alt` - Alternate page background gradient
- `.bg-pattern` - Subtle pattern overlay
- `.shimmer` - Animated shine effect
- `.text-luxury` - Premium font rendering with letter spacing
- `.shadow-luxury-glow` - Combined gold glow effect

### Custom Scrollbar (Webkit)
- **Track:** slate-100 background
- **Thumb:** slate-300, rounded corners
- **Hover:** accent-500

---

## Shadcn UI Integration

### Overview
The application uses **Shadcn UI** components for a professional, consistent, and accessible user interface. All UI components are built with **Radix UI primitives** and styled with **Tailwind CSS**, following the **New York style** with a **Slate base color**.

### Configuration
- **Style:** New York (recommended)
- **Base Color:** Slate
- **CSS Variables:** Enabled
- **Icon Library:** Lucide React
- **Configuration File:** `components.json`

### Installed Components

All Shadcn UI components are located in `components/ui/`:

1. **Button** (`button.tsx`)
   - Used in: All pages (auth, dashboard, country pages, admin)
   - Variants: default, destructive, outline, ghost
   - Custom styling: `.gradient-accent` class for purple gradient buttons

2. **Input** (`input.tsx`)
   - Used in: Landing page (email/code), Admin panel (all form fields)
   - Features: Auto-focus, disabled states, placeholder support

3. **Textarea** (`textarea.tsx`)
   - Used in: Country pages (notes section)
   - Features: Resize control, auto-height

4. **Card** (`card.tsx`)
   - Components: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
   - Used in: All pages for content containers
   - Custom styling: Glass-morphism effects with `.glass-card` and backdrop-blur

5. **Tabs** (`tabs.tsx`)
   - Components: Tabs, TabsList, TabsTrigger, TabsContent
   - Used in: Admin panel (Users, Countries, Gallery tabs)
   - Features: Keyboard navigation, accessibility

6. **Select** (`select.tsx`)
   - Components: Select, SelectTrigger, SelectValue, SelectContent, SelectItem
   - Used in: Admin panel (Gallery country selector)
   - Features: Dropdown with search, keyboard navigation

7. **Badge** (`badge.tsx`)
   - Used in: Admin panel (user admin status)
   - Variants: default, secondary, destructive, outline

8. **Label** (`label.tsx`)
   - Used in: All form fields for accessibility
   - Features: Proper `htmlFor` linking to inputs

9. **Alert** (`alert.tsx`)
   - Components: Alert, AlertTitle, AlertDescription
   - Used in: Country pages (save status feedback)
   - Variants: default, destructive

### Theme Customization

The default Shadcn UI theme has been customized to match the dark navy aesthetic:

#### CSS Variables (in `app/globals.css`)

```css
:root {
  /* Primary - Luxury Navy (#06b6d4) */
  --primary: 271 91% 65%;
  --primary-foreground: 0 0% 100%;
  
  /* Secondary - Light Navy */
  --secondary: 270 60% 94%;
  --secondary-foreground: 271 91% 65%;
  
  /* Accent - Navy Theme */
  --accent: 271 81% 76%;
  --accent-foreground: 222.2 47.4% 11.2%;
  
  /* Ring - Navy Accent */
  --ring: 271 91% 65%;
  
  /* Radius - Slightly rounded */
  --radius: 0.75rem;
}
```

#### Custom Button Styling

The `.gradient-accent` class applies a purple gradient to buttons:

```css
.gradient-accent {
  background: linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%);
}
```

Usage:
```tsx
<Button className="gradient-accent text-white">
  Save Changes
</Button>
```

### Utility Function

The `cn()` utility function (in `lib/utils.ts`) combines Tailwind classes with Shadcn UI styles:

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

This ensures proper class merging and prevents conflicts.

### Component Usage Examples

#### Authentication Card (Landing Page)
```tsx
<Card className="glass-card border-slate-200/50 shadow-xl">
  <CardHeader className="text-center">
    <CardTitle className="text-2xl sm:text-3xl font-display">
      Welcome Back
    </CardTitle>
    <CardDescription>
      Sign in or create an account to continue
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <Label htmlFor="email">Email Address</Label>
      <Input
        id="email"
        type="email"
        placeholder="you@example.com"
      />
    </div>
    <Button className="w-full gradient-accent text-white" size="lg">
      Send Verification Code
    </Button>
  </CardContent>
</Card>
```

#### Admin Panel Tabs
```tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="users">Users</TabsTrigger>
    <TabsTrigger value="countries">Countries</TabsTrigger>
    <TabsTrigger value="gallery">Gallery</TabsTrigger>
  </TabsList>
  <TabsContent value="users">
    <UsersTab profiles={profiles} />
  </TabsContent>
</Tabs>
```

#### Country Notes Section
```tsx
<Card>
  <CardHeader>
    <CardTitle>My Notes</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <Textarea
      value={noteContent}
      onChange={(e) => setNoteContent(e.target.value)}
      placeholder="Enter your notes here..."
      className="h-48 resize-none"
    />
    <Button onClick={handleSave} size="lg">
      Save Notes
    </Button>
    {saveStatus && (
      <Alert>
        {saveStatus}
      </Alert>
    )}
  </CardContent>
</Card>
```

### Adding New Shadcn UI Components

To add additional Shadcn UI components:

```bash
# View available components
npx shadcn@latest add

# Add a specific component (e.g., Dialog)
npx shadcn@latest add dialog

# Add multiple components at once
npx shadcn@latest add dialog dropdown-menu tooltip
```

Components will be automatically installed in `components/ui/` with proper configuration.

### Troubleshooting Shadcn UI

#### Component Not Rendering
- Ensure proper import: `import { Button } from '@/components/ui/button'`
- Check that `lib/utils.ts` exists with `cn()` function
- Verify Tailwind CSS is configured correctly

#### Styling Issues
- Check that `app/globals.css` includes `@layer base` for CSS variables
- Ensure custom classes (`.gradient-accent`, `.glass-card`) are defined
- Verify `tailwind.config.ts` includes `components/ui` in content paths

#### Type Errors
- Run `npm install` to ensure all dependencies are installed
- Check that `@radix-ui/*` packages are installed correctly
- Verify TypeScript configuration in `tsconfig.json`

---

## Build & Deployment

### Scripts
- `npm run build`: Production build
- `npm start`: Start production server (port 3000)
- `npm run lint`: ESLint check

### Environment Variables (Coolify)
**IMPORTANT:** These environment variables must be configured in Coolify. They are NOT committed to git for security.

**Required Environment Variables:**
- `JWT_SECRET`: Secret key for signing JWT tokens (use a long random string)
- `NEXT_PUBLIC_INSTANT_APP_ID`: fd93719b-b44d-4edf-a070-819097ba20a3
- `INSTANT_APP_SECRET`: db4b4adc-6730-4a81-9ec8-8da0b4699775
- `ADMIN_EMAIL`: ericreiss@aol.com

**Note:** Without these environment variables, the application will fail to start. Configure them in the Coolify dashboard before deploying.

### Coolify Configuration
1. **Repository:** https://github.com/markb7258/nicks-website
2. **Branch:** main
3. **Build Command:** `npm run build`
4. **Start Command:** `npm start`
5. **Port:** 3000
6. **Webhook Secret:** `ca227943a0432a7115bdf3121e593b059a0f16e05ae1e47c95747e57a68263bd`

### Auto-Deployment
- GitHub webhook triggers Coolify deployment on push to `main`
- No manual deployment needed after initial setup

---

## Development Workflow

### Adding a New Country
1. Add to `COUNTRIES` array in `lib/countries.ts`
2. Rebuild application
3. Country automatically appears in dashboard
4. Country page auto-initializes on first visit

### Modifying Admin Permissions
1. Update `isAdmin` flag in InstantDB `profiles` entity
2. Use admin panel "Users" tab
3. Or manually via InstantDB dashboard

### Changing Country Data
1. Admin panel → Countries tab
2. Click "Edit" on desired country
3. Modify population, groups, or photo URL
4. Click "Save"

### Updating Gallery Images
1. Admin panel → Gallery tab
2. Select country from dropdown
3. Enter 5 image URLs
4. Click "Save Gallery"

---

## Key Implementation Details

### Authentication Flow
1. User visits landing page
2. Clicks "Create Account" to register
3. Enters email, password, confirms password
4. Server hashes password with bcrypt and creates profile
5. Server generates 6-digit verification code
6. User receives verification code (currently logged to console)
7. User enters code on verification page
8. Server verifies code and sets isVerified: true
9. Server generates JWT token and sets HTTP-only cookie
10. User redirected to `/dashboard`

**For Returning Users:**
1. User clicks "Sign In" from landing page
2. Enters email and password
3. Server validates credentials with bcrypt
4. Server checks isVerified status
5. Server generates JWT token and sets HTTP-only cookie
6. User redirected to `/dashboard`

### Data Fetching Pattern
```typescript
const { isLoading, error, data } = db.useQuery({
  countries: { $: { where: { slug: countrySlug } } },
  notes: { $: { where: { userId: user.id, countrySlug } } }
});
```

### Data Mutation Pattern
```typescript
await db.transact(
  db.tx.notes[noteId].update({
    content: newContent,
    updatedAt: Date.now()
  })
);
```

### Admin Check Pattern
```typescript
const userProfile = profiles.find(p => p.email === user.email);
if (userProfile?.isAdmin) {
  // Show admin features
}
```

---

## Common Tasks

### Fix TypeScript Errors
1. Check `tsconfig.json` for strict mode settings
2. Ensure all `db.useQuery()` results are type-checked
3. Use `String()` for error messages if type unknown

### Update Dependencies
```bash
npm update
npm audit fix
```

### Clear Build Cache
```bash
rm -rf .next
npm run build
```

### Test Locally
```bash
npm run build
npm start
# Visit http://localhost:3000
```

### Deploy Changes
```bash
git add .
git commit -m "Description of changes"
git push origin main
# Coolify auto-deploys via webhook
```

---

## Security Considerations

### Current State (Production)
- InstantDB App ID is public (safe to commit)
- InstantDB Secret and JWT Secret in environment variables (not in repo)
- Password hashing with bcrypt (10 rounds)
- JWT tokens stored in HTTP-only cookies
- Email verification required for login
- Admin status set server-side only

### Production Recommendations
1. **Configure InstantDB Permissions:**
   - Restrict `notes` writes to note owner
   - Restrict `countries`/`galleryImages` writes to admins
   - Keep reads open for all authenticated users

2. **Rate Limiting:**
   - Consider InstantDB built-in rate limits
   - Monitor for abuse

3. **Admin Email:**
   - Currently hardcoded as `ericreiss@aol.com`
   - Consider moving to environment variable
   - Or manage via InstantDB dashboard

4. **Image Uploads:**
   - Current: Admin pastes URLs
   - Future: Consider InstantDB Storage for file uploads
   - Or integrate S3/Cloudinary

---

## Troubleshooting

### Build Fails
- Check TypeScript errors: `npm run lint`
- Ensure all imports are correct
- Verify `db.useQuery()` syntax matches InstantDB v0.16.0

### Authentication Not Working
- Verify environment variables are set in Coolify
- Check JWT_SECRET is configured
- Check password meets minimum length requirement (8 chars)
- Verify email verification code is correct and not expired (10 min)
- Check server logs for bcrypt or JWT errors

### Data Not Persisting
- Check browser console for InstantDB errors
- Verify `db.transact()` calls are awaited
- Ensure user is authenticated

### Admin Panel Not Showing
- Confirm user email matches hardcoded admin email
- Check `profiles` entity has `isAdmin: true`
- Verify `useEffect` for profile creation ran

### Gallery Images Not Loading
- Ensure image URLs are publicly accessible
- Check browser console for CORS errors
- Verify `imageUrl` fields in InstantDB

---

## Future Enhancements

### Phase 1 (Core Features)
- ✅ Authentication with email magic codes
- ✅ Dashboard with 18 countries
- ✅ Country pages with notes and galleries
- ✅ Admin panel for user/country/gallery management

### Phase 2 (Planned)
- [ ] InstantDB permission rules (security)
- [ ] File upload for images (InstantDB Storage)
- [ ] Rich text editor for notes (Markdown or WYSIWYG)
- [ ] Search/filter countries on dashboard
- [ ] Export notes to PDF/CSV
- [ ] Activity log (who edited what when)
- [ ] Email notifications for admin actions

### Phase 3 (Ideas)
- [ ] Multi-language support (Spanish, Portuguese)
- [ ] Mobile app (React Native with InstantDB)
- [ ] Offline mode with sync
- [ ] Collaborative notes (multiple users)
- [ ] Data visualization (charts, maps)
- [ ] Integration with mission management tools

---

## Contact & Support

- **Repository:** https://github.com/markb7258/nicks-website
- **InstantDB Docs:** https://www.instantdb.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS Docs:** https://tailwindcss.com/docs

---

**Last Updated:** October 21, 2025  
**Version:** 1.0.0  
**Maintained by:** WARP AI Agent
