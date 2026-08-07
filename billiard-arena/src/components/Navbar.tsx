import React from 'react';
import { LayoutGrid, Package, Users, CalendarCheck, Receipt, Ticket, ShieldAlert } from 'lucide-react';

export type ActiveTab = 'pos' | 'inventory' | 'customers' | 'bookings' | 'invoices';

interface NavbarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  lowStockCount?: number;
  pendingBookingsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  lowStockCount = 0,
  pendingBookingsCount = 0,
}) => {
  const tabs = [
    {
      id: 'pos' as ActiveTab,
      label: 'Sơ đồ bàn (POS)',
      icon: LayoutGrid,
      badge: null,
    },
    {
      id: 'inventory' as ActiveTab,
      label: 'Quản lý kho & Đồ ăn',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} sắp hết` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'customers' as ActiveTab,
      label: 'Khách hàng (CRM)',
      icon: Users,
      badge: null,
    },
    {
      id: 'bookings' as ActiveTab,
      label: 'Lịch đặt bàn',
      icon: CalendarCheck,
      badge: pendingBookingsCount > 0 ? `${pendingBookingsCount}` : null,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'invoices' as ActiveTab,
      label: 'Hóa đơn & Doanh thu',
      icon: Receipt,
      badge: null,
    },
  ];

  return (
    <nav className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4">
      <div className="max-w-7xl mx-auto flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold border ${
                    isActive ? 'bg-slate-950/20 text-slate-950 border-slate-950/30' : tab.badgeColor
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
