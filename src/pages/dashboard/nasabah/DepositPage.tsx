import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowDownToLine } from 'lucide-react';

/**
 * Wrapper page for the Deposit section.
 * Provides tab navigation between /deposit/request and /deposit/history.
 */
export default function DepositPage() {
  const location = useLocation();

  const tabs = [
    { label: 'Request Penjemputan', href: '/dashboard/deposit/request' },
    { label: 'Riwayat Request', href: '/dashboard/deposit/history' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Page Title */}
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
          <ArrowDownToLine className="h-6 w-6 text-emerald-600" />
          Setor Sampah
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Buat request penjemputan sampah atau lihat riwayat.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-lg border border-gray-100 bg-gray-50/50 p-1">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.href;
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={`flex-1 rounded-md px-4 py-2 text-center text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Tab Content */}
      <Outlet />
    </motion.div>
  );
}
