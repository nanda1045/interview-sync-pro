# Contributing to InterviewSync Pro

Thank you for your interest in contributing to InterviewSync Pro! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Maintain a positive and collaborative environment

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

1. **Clear title and description** - Explain what the bug is
2. **Steps to reproduce** - Provide detailed steps to reproduce the issue
3. **Expected behavior** - What should happen instead
4. **Actual behavior** - What actually happens
5. **Environment** - OS, Node.js version, browser version
6. **Screenshots** - If applicable, include screenshots or GIFs

### Suggesting Features

Feature suggestions are welcome! Please create an issue with:

1. **Clear title** - Brief description of the feature
2. **Use case** - Why this feature would be useful
3. **Proposed implementation** - If you have ideas on how to implement it
4. **Alternatives considered** - Other approaches you've thought about

### Pull Requests

1. **Fork the repository** and create your branch from `main`
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Follow the coding standards**:
   - Use TypeScript for all new code
   - Follow existing code style and formatting
   - Write meaningful commit messages
   - Add comments for complex logic

3. **Test your changes**:
   - Test locally in development mode
   - Ensure all existing tests pass (if applicable)
   - Test in both client and server

4. **Update documentation**:
   - Update README.md if needed
   - Add JSDoc comments for new functions
   - Update type definitions if adding new types

5. **Commit your changes**:
   ```bash
   git commit -m "Add amazing feature"
   ```
   Use clear, descriptive commit messages following conventional commits format:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for adding tests
   - `chore:` for maintenance tasks

6. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Create a Pull Request**:
   - Provide a clear title and description
   - Reference any related issues
   - Describe what changes you made and why
   - Include screenshots if UI changes are involved

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB (local or Atlas)
- Git

### Setup Steps

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/your-username/InterviewSync.git
   cd InterviewSync
   ```

2. **Install dependencies**:
   ```bash
   # Client
   cd client
   npm install

   # Server
   cd ../server
   npm install
   ```

3. **Set up environment variables** (see README.md for details):
   - Create `.env.local` in `/client`
   - Create `.env` in `/server`

4. **Start development servers**:
   ```bash
   # Terminal 1 - Server
   cd server
   npm run dev

   # Terminal 2 - Client
   cd client
   npm run dev
   ```

## Coding Guidelines

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types - use proper types or `unknown`
- Define interfaces for complex objects
- Use type guards when needed

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings (or double quotes consistently)
- Use trailing commas in multi-line objects/arrays
- Add semicolons at the end of statements
- Maximum line length: 100 characters

### Component Structure

```typescript
// 1. Imports
import { ... } from '...';

// 2. Types/Interfaces
interface ComponentProps {
  // ...
}

// 3. Component
export default function Component({ prop }: ComponentProps) {
  // Hooks
  // State
  // Effects
  // Handlers
  // Render
  return (
    // JSX
  );
}
```

### Naming Conventions

- **Components**: PascalCase (`VideoChat.tsx`)
- **Functions**: camelCase (`handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_PARTICIPANTS`)
- **Types/Interfaces**: PascalCase (`Problem`, `RoomState`)
- **Files**: Match the main export (component name for React components)

### Git Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

Examples:
- `feat(video): add mute/unmute controls`
- `fix(timer): sync timer across all participants`
- `docs(readme): update installation instructions`

## Project Structure

### Client (`/client`)

- `/app` - Next.js App Router pages and routes
- `/components` - React components
- `/lib` - Utility functions and providers
- `/public` - Static assets

### Server (`/server`)

- `/src/index.ts` - Express server entry point
- `/src/routes` - API route handlers
- `/src/models` - Mongoose models
- `/src/services` - Business logic
- `/src/utils` - Utility functions

### Shared (`/shared`)

- Type definitions shared between client and server

## Testing

- Test manually in development mode
- Test WebRTC functionality with multiple browser tabs/windows
- Test real-time synchronization with multiple participants
- Verify dark/light mode works correctly
- Test on different browsers (Chrome, Firefox, Safari)

## Areas for Contribution

We welcome contributions in these areas:

- **New Features**: Additional interview features, UI improvements
- **Bug Fixes**: Fixing reported issues
- **Documentation**: Improving docs, adding examples
- **Performance**: Optimizing code execution, reducing bundle size
- **Testing**: Adding tests, improving test coverage
- **Accessibility**: Improving keyboard navigation, screen reader support
- **Internationalization**: Adding multi-language support

## Questions?

If you have questions, feel free to:

1. Create an issue with the `question` label
2. Check existing issues and discussions
3. Review the codebase and documentation

## License

By contributing to InterviewSync Pro, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to InterviewSync Pro! 🎉

