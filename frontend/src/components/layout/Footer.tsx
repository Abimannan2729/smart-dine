import React from 'react';
import { Link } from 'react-router-dom';
import { 
  QrCode,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Heart,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import SmartDineLogo from '../ui/SmartDineLogo';

const Footer: React.FC = () => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  const companyLinks = [
    { name: 'About Us', href: '#about' },
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '#contact' },
  ];

  const supportLinks = [
    { name: 'Help Center', href: '#help' },
    { name: 'Documentation', href: '#docs' },
    { name: 'API Reference', href: '#api' },
    { name: 'System Status', href: '#status' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Terms of Service', href: '#terms' },
    { name: 'Cookie Policy', href: '#cookies' },
    { name: 'GDPR', href: '#gdpr' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com', color: 'hover:text-blue-600' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com', color: 'hover:text-sky-500' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com', color: 'hover:text-pink-600' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com', color: 'hover:text-blue-700' },
  ];

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white transition-colors duration-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <SmartDineLogo size={32} />
              <div className="flex flex-col">
                <span className="text-xl font-bold">
                  Smart<span className="text-amber-400 dark:text-amber-300">Dine</span>
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">Crete</span>
              </div>
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-6 leading-relaxed">
              Transform your restaurant with digital menus, QR code ordering, and seamless customer experiences. 
              Make dining smart, simple, and contactless.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-400 dark:text-gray-500">
                <Mail size={16} className="text-primary-400 dark:text-primary-300" />
                <span>hello@smartdine.com</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-400 dark:text-gray-500">
                <Phone size={16} className="text-primary-400 dark:text-primary-300" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-400 dark:text-gray-500">
                <MapPin size={16} className="text-primary-400 dark:text-primary-300" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white dark:text-gray-100">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-200 text-sm transition-colors duration-200"
                    onClick={(e) => {
                      if (link.href.startsWith('#')) {
                        e.preventDefault();
                        const element = document.querySelector(link.href);
                        element?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white dark:text-gray-100">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-200 text-sm transition-colors duration-200 flex items-center space-x-1"
                    onClick={(e) => {
                      if (link.href.startsWith('#')) {
                        e.preventDefault();
                        // For now, just prevent default since these are placeholders
                      }
                    }}
                  >
                    <span>{link.name}</span>
                    {!link.href.startsWith('#') && <ExternalLink size={12} />}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white dark:text-gray-100">Legal</h3>
            <ul className="space-y-3 mb-6">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-200 text-sm transition-colors duration-200"
                    onClick={(e) => {
                      if (link.href.startsWith('#')) {
                        e.preventDefault();
                        // For now, just prevent default since these are placeholders
                      }
                    }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

            {/* Newsletter Signup */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-white dark:text-gray-100">Stay Updated</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-gray-800 dark:bg-gray-900 border border-gray-700 dark:border-gray-600 rounded-l-lg text-sm text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary-500 dark:focus:border-primary-400 transition-colors"
                />
                <button className="px-4 py-2 bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-600 rounded-r-lg transition-colors">
                  <Mail size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="border-t border-gray-800 dark:border-gray-700 pt-8 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-400 dark:text-gray-500 ${social.color} transition-colors duration-200 p-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-800/50`}
                    aria-label={social.name}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
            <div className="text-sm text-gray-400 dark:text-gray-500 flex items-center space-x-1">
              <span>© {currentYear} Smart Dine Crete. Made with</span>
              <Heart size={16} className="text-red-500" />
              <span>for restaurants worldwide.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 dark:border-gray-700 bg-gray-900/50 dark:bg-gray-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 dark:text-gray-600 space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <span>All rights reserved.</span>
              <span>•</span>
              <span>Built with React & TypeScript</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Version 1.0.0</span>
              <span>•</span>
              <Link 
                to="#demo" 
                className="hover:text-primary-400 dark:hover:text-primary-300 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.querySelector('#demo');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Try Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;