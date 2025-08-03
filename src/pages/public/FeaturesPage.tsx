import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Shield,
  CreditCard,
  TrendingUp,
  Send,
  Globe,
  Smartphone,
  Lock,
  Zap,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const FeaturesPage: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Shield,
      title: t("features.security.title"),
      description: t("features.security.description"),
      benefits: [
        t("features.security.benefit1"),
        t("features.security.benefit2"),
        t("features.security.benefit3"),
      ],
    },
    {
      icon: CreditCard,
      title: t("features.accounts.title"),
      description: t("features.accounts.description"),
      benefits: [
        t("features.accounts.benefit1"),
        t("features.accounts.benefit2"),
        t("features.accounts.benefit3"),
      ],
    },
    {
      icon: TrendingUp,
      title: t("features.transactions.title"),
      description: t("features.transactions.description"),
      benefits: [
        t("features.transactions.benefit1"),
        t("features.transactions.benefit2"),
        t("features.transactions.benefit3"),
      ],
    },
    {
      icon: Send,
      title: t("features.transfers.title"),
      description: t("features.transfers.description"),
      benefits: [
        t("features.transfers.benefit1"),
        t("features.transfers.benefit2"),
        t("features.transfers.benefit3"),
      ],
    },
    {
      icon: Globe,
      title: t("features.international.title"),
      description: t("features.international.description"),
      benefits: [
        t("features.international.benefit1"),
        t("features.international.benefit2"),
        t("features.international.benefit3"),
      ],
    },
    {
      icon: Smartphone,
      title: t("features.mobile.title"),
      description: t("features.mobile.description"),
      benefits: [
        t("features.mobile.benefit1"),
        t("features.mobile.benefit2"),
        t("features.mobile.benefit3"),
      ],
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t("features.hero.title")}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            {t("features.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm text-gray-700">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t("features.cta.title")}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t("features.cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/ouvrir-compte"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
            >
              {t("features.cta.openAccount")}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/tarifs"
              className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
            >
              {t("features.cta.viewPricing")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage; 