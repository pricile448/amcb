import React from "react";
import { useTranslation } from "react-i18next";
import LocalizedLink from "../../components/LocalizedLink";
import { Check, ArrowRight } from "lucide-react";

const PricingPage: React.FC = () => {
  const { t } = useTranslation();

  const plans = [
    {
      name: t("pricing.basic.name"),
      price: t("pricing.basic.price"),
      description: t("pricing.basic.description"),
      features: [
        t("pricing.basic.feature1"),
        t("pricing.basic.feature2"),
        t("pricing.basic.feature3"),
        t("pricing.basic.feature4"),
        t("pricing.basic.feature5"),
      ],
      popular: false,
    },
    {
      name: t("pricing.premium.name"),
      price: t("pricing.premium.price"),
      description: t("pricing.premium.description"),
      features: [
        t("pricing.premium.feature1"),
        t("pricing.premium.feature2"),
        t("pricing.premium.feature3"),
        t("pricing.premium.feature4"),
        t("pricing.premium.feature5"),
        t("pricing.premium.feature6"),
        t("pricing.premium.feature7"),
      ],
      popular: true,
    },
    {
      name: t("pricing.business.name"),
      price: t("pricing.business.price"),
      description: t("pricing.business.description"),
      features: [
        t("pricing.business.feature1"),
        t("pricing.business.feature2"),
        t("pricing.business.feature3"),
        t("pricing.business.feature4"),
        t("pricing.business.feature5"),
        t("pricing.business.feature6"),
        t("pricing.business.feature7"),
        t("pricing.business.feature8"),
      ],
      popular: false,
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t("pricing.hero.title")}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            {t("pricing.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white border rounded-lg p-8 ${
                  plan.popular
                    ? "border-blue-500 shadow-lg scale-105"
                    : "border-gray-200 shadow-sm"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      {t("pricing.popular")}
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600">/{t("pricing.month")}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <LocalizedLink
                  to="/ouvrir-compte"
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors ${
                    plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {t("pricing.choosePlan")}
                  <ArrowRight className="inline ml-2 w-4 h-4" />
                </LocalizedLink>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("pricing.faq.title")}
            </h2>
            <p className="text-xl text-gray-600">
              {t("pricing.faq.subtitle")}
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("pricing.faq.q1")}
              </h3>
              <p className="text-gray-600">{t("pricing.faq.a1")}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("pricing.faq.q2")}
              </h3>
              <p className="text-gray-600">{t("pricing.faq.a2")}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("pricing.faq.q3")}
              </h3>
              <p className="text-gray-600">{t("pricing.faq.a3")}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("pricing.faq.q4")}
              </h3>
              <p className="text-gray-600">{t("pricing.faq.a4")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t("pricing.cta.title")}
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            {t("pricing.cta.description")}
          </p>
          <LocalizedLink
            to="/ouvrir-compte"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
          >
            {t("pricing.cta.button")}
            <ArrowRight className="ml-2 w-5 h-5" />
          </LocalizedLink>
        </div>
      </section>
    </div>
  );
};

export default PricingPage; 