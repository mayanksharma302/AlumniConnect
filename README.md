#Folder Structure
bash`
client/src/
├── assets/             # Static files (images, global icons)
├── components/         # Global shared UI (SaaS-style buttons, modals, inputs)
├── config/             # Environment variables and global config
├── features/           # The core of your application
│   ├── mentorship/
│   │   ├── api/        # API calls specific to mentorship
│   │   ├── components/ # UI components only used here
│   │   ├── hooks/      # Custom hooks (e.g., useMentorshipRequests)
│   │   └── index.js    # Public API for this feature
│   ├── messaging/
│   ├── jobs/
│   └── events/
├── hooks/              # Global shared hooks (e.g., useAuth, useTheme)
├── layouts/            # Page wrappers (Sidebar, Navbar layouts)
├── pages/              # Route components (stitches features together)
├── routes/             # React Router configuration
├── store/              # Global state management (Zustand or Redux)
├── styles/             # Global CSS/Tailwind configs
└── utils/              # Helper functions (date formatters, validators)`
bash`
server/src/
├── api/
│   ├── middlewares/    # Auth, error handling, rate limiting
│   └── routes/         # Express route definitions
├── config/             # DB connections, environment variables
├── modules/            # Feature-based domain logic
│   ├── users/
│   │   ├── user.controller.js  # Handles HTTP requests/responses
│   │   ├── user.service.js     # Pure business logic
│   │   └── user.model.js       # Mongoose schema
│   ├── mentorship/
│   ├── jobs/
│   └── messaging/
├── services/           # Third-party integrations (AWS S3, Email, SMS)
├── utils/              # Custom errors, loggers
└── app.js              # Express app setup and middleware pipeline
`
