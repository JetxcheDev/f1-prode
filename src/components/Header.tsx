'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, Palette, Sun, Moon, Monitor } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { setTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const getUserInitial = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="bg-gradient-to-r from-red-600 to-red-700 shadow-lg border-b border-red-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-white hover:text-gray-200 transition-colors">
                Prode F1
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/ranking">
              <Button 
                variant="ghost" 
                className="text-white hover:text-gray-200 hover:bg-red-800 font-medium"
              >
                Ranking
              </Button>
            </Link>
            <Link href="/historico">
              <Button 
                variant="ghost" 
                className="text-white hover:text-gray-200 hover:bg-red-800 font-medium"
              >
                Histórico
              </Button>
            </Link>
            <Link href="/vote">
              <Button 
                variant="ghost" 
                className="text-white hover:text-gray-200 hover:bg-red-800 font-medium"
              >
                Votar
              </Button>
            </Link>
          </nav>

          <nav className="md:hidden flex items-center space-x-4">
            <Link href="/ranking">
              <Button size="sm" variant="ghost" className="text-white hover:bg-red-800">
                Ranking
              </Button>
            </Link>
            <Link href="/historico">
              <Button size="sm" variant="ghost" className="text-white hover:bg-red-800">
                Histórico
              </Button>
            </Link>
            <Link href="/vote">
              <Button size="sm" variant="ghost" className="text-white hover:bg-red-800">
                Votar
              </Button>
            </Link>
          </nav>

          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-white">
                    <AvatarImage 
                      src={user?.photoURL || ''} 
                      alt={user?.displayName || user?.email || 'Usuario'} 
                    />
                    <AvatarFallback className="bg-white text-red-600 font-semibold">
                      {getUserInitial()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Editar Perfil</DialogTitle>
                      <DialogDescription>
                        Actualiza tu información personal y configuración de cuenta.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          Funcionalidad de edición de perfil próximamente...
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <DropdownMenu open={isThemeOpen} onOpenChange={setIsThemeOpen}>
                  <DropdownMenuTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Palette className="mr-2 h-4 w-4" />
                      <span>Tema</span>
                    </DropdownMenuItem>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="left" align="start">
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Claro</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Oscuro</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      <Monitor className="mr-2 h-4 w-4" />
                      <span>Sistema</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}