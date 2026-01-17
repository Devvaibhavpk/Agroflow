"use client";
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from "@clerk/nextjs";

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/log', label: 'Logs' },
    {href: '/chatbot', label:"ChatBot"},
  ];

  const dropdownItems = [
    { href: '/settings', label: 'Settings' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link href="/">
          <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Image 
              src="/logo.png" 
              alt="Agroflow Logo" 
              width={40} 
              height={40}
              className="h-10 w-10"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              Agroflow
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-green-600",
                  pathname === link.href ? "text-green-600" : "text-gray-700"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="md:hidden text-gray-700 hover:text-green-600"
              >
                Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {[...links, ...dropdownItems].map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "text-sm",
                      pathname === item.href ? "text-green-600" : "text-gray-700"
                    )}
                  >
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="hidden md:flex text-gray-700 hover:text-green-600">
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {dropdownItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "text-sm",
                      pathname === item.href ? "text-green-600" : "text-gray-700"
                    )}
                  >
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {isSignedIn ? (
            <UserButton />
          ) : (
            <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
              <Link href="/signin">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}