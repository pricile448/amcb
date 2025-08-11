import React from "react";
import { Outlet, Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import LanguageSelector from "../components/LanguageSelector";
import Logo from "../components/Logo";

const PublicLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { lang } = useParams<{ lang: string }>();

  // Synchroniser la langue au chargement
  useEffect(() => {
    const storedLanguage = localStorage.getItem('i18nextLng');
    if (storedLanguage && storedLanguage !== i18n.language) {
      i18n.changeLanguage(storedLanguage);
    }
  }, [i18n]);

  // Fermer le menu mobile quand on clique sur un lien
  const handleMobileLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Fonction pour générer les liens avec préfixe de langue
  const getLink = (path: string) => {
    if (!lang) return path;
    // Éviter les doubles slashes
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `/${lang}${cleanPath}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to={getLink('/')}>
                <Logo variant="full" size="md" showTagline={false} />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                to={getLink('/')}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                {t("nav.home")}
              </Link>
              <Link
                to={getLink('/fonctionnalites')}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                {t("nav.features")}
              </Link>
              <Link
                to={getLink('/tarifs')}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                {t("nav.pricing")}
              </Link>
              <Link
                to={getLink('/aide')}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                {t("nav.help")}
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Language Selector */}
              <LanguageSelector />

              <Link
                to={getLink('/connexion')}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                {t("nav.login")}
              </Link>
              <Link
                to={getLink('/ouvrir-compte')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {t("nav.openAccount")}
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-3 sm:px-4 py-3 space-y-1 bg-white border-t shadow-lg">
              {/* Mobile Navigation Links */}
              <Link
                to={getLink('/')}
                onClick={handleMobileLinkClick}
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
              >
                {t("nav.home")}
              </Link>
              <Link
                to={getLink('/fonctionnalites')}
                onClick={handleMobileLinkClick}
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
              >
                {t("nav.features")}
              </Link>
              <Link
                to={getLink('/tarifs')}
                onClick={handleMobileLinkClick}
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
              >
                {t("nav.pricing")}
              </Link>
              <Link
                to={getLink('/aide')}
                onClick={handleMobileLinkClick}
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
              >
                {t("nav.help")}
              </Link>
              
              {/* Divider */}
              <div className="border-t border-gray-200 my-2"></div>
              
              {/* Mobile Actions */}
              <div className="px-3 py-2">
                <LanguageSelector variant="buttons" />
              </div>
              
              {/* Mobile Action Buttons - Improved Responsiveness */}
              <div className="space-y-3 px-3 py-2">
                <Link
                  to={getLink('/connexion')}
                  onClick={handleMobileLinkClick}
                  className="block w-full px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors font-medium text-center border border-gray-200 hover:border-blue-200"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to={getLink('/ouvrir-compte')}
                  onClick={handleMobileLinkClick}
                  className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center shadow-sm hover:shadow-md"
                >
                  {t("nav.openAccount")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {/* Company Info */}
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Logo variant="simple" size="sm" cardStyle={true} />
              </div>
              <p className="text-gray-300 mb-4 text-sm sm:text-base">
                {t("footer.description")}
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M19 0H5a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-span-1">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t("footer.quickLinks")}</h3>
              <ul className="space-y-1 sm:space-y-2">
                <li>
                  <Link to={getLink('/fonctionnalites')} className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                    {t("nav.features")}
                  </Link>
                </li>
                <li>
                  <Link to={getLink('/tarifs')} className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                    {t("nav.pricing")}
                  </Link>
                </li>
                <li>
                  <Link to={getLink('/aide')} className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                    {t("nav.help")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="col-span-1">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t("footer.support")}</h3>
              <ul className="space-y-1 sm:space-y-2">
                <li>
                  <Link to={getLink('/aide')} className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                    {t("footer.helpCenter")}
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@amcbunq.com" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                    {t("footer.contact")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-sm sm:text-base">&copy; 2024 AmCbunq. {t("footer.rights")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout; 