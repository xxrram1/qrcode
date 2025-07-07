
import { QrCode, Scan, CreditCard, History, Menu } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import UserProfile from "./UserProfile";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const navItems = [
    { name: "หน้าหลัก", path: "/", icon: QrCode },
    { name: "สแกน QR", path: "/scan", icon: Scan },
    { name: "สร้าง QR", path: "/create", icon: QrCode },
    { name: "การชำระเงิน", path: "/payment", icon: CreditCard },
    { name: "ประวัติ", path: "/history", icon: History },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                QR Master Pro
              </span>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-100 to-green-100 text-blue-700 shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="hidden md:block">
                <UserProfile />
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button asChild variant="ghost" size="sm">
                  <NavLink to="/auth">เข้าสู่ระบบ</NavLink>
                </Button>
                <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-green-600">
                  <NavLink to="/auth">สมัครสมาชิก</NavLink>
                </Button>
              </div>
            )}

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64 bg-white">
                  <nav className="flex flex-col space-y-2 mt-8">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? "bg-gradient-to-r from-blue-100 to-green-100 text-blue-700 shadow-md"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                          }`
                        }
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </NavLink>
                    ))}
                    
                    {/* Mobile Auth Section */}
                    <div className="pt-4 border-t border-gray-200 space-y-2">
                      {user ? (
                        <div className="px-4">
                          <UserProfile />
                        </div>
                      ) : (
                        <>
                          <NavLink
                            to="/auth"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-all duration-200"
                          >
                            เข้าสู่ระบบ
                          </NavLink>
                          <NavLink
                            to="/auth"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600 to-green-600 text-white transition-all duration-200"
                          >
                            สมัครสมาชิก
                          </NavLink>
                        </>
                      )}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
