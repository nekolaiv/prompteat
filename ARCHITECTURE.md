# Prompeat Architecture

This document describes the modular architecture of Prompeat, an open-source prompt library.

## Architecture Overview

Prompeat follows a **modular architecture** where each feature is organized as a self-contained module with clear separation of concerns.

### Directory Structure

```
src/
├── modules/           # Feature modules
│   └── auth/         # Authentication module
│       ├── presentation/  # UI layer
│       │   ├── components/
│       │   ├── hooks/
│       │   └── pages/
│       ├── domain/        # Business logic layer
│       │   ├── entities/
│       │   ├── usecases/
│       │   └── repositories/
│       └── data/          # Data access layer
│           ├── repositories/
│           ├── sources/
│           └── models/
├── shared/            # Shared utilities and components
│   ├── types/
│   ├── utils/
│   ├── config/
│   ├── components/
│   └── hooks/
├── lib/              # shadcn/ui utilities
└── app/              # Next.js app router
```

## Layer Responsibilities

### 1. Presentation Layer (`presentation/`)
- **Purpose**: UI components, hooks, and pages
- **Responsibilities**:
  - React components
  - Custom hooks for state management
  - UI logic and event handlers
  - Form validation (UI level)
- **Dependencies**: Can depend on domain layer
- **Example**: `SignInForm.tsx`, `useAuth.ts`

### 2. Domain Layer (`domain/`)
- **Purpose**: Business logic and rules
- **Responsibilities**:
  - Business entities (data models)
  - Use cases (business operations)
  - Repository interfaces (contracts)
  - Business validation rules
- **Dependencies**: No dependencies on other layers
- **Example**: `SignInUseCase.ts`, `User.ts`

### 3. Data Layer (`data/`)
- **Purpose**: Data access and external services
- **Responsibilities**:
  - Repository implementations
  - API clients and data sources
  - Data models (mapping between API and domain)
  - External service integrations
- **Dependencies**: Implements domain repository interfaces
- **Example**: `AuthRepository.ts`, `SupabaseAuthDataSource.ts`

## Module Structure: Authentication Example

```
modules/auth/
├── presentation/
│   ├── components/
│   │   └── AuthProvider.tsx      # Auth context provider
│   ├── hooks/
│   │   └── useAuth.ts             # Auth hook for components
│   └── pages/
│       ├── SignInPage.tsx         # Sign in page
│       └── SignUpPage.tsx         # Sign up page
├── domain/
│   ├── entities/
│   │   └── User.ts                # User entity
│   ├── usecases/
│   │   ├── SignInUseCase.ts       # Sign in business logic
│   │   └── SignUpUseCase.ts       # Sign up business logic
│   └── repositories/
│       └── IAuthRepository.ts     # Auth repository interface
├── data/
│   ├── repositories/
│   │   └── AuthRepository.ts      # Repository implementation
│   ├── sources/
│   │   └── SupabaseAuthDataSource.ts  # Supabase integration
│   └── models/
│       └── UserModel.ts           # Data model mapping
└── index.ts                       # Module exports
```

## Data Flow

```
User Action (UI)
    ↓
Presentation Layer (Component/Hook)
    ↓
Domain Layer (Use Case)
    ↓
Domain Layer (Repository Interface)
    ↓
Data Layer (Repository Implementation)
    ↓
Data Layer (Data Source)
    ↓
External Service (Supabase, API, etc.)
```

## Key Principles

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Dependency Rule**: Dependencies point inward (Presentation → Domain ← Data)
3. **Interface Segregation**: Domain defines interfaces, Data implements them
4. **Testability**: Each layer can be tested independently
5. **Modularity**: Features are self-contained and can be developed independently

## Adding a New Module

To add a new module (e.g., `prompts`):

1. Create module directory: `src/modules/prompts/`
2. Create layer directories:
   - `presentation/` - UI components and hooks
   - `domain/` - entities, use cases, and repository interfaces
   - `data/` - repository implementations and data sources
3. Define domain entities in `domain/entities/`
4. Create use cases in `domain/usecases/`
5. Define repository interfaces in `domain/repositories/`
6. Implement repositories in `data/repositories/`
7. Create data sources in `data/sources/`
8. Build UI in `presentation/`
9. Export public API in module's `index.ts`

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase
- **State Management**: React Context + Hooks
- **Authentication**: Supabase Auth

## Shared Resources

The `shared/` directory contains code used across multiple modules:
- `types/` - Common TypeScript types
- `utils/` - Utility functions
- `config/` - Configuration (Supabase, etc.)
- `components/` - Reusable UI components
- `hooks/` - Reusable React hooks

## Benefits

- **Maintainability**: Clear structure makes code easy to navigate
- **Scalability**: New features can be added as independent modules
- **Testability**: Each layer can be tested in isolation
- **Team Collaboration**: Different team members can work on different modules
- **Code Reusability**: Shared code is centralized
- **Flexibility**: Easy to swap implementations (e.g., change database)
