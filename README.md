# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/554b031f-a673-4e9e-a989-83c370f61bf3

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/554b031f-a673-4e9e-a989-83c370f61bf3) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Setup the local PostgreSQL database.
npm run db:check    # Check prerequisites
npm run db:setup    # Initialize database

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Database Setup

This project uses a local PostgreSQL database running in Docker. Before starting development:

1. **Check prerequisites**: `npm run db:check`
2. **Setup database**: `npm run db:setup`
3. **Start development**: `npm run dev`

### Database Commands

- `npm run db:start` - Start PostgreSQL container
- `npm run db:stop` - Stop PostgreSQL container
- `npm run db:reset` - Reset database (⚠️ deletes all data)
- `npm run db:check` - Check Docker and prerequisites

For detailed setup instructions, see:
- [Database README](database/README.md)
- [Docker Setup Guide](DOCKER_SETUP.md)

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- PostgreSQL (local Docker container)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/554b031f-a673-4e9e-a989-83c370f61bf3) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
