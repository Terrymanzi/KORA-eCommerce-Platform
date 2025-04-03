# KORA E-commerce Platform

KORA is a comprehensive e-commerce platform designed to connect wholesalers and dropshippers in Rwanda. The platform enables wholesalers to list their products, dropshippers to create partnerships with wholesalers, and customers to purchase products through dropshipper stores.

## Features

- Multi-role user system (Admin, Wholesaler, Dropshipper, Customer)
- Product management and categorization
- Partnership system between wholesalers and dropshippers
- Store creation and management
- Shopping cart and checkout functionality
- Order management
- Admin dashboard with platform oversight
- Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom authentication with Supabase
- **State Management**: React Context API
- **Styling**: Tailwind CSS with shadcn/ui components

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/kora-ecommerce.git
cd kora-ecommerce
```

###2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```bash
kora-ecommerce/
├── app/                  # Next.js app directory
│   ├── admin/            # Admin dashboard pages
│   ├── dashboard/        # User dashboard pages
│   ├── products/         # Product catalog pages
│   ├── cart/             # Shopping cart page
│   ├── checkout/         # Checkout page
│   ├── login/            # Authentication pages
│   ├── signup/           # User registration
│   └── ...
├── components/           # Reusable UI components
├── contexts/             # React context providers
├── lib/                  # Utility functions and services
│   └── supabase/         # Supabase client and services
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## User Roles

- **Admin**: Platform oversight, user management, store verification
- **Wholesaler**: Product management, partnership approval, order fulfillment
- **Dropshipper**: Store creation, partnership requests, product selection
- **Customer**: Browsing products, making purchases, tracking orders

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
