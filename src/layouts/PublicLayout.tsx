import React from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import LanguageSelector from "../components/LanguageSelector";

const PublicLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-bold text-gray-900">AmCbunq</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                to="/fonctionnalites"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                {t("nav.features")}
              </Link>
              <Link
                to="/tarifs"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                {t("nav.pricing")}
              </Link>
              <Link
                to="/aide"
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
                to="/connexion"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                {t("nav.login")}
              </Link>
              <Link
                to="/ouvrir-compte"
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
            <div className="px-4 py-3 space-y-1 bg-white border-t shadow-lg">
              {/* Mobile Navigation Links */}
              <div className="space-y-1">
                <Link
                  to="/fonctionnalites"
                  className="block px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                  onClick={handleMobileLinkClick}
                >
                  {t("nav.features")}
                </Link>
                <Link
                  to="/tarifs"
                  className="block px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                  onClick={handleMobileLinkClick}
                >
                  {t("nav.pricing")}
                </Link>
                <Link
                  to="/aide"
                  className="block px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                  onClick={handleMobileLinkClick}
                >
                  {t("nav.help")}
                </Link>
              </div>

              {/* Mobile Language Selector */}
              <div className="border-t pt-3">
                <div className="px-3 py-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.language')}
                  </label>
                  <LanguageSelector variant="buttons" />
                </div>
              </div>

              {/* Mobile Action Buttons */}
              <div className="border-t pt-3 space-y-2">
                <Link
                  to="/connexion"
                  className="block px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                  onClick={handleMobileLinkClick}
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/ouvrir-compte"
                  className="block px-3 py-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium bg-blue-50"
                  onClick={handleMobileLinkClick}
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
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-bold">AmCbunq</span>
              </div>
              <p className="text-gray-400 text-sm">
                {t("footer.description")}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">{t("footer.products")}</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/fonctionnalites" className="hover:text-white transition-colors">{t("nav.features")}</Link></li>
                <li><Link to="/tarifs" className="hover:text-white transition-colors">{t("nav.pricing")}</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">{t("footer.support")}</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/aide" className="hover:text-white transition-colors">{t("nav.help")}</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">{t("footer.contact")}</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">{t("footer.legal")}</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/privacy" className="hover:text-white transition-colors">{t("footer.privacy")}</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">{t("footer.terms")}</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 AmCbunq. {t("footer.rights")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout; 