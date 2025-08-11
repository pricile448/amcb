import { FirebaseDataService } from '../services/firebaseData';

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  errors: string[];
}

/**
 * Migre les notifications localStorage vers Firestore
 */
export async function migrateNotificationsToFirestore(userId: string): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    migratedCount: 0,
    errors: []
  };

  try {
    console.log('🔄 Début de la migration des notifications pour userId:', userId);
    
    const storageKey = `notifications_${userId}`;
    const localStorageData = localStorage.getItem(storageKey);
    
    if (!localStorageData) {
      console.log('ℹ️ Aucune donnée localStorage à migrer');
      result.success = true;
      return result;
    }

    const notifications = JSON.parse(localStorageData);
    console.log(`📊 Migration de ${notifications.length} notifications...`);

    const migrationPromises = notifications.map(async (notification: any, index: number) => {
      try {
        const firebaseNotification = {
          title: notification.title,
          message: notification.message,
          type: notification.type,
          date: notification.date,
          read: notification.read,
          userId: notification.userId,
          priority: 'medium' as const,
          category: 'general' as const
        };

        await FirebaseDataService.addNotification(firebaseNotification);
        console.log(`✅ Notification ${index + 1}/${notifications.length} migrée`);
        result.migratedCount++;
      } catch (error) {
        const errorMsg = `Erreur migration notification ${index + 1}: ${error}`;
        console.error(errorMsg);
        result.errors.push(errorMsg);
      }
    });

    await Promise.all(migrationPromises);
    
    result.success = result.errors.length === 0;
    
    if (result.success) {
      console.log('✅ Migration terminée avec succès');
      // Optionnel : nettoyer localStorage après migration réussie
      // localStorage.removeItem(storageKey);
    } else {
      console.warn(`⚠️ Migration terminée avec ${result.errors.length} erreurs`);
    }
    
  } catch (error) {
    const errorMsg = `Erreur générale lors de la migration: ${error}`;
    console.error(errorMsg);
    result.errors.push(errorMsg);
  }

  return result;
}

/**
 * Vérifie si les endpoints Firestore sont disponibles
 */
export async function checkFirestoreEndpoints(): Promise<boolean> {
  try {
    console.log('🔍 Vérification des endpoints Firestore...');
    
    // Test simple avec un userId fictif
    await FirebaseDataService.getNotifications('test-user');
    console.log('✅ Endpoints Firestore disponibles');
    return true;
  } catch (error) {
    console.warn('⚠️ Endpoints Firestore non disponibles:', error);
    return false;
  }
}

/**
 * Compare les données localStorage avec Firestore
 */
export async function compareLocalStorageWithFirestore(userId: string): Promise<{
  localStorageCount: number;
  firestoreCount: number;
  differences: string[];
}> {
  const result = {
    localStorageCount: 0,
    firestoreCount: 0,
    differences: [] as string[]
  };

  try {
    // Compter localStorage
    const storageKey = `notifications_${userId}`;
    const localStorageData = localStorage.getItem(storageKey);
    if (localStorageData) {
      const localNotifications = JSON.parse(localStorageData);
      result.localStorageCount = localNotifications.length;
    }

    // Compter Firestore
    try {
      const firestoreNotifications = await FirebaseDataService.getNotifications(userId);
      result.firestoreCount = firestoreNotifications.length;
    } catch (error) {
      result.differences.push(`Impossible de récupérer les données Firestore: ${error}`);
    }

    // Analyser les différences
    if (result.localStorageCount !== result.firestoreCount) {
      result.differences.push(
        `Différence de comptage: localStorage=${result.localStorageCount}, Firestore=${result.firestoreCount}`
      );
    }

  } catch (error) {
    result.differences.push(`Erreur lors de la comparaison: ${error}`);
  }

  return result;
}

/**
 * Nettoie les données localStorage après migration réussie
 */
export function cleanupLocalStorageAfterMigration(userId: string): boolean {
  try {
    const storageKey = `notifications_${userId}`;
    localStorage.removeItem(storageKey);
    console.log('🧹 Données localStorage nettoyées après migration');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage localStorage:', error);
    return false;
  }
}

/**
 * Restaure les données localStorage depuis Firestore (rollback)
 */
export async function restoreFromFirestore(userId: string): Promise<boolean> {
  try {
    console.log('🔄 Restauration depuis Firestore...');
    
    const firestoreNotifications = await FirebaseDataService.getNotifications(userId);
    const storageKey = `notifications_${userId}`;
    
    // Convertir au format localStorage
    const localNotifications = firestoreNotifications.map((notification: any) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      date: notification.date,
      read: notification.read,
      userId: notification.userId
    }));
    
    localStorage.setItem(storageKey, JSON.stringify(localNotifications));
    console.log('✅ Données restaurées depuis Firestore');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la restauration:', error);
    return false;
  }
} 