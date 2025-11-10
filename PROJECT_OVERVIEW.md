# Shop Manager - Project Overview

## Executive Summary

Shop Manager is a comprehensive inventory and sales management system designed for small to medium-sized retail businesses. The application provides real-time inventory tracking, sales processing, financial reporting, and automated restocking alerts, all through an intuitive web-based interface with secure user authentication.

## Business Problem

Small shop owners need an efficient way to:
- Track inventory levels in real-time
- Process sales transactions quickly
- Monitor business performance through financial reports
- Identify products that need restocking
- Manage multiple expense categories
- Access business data securely from anywhere

## Solution

Shop Manager delivers a full-featured business management platform that enables shop owners to:
- **Manage Products**: Add products with purchase prices, selling prices, and stock quantities
- **Process Sales**: Quick checkout interface that automatically updates inventory and calculates profits
- **Track Finances**: Monitor sales, expenses, and net profit through comprehensive reports
- **Prevent Stockouts**: Automated low-stock alerts with printable restock reports
- **Analyze Performance**: View daily, weekly, and all-time business metrics
- **Secure Data**: User authentication ensures only authorized access to business information

## Key Features

### 1. Dashboard & Analytics
- Real-time business performance overview
- Total sales, expenses, and profit summaries
- Low stock product alerts
- Recent transaction history
- Visual profit trends with interactive charts

### 2. Inventory Management
- Complete product catalog with pricing and stock levels
- Weighted average cost tracking for accurate profit calculations
- Restock functionality with price adjustment support
- Automatic stock updates on sales
- Low stock threshold monitoring (below 5 units)

### 3. Sales Processing
- Dedicated point-of-sale interface
- Quick product selection and quantity input
- Automatic profit calculation
- Real-time inventory deduction
- Transaction history with detailed records

### 4. Financial Tracking
- Multiple transaction types: Product Sales, Service Income, Expenses
- Expense categorization (Supplies, Rent, Salaries, Utilities, Food, Other)
- Manual entry for non-product transactions
- Comprehensive transaction logging with timestamps

### 5. Reporting & Analytics
- **Daily & Weekly Reports**: Breakdown of sales, expenses, and profit by time period
- **Inventory Report**: Complete product listing with stock values and profit margins
- **Low Stock Report**: Printable restock list with current quantities and estimated costs
- **Price History Charts**: Visual representation of product pricing trends

### 6. Real-Time Synchronization
- Background data refresh every 1 second
- Seamless updates without page reload
- Multi-device support with instant synchronization
- Supabase real-time database integration

### 7. User Authentication
- Secure sign-up and sign-in system
- Protected routes requiring authentication
- Session management
- User-specific data isolation

## Technical Architecture

### Technology Stack
- **Frontend Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 6.2.0
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Routing**: React Router DOM 7.9.3
- **State Management**: React Context API
- **Date Handling**: date-fns 4.1.0
- **Backend**: Express.js 5.1.0
- **Authentication**: Supabase Auth

### Architecture Patterns
- **Component-Based Design**: Modular, reusable React components
- **Context API**: Centralized state management with DataContext and AuthContext
- **Custom Hooks**: Encapsulated business logic (useData, useTransactions)
- **Service Layer**: Separated data access logic (apiService, storageService, restockService)
- **Protected Routes**: Authentication-based access control
- **Responsive Design**: Mobile-first approach with Tailwind-inspired styling

### Project Structure
```
/
├── components/           # Reusable UI components
│   ├── Navbar.tsx       # Navigation bar with route links
│   ├── SummaryCard.tsx  # Dashboard metric cards
│   ├── TransactionList.tsx  # Transaction history display
│   ├── PriceHistoryChart.tsx  # Price trend visualization
│   ├── ProtectedRoute.tsx    # Authentication wrapper
│   └── icons.tsx        # SVG icon components
│
├── context/             # Global state management
│   ├── AuthContext.tsx  # User authentication state
│   ├── DataContext.tsx  # Products and transactions state
│   └── TransactionsContext.tsx  # Transaction-specific state
│
├── hooks/               # Custom React hooks
│   ├── useData.ts      # Data context consumer
│   └── useTransactions.ts  # Transaction operations
│
├── pages/               # Route-level components
│   ├── HomePage.tsx    # Dashboard with overview
│   ├── ProductsPage.tsx  # Product management
│   ├── SellPage.tsx    # Point-of-sale interface
│   ├── AddEntryPage.tsx  # Manual transaction entry
│   ├── ReportsPage.tsx  # Financial analytics
│   ├── InventoryReportPage.tsx  # Stock overview
│   ├── LowStockPage.tsx  # Restock report
│   ├── SignInPage.tsx  # User login
│   └── SignUpPage.tsx  # User registration
│
├── services/            # Business logic layer
│   ├── apiService.ts   # Supabase database operations
│   ├── storageService.ts  # Local storage fallback
│   └── restockService.ts  # Restock calculations
│
├── utils/               # Helper functions
│   └── priceCalculations.ts  # Profit and margin calculations
│
├── server/              # Backend API (Express)
│   ├── index.ts        # Server entry point
│   ├── db.ts           # Database connection
│   └── routes/         # API endpoints
│       ├── products.ts
│       ├── sales.ts
│       └── transactions.ts
│
└── supabase/            # Database migrations
    └── migrations/
        ├── create_products_and_transactions_tables.sql
        └── create_restock_history_table.sql
```

## Database Schema

### Products Table
- `id`: Unique identifier (UUID)
- `user_id`: Owner reference (UUID)
- `name`: Product name (text)
- `purchase_price`: Cost per unit (numeric)
- `selling_price`: Sale price per unit (numeric)
- `stock`: Current quantity (integer)
- `weighted_avg_cost`: Average cost for profit tracking (numeric)
- `created_at`: Timestamp

### Transactions Table
- `id`: Unique identifier (UUID)
- `user_id`: Owner reference (UUID)
- `date`: Transaction timestamp
- `type`: Sale/Service/Expense (text)
- `category`: Transaction category (text)
- `amount`: Transaction value (numeric)
- `description`: Details (text)
- `product_id`: Related product (UUID, optional)
- `quantity`: Items sold (integer, optional)
- `profit`: Calculated profit (numeric, optional)
- `created_at`: Timestamp

### Restock History Table
- `id`: Unique identifier (UUID)
- `user_id`: Owner reference (UUID)
- `product_id`: Related product (UUID)
- `quantity`: Units added (integer)
- `purchase_price`: Cost per unit (numeric)
- `selling_price`: New selling price (numeric)
- `notes`: Additional information (text)
- `created_at`: Timestamp

## Security Features

### Row Level Security (RLS)
- All tables protected with RLS policies
- Users can only access their own data
- Authenticated access required for all operations
- Automatic user_id filtering on queries

### Authentication
- Supabase email/password authentication
- Protected routes with authentication checks
- Secure session management
- Automatic redirect for unauthenticated users

## Performance Optimizations

- **Background Refresh**: Data updates every second without loading states
- **Optimistic Updates**: Immediate UI feedback before server confirmation
- **Memoization**: Calculated values cached to prevent unnecessary recalculations
- **Weighted Average Cost**: Accurate profit tracking across multiple restocks
- **Database Indexing**: Fast queries on user_id and product_id fields

## Use Cases

### Daily Operations
1. **Morning Setup**: Check dashboard for low stock alerts
2. **Sales Processing**: Use Sell page for quick transactions
3. **Inventory Management**: Restock products as needed
4. **Manual Entries**: Log service income or expenses

### Weekly Management
1. **Performance Review**: Analyze weekly sales and expense reports
2. **Inventory Audit**: Review inventory report for stock accuracy
3. **Restock Planning**: Generate and print low stock report
4. **Financial Analysis**: Compare weekly profit trends

### Business Decisions
1. **Pricing Strategy**: Review profit margins on inventory report
2. **Product Performance**: Analyze sales history per product
3. **Cost Management**: Track expense categories for budget control
4. **Inventory Optimization**: Adjust restock levels based on sales velocity

## Future Enhancement Opportunities

1. **Multi-Location Support**: Manage inventory across multiple stores
2. **Supplier Management**: Track supplier information and purchase orders
3. **Barcode Scanning**: Quick product lookup and sales processing
4. **Customer Management**: Track customer purchases and loyalty programs
5. **Advanced Analytics**: Sales forecasting and trend predictions
6. **Mobile App**: Native iOS/Android applications
7. **Export Functionality**: CSV/PDF export for reports and records
8. **Tax Calculation**: Automatic tax computation on sales
9. **Employee Management**: Multiple user roles with permissions
10. **Integration APIs**: Connect with accounting software and payment processors

## Deployment

The application is designed for web deployment and can be hosted on:
- Vercel (recommended for static hosting)
- Netlify
- AWS S3 + CloudFront
- Any static hosting provider with SPA support

Current deployment: https://chi-shop-manager.vercel.app/

## Conclusion

Shop Manager provides a complete, professional-grade solution for small business inventory and sales management. Its real-time synchronization, comprehensive reporting, and user-friendly interface make it an invaluable tool for shop owners seeking to streamline operations and gain insights into their business performance. The secure, cloud-based architecture ensures data accessibility while maintaining privacy and security through industry-standard authentication and database protection.
