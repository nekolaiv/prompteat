# Prompeat Setup Guide

This guide will help you set up and run the Prompeat project locally.

## Prerequisites

- Node.js 20.x or higher
- npm or yarn
- A Supabase account (free tier is fine)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd prompt-eat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be created

### 2. Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy your:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon/public key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 4. Set Up Database Schema

Run this SQL in your Supabase SQL Editor (**SQL Editor** → **New query**):

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own data
CREATE POLICY "Users can insert own data"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on user updates
CREATE TRIGGER on_user_updated
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

### 5. Configure Authentication Providers (Optional)

If you want to enable Google or GitHub login:

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Enable the providers you want (Google, GitHub, etc.)
3. Follow the instructions to set up OAuth credentials

## Running the Project

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── modules/              # Feature modules
│   └── auth/            # Authentication module  
│       ├── presentation/   # UI components and hooks
│       ├── domain/        # Business logic
│       └── data/          # Data access
├── shared/              # Shared code
│   ├── types/          # Common types
│   ├── utils/          # Utility functions
│   ├── config/         # Configuration (Supabase)
│   ├── components/     # Shared components
│   └── hooks/          # Shared hooks
├── lib/                # shadcn/ui utilities
└── app/                # Next.js app router
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## Next Steps

1. **Create your first module**: Use the auth module as a template
2. **Add UI components**: Use shadcn/ui components (`npx shadcn@latest add button`)
3. **Customize styling**: Edit Tailwind config in `src/app/globals.css`
4. **Add more features**: Create new modules for prompts, templates, etc.

## Troubleshooting

### "Missing Supabase environment variables" error

- Make sure you've created a `.env.local` file
- Check that your environment variables are correctly named and have values
- Restart the development server after adding environment variables

### Authentication not working

- Verify your Supabase URL and keys are correct
- Check that you've run the database schema setup
- Ensure RLS policies are enabled

### Build errors

- Clear the `.next` directory: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check that all TypeScript types are correct

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines (coming soon).

## License

This project is open source. License details coming soon.
