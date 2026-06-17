## 📁 Folder Structure

### Client Structure

```bash
client/src/
├── assets/             # Static files (images, global icons)
├── components/         # Reusable shared UI components (buttons, modals, inputs)
├── config/             # Environment variables and global configuration
├── features/           # Feature-based modules
│   ├── mentorship/
│   │   ├── api/        # API calls related to mentorship
│   │   ├── components/ # Components used only within mentorship
│   │   ├── hooks/      # Custom hooks (e.g., useMentorshipRequests)
│   │   └── index.js    # Public exports for the feature
│   ├── messaging/
│   ├── jobs/
│   └── events/
├── hooks/              # Shared custom hooks (e.g., useAuth, useTheme)
├── layouts/            # Application layouts (Sidebar, Navbar, etc.)
├── pages/              # Route-level pages that compose features
├── routes/             # React Router configuration
├── store/              # Global state management (Redux/Zustand)
├── styles/             # Global styles and Tailwind configuration
└── utils/              # Utility functions and helpers
```

### Server Structure

```bash
server/src/
├── api/
│   ├── middlewares/    # Authentication, error handling, rate limiting
│   └── routes/         # Express route definitions
├── config/             # Database connections and environment configuration
├── modules/            # Feature-based business domains
│   ├── users/
│   │   ├── user.controller.js  # Handles HTTP requests and responses
│   │   ├── user.service.js     # Business logic layer
│   │   └── user.model.js       # Mongoose schema/model
│   ├── mentorship/
│   ├── jobs/
│   └── messaging/
├── services/           # Third-party integrations (AWS S3, Email, SMS, etc.)
├── utils/              # Custom utilities, loggers, and error classes
└── app.js              # Express application setup and middleware pipeline
```
