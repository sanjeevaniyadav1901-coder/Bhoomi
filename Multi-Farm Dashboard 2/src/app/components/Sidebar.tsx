import { 
  Home, 
  LogOut, 
  Menu, 
  X, 
  Plus, 
  User,
  Leaf
} from 'lucide-react';
import { useState } from 'react';

export type SidebarPage = 
  | 'dashboard' 
  | 'add-crop' 
  | 'profile';

export const sidebarToTabMap: Record<SidebarPage, string> = {
  'dashboard': 'overview',
  'add-crop': 'add-crop',
  'profile': 'profile'
};

export const tabToSidebarMap: Record<string, SidebarPage> = {
  'overview': 'dashboard',
  'add-crop': 'add-crop',
  'profile': 'profile'
};

interface SidebarProps {
  userName: string;
  currentPage: SidebarPage;
  onNavigate: (page: SidebarPage) => void;
  onLogout: () => void;
}

// ✅ THIS is the key line - must have 'export function Sidebar'
export function Sidebar({ userName, currentPage, onNavigate, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { 
      id: 'dashboard' as SidebarPage, 
      label: 'Dashboard', 
      icon: Home,
      description: 'Overview'
    },
    { 
      id: 'add-crop' as SidebarPage, 
      label: 'Add New Crop', 
      icon: Plus,
      description: 'Register new crop'
    },
    { 
      id: 'profile' as SidebarPage, 
      label: 'Farmer Profile', 
      icon: User,
      description: 'Account settings'
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-green-600 text-white rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{userName}</h3>
              <p className="text-sm text-gray-500 truncate">Farmer</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left group ${
                  isActive
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{item.label}</div>
                  {item.description && (
                    <div className={`text-xs ${
                      isActive ? 'text-green-100' : 'text-gray-400'
                    } truncate`}>
                      {item.description}
                    </div>
                  )}
                </div>
                {isActive && (
                  <div className="w-1.5 h-8 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Branding */}
        <div className="flex-shrink-0 px-6 py-3 text-center text-sm text-gray-500 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Leaf className="w-4 h-4 text-green-600" />
            <p className="font-semibold text-green-600">BHOOMI</p>
          </div>
          <p className="text-xs">Your Personal Agro Partner</p>
          <p className="text-[10px] text-gray-400 mt-1">v2.0 • AI Powered</p>
        </div>

        {/* Logout Button */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}