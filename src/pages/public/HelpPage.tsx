import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, ChevronDown, ChevronRight, MessageCircle, Mail, Phone } from "lucide-react";

const HelpPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: t("help.faq1.question"),
      answer: t("help.faq1.answer"),
    },
    {
      id: 2,
      question: t("help.faq2.question"),
      answer: t("help.faq2.answer"),
    },
    {
      id: 3,
      question: t("help.faq3.question"),
      answer: t("help.faq3.answer"),
    },
    {
      id: 4,
      question: t("help.faq4.question"),
      answer: t("help.faq4.answer"),
    },
    {
      id: 5,
      question: t("help.faq5.question"),
      answer: t("help.faq5.answer"),
    },
  ];

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t("help.title")}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            {t("help.subtitle")}
          </p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t("help.searchPlaceholder") as string}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("help.faqTitle")}
            </h2>
            <p className="text-xl text-gray-600">
              {t("help.faqSubtitle")}
            </p>
          </div>

          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {expandedFaq === faq.id ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("help.contactTitle")}
            </h2>
            <p className="text-xl text-gray-600">
              {t("help.contactSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("help.liveChat")}
              </h3>
              <p className="text-gray-600 mb-4">
                {t("help.liveChatDescription")}
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                {t("help.startChat")}
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("help.email")}
              </h3>
              <p className="text-gray-600 mb-4">
                {t("help.emailDescription")}
              </p>
              <a
                href="mailto:support@amcbunq.com"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block"
              >
                {t("help.sendEmail")}
              </a>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("help.phone")}
              </h3>
              <p className="text-gray-600 mb-4">
                {t("help.phoneDescription")}
              </p>
              <a
                href="tel:+33123456789"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-block"
              >
                {t("help.callUs")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("help.quickLinks")}
            </h2>
            <p className="text-xl text-gray-600">
              {t("help.quickLinksSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">
                {t("help.gettingStarted")}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {t("help.gettingStartedDescription")}
              </p>
              <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                {t("help.learnMore")} →
              </a>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">
                {t("help.accountSecurity")}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {t("help.accountSecurityDescription")}
              </p>
              <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                {t("help.learnMore")} →
              </a>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">
                {t("help.transfers")}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {t("help.transfersDescription")}
              </p>
              <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                {t("help.learnMore")} →
              </a>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">
                {t("help.troubleshooting")}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {t("help.troubleshootingDescription")}
              </p>
              <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                {t("help.learnMore")} →
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpPage; 