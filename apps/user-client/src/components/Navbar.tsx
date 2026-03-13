import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../features/auth';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-14">
        <Link to="/" className="text-sm font-semibold text-gray-900 dark:text-white">
          {'weekly-trend'}
        </Link>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {user?.picture ? (
              <img src={user.picture} alt="" className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                {user?.name?.charAt(0) || '?'}
              </div>
            )}
            <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
              {user?.email}
            </span>
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-1">
                <button
                  onClick={() => { logout(); setShowDropdown(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
