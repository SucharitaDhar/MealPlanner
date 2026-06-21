# Forka — Architecture Documentation

This document describes the layered architecture of the Forka application, defining the directory boundaries and patterns to follow when adding new features.

```
/src
  ├── types/                # 1. Domain Types Layer
  ├── services/             # 2. Domain / Business Services Layer
  ├── data/                 # 3. Data / Infrastructure Repositories
  ├── store/                # 4. State Management Store
  └── components/           # 5. Presentation Components
```

---

## 1. Domain Types Layer (`/src/types/`)
* **Purpose**: Core contract definitions and TypeScript type interfaces.
* **Rules**: Contains only types and interfaces. No logic, no variables, no functions.
* **Adding New Features**: Add new interface types here (e.g., `ShoppingList`, `NutritionReport`) before writing any logic or components.

## 2. Business Services Layer (`/src/services/`)
* **Purpose**: Pure domain calculations, parses, conversions, and business rules.
* **Rules**:
  * Functions must be **pure** (given the same inputs, they always return the same output).
  * No calls to `localStorage`, databases, or network fetch APIs.
  * Completely unit-testable in Node/Jest without React context.
* **Adding New Features**: Write calculations here (e.g., automated meal generator algorithms, currency conversions, calorie offsets).

## 3. Data Infrastructure Layer (`/src/data/`)
* **Purpose**: Gateway to data persistence (localStorage) and external services (Next.js server API routes).
* **Rules**:
  * Interfaces with the physical storage and network.
  * Converts raw responses (JSON) into typed domain objects using mapping utilities.
* **Adding New Features**: Add integrations to new endpoints (e.g. Stripe checkout APIs, Google Calendar export requests) inside this folder.

## 4. State Management Layer (`/src/store/`)
* **Purpose**: Orchestrates global app state, propagates updates, and triggers auto-saving/persistence.
* **Rules**:
  * Written as React Context Providers and Hooks.
  * Subscribes to updates from the data layer and triggers state propagation.
* **Adding New Features**: Extend `AppStateContextType` and `AppStateProvider` if you need to share new global state variables (e.g. current selected week, shopping list check states).

## 5. Presentation Layer (`/src/components/`)
* **Purpose**: Styling, structure, visual layout, and user input capture.
* **Rules**:
  * Strictly presentation only.
  * No math calculations, API fetching, or localStorage references inside components.
  * Rely entirely on props, local visual states (e.g., expanded accordions, toggles), and services/stores.
* **Adding New Features**: Create clean functional elements (e.g. `MealRow`, `GroceryItemCard`) styled cohesively with the CSS variables defined in `/src/app/globals.css`.
