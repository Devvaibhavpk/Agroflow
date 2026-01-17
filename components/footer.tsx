import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-12">
  <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
    {/* About Section */}
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Image 
          src="/logo.png" 
          alt="Agroflow Logo" 
          width={40} 
          height={40} 
        />
        <span className="text-2xl font-bold text-green-600">Agroflow</span>
      </div>
      <p className="text-gray-400">
        Empowering farmers with smart irrigation and real-time monitoring solutions.
      </p>
    </div>

    {/* Quick Links */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-green-600">Quick Links</h3>
      <ul className="space-y-2">
        <li><Link href="/about" className="text-gray-400 hover:text-green-600">About</Link></li>
        <li><Link href="/settings" className="text-gray-400 hover:text-green-600">Settings</Link></li>
      </ul>
    </div>

    

    {/* Social Media */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-green-600">Project Link</h3>
      <Link href="https://github.com/mithilgirish/Agroflow" className="flex items-center gap-2 text-gray-400 hover:text-green-600">
      <FontAwesomeIcon icon={faGithub} className="w-8 h-8"/>  
        <span>GitHub</span>
        </Link>
        
      </div>
    </div>

  {/* Copyright */}
  <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
    <p>&copy; {new Date().getFullYear()} Agroflow. All rights reserved.</p>
  </div>
</footer>
    );
}
