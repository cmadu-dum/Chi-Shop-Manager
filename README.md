# Shop Manager

A modern, responsive web application designed for small shop owners to effortlessly track sales, manage expenses, and keep an eye on inventory. The app works completely offline, storing all data securely in your browser.

## ✨ Key Features

-   **📊 Financial Dashboard:** Get an at-a-glance overview of your business's performance with an all-time financial summary.
-   **📈 Detailed Reports:** View daily and weekly summaries of sales, expenses, and net profit.
-   **💸 Transaction Logging:** Easily record product sales, service income, and various business expenses with categorization.
-   **📦 Inventory Management:** Add products to your inventory, including purchase price, selling price, and stock quantity.
-   **🛒 Streamlined Selling:** A dedicated "Sell" page allows you to quickly record sales of inventory items, automatically updating stock levels and calculating profit.
-   **⚠️ Low Stock Alerts:** Receive automatic alerts on your dashboard when product stock falls below a predefined threshold.
-   **🌐 Offline First:** All data is stored locally in your browser using `localforage`, so the app works perfectly even without an internet connection. Your data persists between sessions.
-   **📱 Responsive Design:** A clean, mobile-friendly interface built with Tailwind CSS ensures a great experience on any device.

## 🛠️ Tech Stack

-   **Frontend:** [React](https://react.dev/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Routing:** [React Router](https://reactrouter.com/)
-   **Client-Side Storage:** [localforage](https://github.com/localForage/localForage) (uses IndexedDB, WebSQL, or localStorage)
-   **Utilities:** [date-fns](https://date-fns.org/) for date manipulation

## 🚀 Getting Started

This project is a static web application and requires no build step or local server to run.

1.  Ensure all project files (`index.html`, `index.tsx`, etc.) are in the same directory.
2.  Open the `index.html` file in your web browser.

That's it! The application will load, and you can start managing your shop.

## 📂 Project Structure

The project is organized into logical directories to maintain clean and scalable code:

```
/
├── components/       # Reusable React components (Navbar, SummaryCard, etc.)
├── context/          # React Context for global state management (DataContext)
├── hooks/            # Custom hooks (useData)
├── pages/            # Top-level page components for each route
├── services/         # Modules for external interactions (e.g., storageService)
├── App.tsx           # Main application component with routing setup
├── constants.ts      # Application-wide constants
├── index.html        # The main HTML entry point
├── index.tsx         # The main React entry point
├── types.ts          # TypeScript type definitions
└── README.md         # This file
```

## ⚙️ How It Works

-   **State Management:** The application uses React's Context API (`DataContext`) as a centralized store. This provider handles all data (transactions, products), business logic, and interactions with the storage service, making the state accessible throughout the component tree.
-   **Data Persistence:** `localforage` is used to provide a simple, asynchronous key-value storage API. It intelligently chooses the best backend available in the browser (IndexedDB by default), ensuring that all your shop data is saved persistently and is available offline.
-   **Routing:** Client-side navigation is handled by `react-router-dom` using `HashRouter`, which is ideal for static web apps that don't have a server configured for deep linking.
