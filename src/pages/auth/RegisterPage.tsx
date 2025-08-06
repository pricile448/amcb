import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar, MapPin, Building, Briefcase, DollarSign, Flag, Home } from "lucide-react";
import toast from "react-hot-toast";
import { AuthService } from "../../services/api";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import VerificationCodeModal from "../../components/VerificationCodeModal";
import { EmailVerificationService } from "../../services/emailVerification";
import { API_CONFIG } from "../../config/api";
import { logger } from "../../utils/logger";

const registerSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  birthDate: z.string().min(1, "Date de naissance requise"),
  birthPlace: z.string().min(2, "Le lieu de naissance doit contenir au moins 2 caractères"),
  nationality: z.string().min(2, "La nationalité doit contenir au moins 2 caractères"),
  residenceCountry: z.string().min(2, "Le pays de résidence doit contenir au moins 2 caractères"),
  address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  city: z.string().min(2, "La ville doit contenir au moins 2 caractères"),
  postalCode: z.string().min(4, "Le code postal doit contenir au moins 4 caractères"),
  profession: z.string().min(2, "La profession doit contenir au moins 2 caractères"),
  salary: z.string().min(1, "Le salaire est requis"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, "Vous devez accepter les conditions"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  // Récupérer le message d'erreur depuis la page de connexion
  const errorMessage = location.state?.message;
  const prefillEmail = location.state?.email;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      logger.debug('🔐 Début du processus d\'inscription pour:', data.email);

      let userId: string | undefined;

      // En développement, utiliser l'API backend si disponible
      if (import.meta.env.DEV && API_CONFIG.BASE_URL) {
        try {
          logger.debug('🔄 Tentative d\'inscription via API backend...');
          
          const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              password: data.password,
              phone: data.phone,
              birthDate: data.birthDate,
              birthPlace: data.birthPlace,
              nationality: data.nationality,
              residenceCountry: data.residenceCountry,
              address: data.address,
              city: data.city,
              postalCode: data.postalCode,
              profession: data.profession,
              salary: data.salary
            })
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              userId = result.userId;
              logger.success('✅ Compte créé avec succès via API backend');
            } else {
              throw new Error(result.error || 'Erreur lors de la création du compte');
            }
          } else {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
        } catch (apiError) {
          logger.warn('⚠️ API backend non disponible, utilisation de Firebase Auth:', apiError);
          // Continue avec Firebase Auth au lieu de lancer une exception
        }
      }

      // En production ou si l'API backend échoue, utiliser Firebase Auth
      if (!userId) {
        logger.debug('🔄 Utilisation de Firebase Auth pour l\'inscription...');
        
        // 1. Créer l'utilisateur dans Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );

        userId = userCredential.user.uid;

        // 2. Sauvegarder les données utilisateur dans Firestore
        await setDoc(doc(db, 'users', userId), {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          birthDate: data.birthDate,
          birthPlace: data.birthPlace,
          nationality: data.nationality,
          residenceCountry: data.residenceCountry,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          profession: data.profession,
          salary: data.salary,
          createdAt: serverTimestamp(),
          emailVerified: false,
          kycStatus: 'unverified',
          verificationStatus: 'unverified',
          status: 'pending'
        });

        logger.success('✅ Compte créé avec succès via Firebase Auth');
      }

      // 3. Envoyer le code de validation
      const verificationResult = await EmailVerificationService.sendVerificationCode(
        data.email, 
        userId
      );
      
      if (!verificationResult.success) {
        throw new Error(verificationResult.error || 'Erreur lors de l\'envoi du code de validation');
      }

      // En mode développement, afficher le code
      if (verificationResult.code) {
        logger.debug('🔍 CODE DE VÉRIFICATION (DEV):', verificationResult.code);
        alert(`Code de vérification (DEV): ${verificationResult.code}`);
      }

      // 4. Afficher la modal de validation
      setUserEmail(data.email);
      setShowVerification(true);
      
      toast.success('Compte créé ! Veuillez vérifier votre email.');

    } catch (error: any) {
      logger.error("Register error:", error);
      toast.error(error.message || t("auth.registerError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    setShowVerification(false);
    toast.success('Email vérifié avec succès !');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">AmCbunq</span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t("auth.register.title")}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t("auth.register.subtitle")}{" "}
          <Link
            to="/connexion"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {t("auth.register.alreadyHaveAccount")}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Message d'erreur depuis la page de connexion */}
          {errorMessage && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  {t("auth.firstName")}
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("firstName")}
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder={t("auth.firstNamePlaceholder") as string}
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  {t("auth.lastName")}
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("lastName")}
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder={t("auth.lastNamePlaceholder") as string}
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-2 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t("auth.email")}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("email")}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={prefillEmail || ''}
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={t("auth.emailPlaceholder") as string}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                {t("auth.phone")}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("phone")}
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={t("auth.phonePlaceholder") as string}
                />
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                  {t("auth.birthDate")}
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("birthDate")}
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                {errors.birthDate && (
                  <p className="mt-2 text-sm text-red-600">{errors.birthDate.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="birthPlace" className="block text-sm font-medium text-gray-700">
                  Lieu de naissance
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("birthPlace")}
                    id="birthPlace"
                    name="birthPlace"
                    type="text"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ex: Paris"
                  />
                </div>
                {errors.birthPlace && (
                  <p className="mt-2 text-sm text-red-600">{errors.birthPlace.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
                  Nationalité
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Flag className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("nationality")}
                    id="nationality"
                    name="nationality"
                    type="text"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ex: Française"
                  />
                </div>
                {errors.nationality && (
                  <p className="mt-2 text-sm text-red-600">{errors.nationality.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="residenceCountry" className="block text-sm font-medium text-gray-700">
                  Pays de résidence
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Flag className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("residenceCountry")}
                    id="residenceCountry"
                    name="residenceCountry"
                    type="text"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ex: France"
                  />
                </div>
                {errors.residenceCountry && (
                  <p className="mt-2 text-sm text-red-600">{errors.residenceCountry.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Adresse
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Home className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("address")}
                  id="address"
                  name="address"
                  type="text"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ex: 3 RUE DE AGES"
                />
              </div>
              {errors.address && (
                <p className="mt-2 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  Ville
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("city")}
                    id="city"
                    name="city"
                    type="text"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ex: PARIS"
                  />
                </div>
                {errors.city && (
                  <p className="mt-2 text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                  Code postal
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("postalCode")}
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ex: 78000"
                  />
                </div>
                {errors.postalCode && (
                  <p className="mt-2 text-sm text-red-600">{errors.postalCode.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="profession" className="block text-sm font-medium text-gray-700">
                  Profession
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("profession")}
                    id="profession"
                    name="profession"
                    type="text"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ex: COMPTABLE"
                  />
                </div>
                {errors.profession && (
                  <p className="mt-2 text-sm text-red-600">{errors.profession.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
                  Salaire mensuel (€)
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("salary")}
                    id="salary"
                    name="salary"
                    type="number"
                    min="0"
                    step="100"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ex: 4000"
                  />
                </div>
                {errors.salary && (
                  <p className="mt-2 text-sm text-red-600">{errors.salary.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t("auth.password")}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("password")}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={t("auth.passwordPlaceholder") as string}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t("auth.confirmPassword")}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("confirmPassword")}
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={t("auth.confirmPasswordPlaceholder") as string}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                {...register("acceptTerms")}
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                {t("auth.acceptTerms")}{" "}
                <Link
                  to="/conditions"
                  className="text-blue-600 hover:text-blue-500"
                >
                  {t("auth.termsAndConditions")}
                </Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="mt-2 text-sm text-red-600">{errors.acceptTerms.message}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t("auth.registering") : t("auth.register.button")}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de vérification par email */}
      <VerificationCodeModal
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        email={userEmail}
        onVerificationSuccess={handleVerificationSuccess}
      />
    </div>
  );
};

export default RegisterPage; 