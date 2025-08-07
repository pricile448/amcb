import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";

import { logger } from '../../utils/logger';

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer l'URL de retour depuis l'état de navigation
  const from = location.state?.from?.pathname || "/dashboard";
  
  // Récupérer le message de succès de vérification email
  const successMessage = location.state?.message;
  const emailVerified = location.state?.emailVerified;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      logger.debug(`🔐 Tentative de connexion Firebase pour: ${data.email}`);
      
      // Utiliser Firebase Auth directement
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      
      logger.success(`✅ Connexion Firebase réussie pour: ${data.email}`);
      
      // Vérifier le statut emailVerified dans Firestore
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('../../config/firebase');
      
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé dans la base de données');
      }
      
      const userData = userDoc.data();
      
      // 🔧 Synchroniser le statut email avec Firebase Auth
      const authVerified = userCredential.user.emailVerified;
      const firestoreVerified = userData.emailVerified || false;
      const firestoreIsVerified = userData.isEmailVerified || false;
      
      logger.debug('🔍 Synchronisation email:', {
        authVerified,
        firestoreVerified,
        firestoreIsVerified
      });
      
      // Si les statuts sont différents, synchroniser
      if (authVerified !== firestoreVerified || authVerified !== firestoreIsVerified) {
        logger.warn('🔄 Synchronisation nécessaire du statut email');
        
        try {
          const { updateDoc } = await import('firebase/firestore');
          const userDocRef = doc(db, 'users', userCredential.user.uid);
          
          const updates: any = {};
          if (authVerified !== firestoreVerified) {
            updates.emailVerified = authVerified;
          }
          if (authVerified !== firestoreIsVerified) {
            updates.isEmailVerified = authVerified;
          }
          
          await updateDoc(userDocRef, updates);
          logger.success('✅ Statut email synchronisé');
          
          // Mettre à jour les données locales
          userData.emailVerified = authVerified;
          userData.isEmailVerified = authVerified;
          
        } catch (updateError) {
          logger.error('❌ Erreur synchronisation email:', updateError);
        }
      }
      
      const isEmailVerified = userData.emailVerified || false;
      let kycStatus = userData.kycStatus || userData.verificationStatus || 'unverified';
      
      logger.debug(`📧 Statut emailVerified final: ${isEmailVerified}`);
      logger.debug(`🔐 Statut KYC: ${kycStatus}`);
      
      if (!isEmailVerified) {
        // Déconnecter l'utilisateur
        await auth.signOut();
        localStorage.removeItem('user');
        
        toast.error('Veuillez vérifier votre email avant de vous connecter. Vérifiez vos spams ou demandez un nouveau code.');
        
        // Rediriger vers la page d'inscription avec un message
        navigate('/ouvrir-compte', { 
          state: { 
            message: 'Veuillez vérifier votre email avant de vous connecter.',
            email: data.email 
          } 
        });
        return;
      }
      
      // Stocker les informations utilisateur dans localStorage
      const user = userCredential.user;
      const userDataForStorage = {
        id: user.uid,
        email: user.email,
        emailVerified: isEmailVerified,
        kycStatus: kycStatus,
        verificationStatus: kycStatus, // Compatibilité avec l'ancien format
        displayName: user.displayName || 'Utilisateur',
        photoURL: user.photoURL
      };
      
      localStorage.setItem('user', JSON.stringify(userDataForStorage));
      logger.success('✅ Utilisateur stocké dans localStorage:', userDataForStorage);
      
      // Afficher un message spécial si c'est la première connexion après vérification
      if (emailVerified) {
        toast.success('Bienvenue ! Votre compte a été vérifié avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités.');
      } else {
        toast.success(t("auth.loginSuccess"));
      }
      
      navigate(from, { replace: true });
      
    } catch (error: any) {
      logger.error("Login error:", error);
      
      // Gérer les erreurs Firebase spécifiques
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('email', { message: 'Email ou mot de passe incorrect' });
        setError('password', { message: 'Email ou mot de passe incorrect' });
        toast.error('Email ou mot de passe incorrect');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Trop de tentatives. Veuillez réessayer plus tard.');
      } else if (error.code === 'auth/user-disabled') {
        toast.error('Ce compte a été désactivé.');
      } else if (error.code === 'auth/invalid-email') {
        setError('email', { message: 'Email invalide' });
        toast.error('Email invalide');
      } else {
        toast.error(error.message || t("auth.loginError"));
      }
    } finally {
      setIsLoading(false);
    }
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
          {t("auth.login.title")}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t("auth.login.subtitle")}{" "}
          <Link
            to="/ouvrir-compte"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {t("auth.login.createAccount")}
          </Link>
        </p>
        
        {/* Message de succès après vérification email */}
        {successMessage && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
                  autoComplete="current-password"
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  {t("auth.rememberMe")}
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/mot-de-passe-oublie"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {t("auth.forgotPassword")}
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t("auth.loggingIn")}
                  </div>
                ) : (
                  t("auth.login.button")
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t("auth.or")}</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                {t("auth.loginWithGoogle")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 