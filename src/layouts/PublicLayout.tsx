import React from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Globe, Menu, X } from "lucide-react";
import { useState } from "react";

const PublicLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const languages = [
    { code: "fr", name: t("languages.fr") as string },
    { code: "en", name: t("languages.en") as string },
    { code: "es", name: t("languages.es") as string },
    { code: "pt", name: t("languages.pt") as string },
    { code: "it", name: t("languages.it") as string },
    { code: "nl", name: t("languages.nl") as string },
    { code: "de", name: t("languages.de") as string },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsLanguageOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
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
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/fonctionnalites"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {t("nav.features")}
              </Link>
              <Link
                to="/tarifs"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {t("nav.pricing")}
              </Link>
              <Link
                to="/aide"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {t("nav.help")}
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">
                    {languages.find(lang => lang.code === i18n.language)?.name || (t("languages.fr") as string)}
                  </span>
                </button>

                {isLanguageOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => changeLanguage(language.code)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {language.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/connexion"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {t("nav.login")}
              </Link>
              <Link
                to="/ouvrir-compte"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t("nav.openAccount")}
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link
                to="/fonctionnalites"
                className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.features")}
              </Link>
              <Link
                to="/tarifs"
                className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.pricing")}
              </Link>
              <Link
                to="/aide"
                className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.help")}
              </Link>
              <div className="border-t pt-2">
                <Link
                  to="/connexion"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/ouvrir-compte"
                  className="block px-3 py-2 text-blue-600 hover:text-blue-700"
                  onClick={() => setIsMenuOpen(false)}
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
                <li><Link to="/fonctionnalites" className="hover:text-white">{t("nav.features")}</Link></li>
                <li><Link to="/tarifs" className="hover:text-white">{t("nav.pricing")}</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">{t("footer.support")}</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/aide" className="hover:text-white">{t("nav.help")}</Link></li>
                <li><Link to="/contact" className="hover:text-white">{t("footer.contact")}</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">{t("footer.legal")}</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/privacy" className="hover:text-white">{t("footer.privacy")}</Link></li>
                <li><Link to="/terms" className="hover:text-white">{t("footer.terms")}</Link></li>
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