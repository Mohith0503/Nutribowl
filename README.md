# Nutribowl Breakfast Workspace

This is the main workspace for the **Nutribowl** application.

---

## ⚠️ CRITICAL DEVELOPMENT GUIDELINES

> [!IMPORTANT]
> **ALWAYS WORK ON THE `dev` BRANCH**
> - **Rule**: Whenever you start working in this workspace, verify that you are on the `dev` branch.
> - **Branch Policy**: Direct commits to the `main` branch are prohibited. All development, experiments, and feature implementations must happen on the `dev` branch.
> - **Release**: Only merge `dev` into `main` once features are fully verified and stable.

### How to Switch to `dev`
Ensure you are on the `dev` branch by running:
```bash
git checkout dev
```

---

## 📂 Project Structure

- **`TheOh/theoh-breakfast`**: The Vite + React frontend application.
- **`backend`**: The Express.js backend server.
- **`supabase`**: Database schemas, SQL patches, and policy files.

---

## 🚀 Getting Started

To run the entire workspace locally (frontend + backend concurrently):

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Servers**:
   ```bash
   npm run dev
   ```
   *This command runs both the frontend and backend development servers concurrently.*
