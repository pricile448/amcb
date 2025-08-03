import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Shield, Upload, CheckCircle, Clock, XCircle, FileText } from "lucide-react";

const VerificationPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("documents");

  const documents = [
    {
      id: 1,
      name: t("verification.identityDocument"),
      type: "identity",
      status: "approved",
      uploadedAt: "2024-01-10",
      fileSize: "2.5 MB",
      fileName: "carte_identite.pdf",
    },
    {
      id: 2,
      name: t("verification.proofOfAddress"),
      type: "address",
      status: "pending",
      uploadedAt: "2024-01-12",
      fileSize: "1.8 MB",
      fileName: "justificatif_domicile.pdf",
    },
    {
      id: 3,
      name: t("verification.proofOfIncome"),
      type: "income",
      status: "rejected",
      uploadedAt: "2024-01-08",
      fileSize: "3.2 MB",
      fileName: "bulletin_salaire.pdf",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const verificationSteps = [
    {
      step: 1,
      title: t("verification.step1.title"),
      description: t("verification.step1.description"),
      status: "completed",
    },
    {
      step: 2,
      title: t("verification.step2.title"),
      description: t("verification.step2.description"),
      status: "completed",
    },
    {
      step: 3,
      title: t("verification.step3.title"),
      description: t("verification.step3.description"),
      status: "in_progress",
    },
    {
      step: 4,
      title: t("verification.step4.title"),
      description: t("verification.step4.description"),
      status: "pending",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("verification.title")}
          </h1>
          <p className="text-gray-600">
            {t("verification.subtitle")}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-blue-600" />
          <span className="text-sm font-medium text-gray-900">
            {t("verification.verificationLevel")}: 75%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("verification.progress")}
          </h2>
          <span className="text-sm text-gray-600">3/4 {t("verification.completed")}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "75%" }}></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setSelectedTab("documents")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === "documents"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t("verification.documents")}
            </button>
            <button
              onClick={() => setSelectedTab("steps")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === "steps"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t("verification.steps")}
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === "documents" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("verification.uploadedDocuments")}
                </h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>{t("verification.uploadDocument")}</span>
                </button>
              </div>

              <div className="space-y-4">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{document.name}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{document.fileName}</span>
                            <span>•</span>
                            <span>{document.fileSize}</span>
                            <span>•</span>
                            <span>{document.uploadedAt}</span>
                            <span>•</span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                document.status
                              )}`}
                            >
                              {getStatusIcon(document.status)}
                              <span className="ml-1">
                                {t(`verification.status.${document.status}`)}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          {t("verification.view")}
                        </button>
                        {document.status === "rejected" && (
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                            {t("verification.reupload")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  {t("verification.requiredDocuments")}
                </h3>
                <ul className="text-blue-800 space-y-2">
                  <li>• {t("verification.identityDocument")} (Carte d'identité, Passeport)</li>
                  <li>• {t("verification.proofOfAddress")} (Facture récente, Quittance de loyer)</li>
                  <li>• {t("verification.proofOfIncome")} (Bulletin de salaire, Avis d'imposition)</li>
                  <li>• {t("verification.bankStatement")} (Relevé bancaire des 3 derniers mois)</li>
                </ul>
              </div>
            </div>
          )}

          {selectedTab === "steps" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("verification.verificationSteps")}
              </h3>

              <div className="space-y-4">
                {verificationSteps.map((step, index) => (
                  <div
                    key={step.step}
                    className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : step.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {step.status === "completed" ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        step.step
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          step.status
                        )}`}
                      >
                        {t(`verification.stepStatus.${step.status}`)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationPage; 