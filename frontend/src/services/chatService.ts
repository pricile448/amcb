import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  or,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { logger } from '../utils/logger';

console.log('🚀 ChatService: Fichier chargé !');

// Types pour la messagerie (conformes aux recommandations Gemini)
export interface Chat {
  id: string;
  userId: string;
  participants: string[];
  createdAt: Timestamp;
  lastMessage?: string;
  lastMessageTimestamp?: Timestamp;
  topic?: string;
  title?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
  status: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'file';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileUrl?: string;
  };
}

export interface ChatWithMessages extends Chat {
  messages: Message[];
}

class ChatService {
  private static instance: ChatService;
  private currentUser: User | null = null;
  private unsubscribeChats: (() => void) | null = null;
  private unsubscribeMessages: (() => void) | null = null;

  private constructor() {
    console.log('🔧 ChatService: Constructeur appelé !');
    // Initialiser l'écoute de l'état d'authentification
    this.initializeAuthListener();
  }

  static getInstance(): ChatService {
    console.log('🔧 ChatService: getInstance appelé !');
    if (!ChatService.instance) {
      console.log('🔧 ChatService: Création d\'une nouvelle instance !');
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  // Initialiser l'écoute de l'état d'authentification
  private initializeAuthListener(): void {
    console.log('🔧 ChatService: Initialisation de l\'écoute d\'authentification...');
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        console.log('✅ ChatService: Utilisateur connecté:', user.uid);
        logger.debug('✅ Utilisateur connecté:', user.uid);
      } else {
        console.log('❌ ChatService: Aucun utilisateur connecté');
        logger.debug('❌ Aucun utilisateur connecté');
        // Nettoyer les écouteurs si l'utilisateur se déconnecte
        this.cleanupListeners();
      }
    });
  }

  // Nettoyer les écouteurs
  private cleanupListeners(): void {
    if (this.unsubscribeChats) {
      this.unsubscribeChats();
      this.unsubscribeChats = null;
    }
    if (this.unsubscribeMessages) {
      this.unsubscribeMessages();
      this.unsubscribeMessages = null;
    }
  }

  // Obtenir ou créer un chat pour un utilisateur (conforme aux recommandations Gemini)
  async getOrCreateUserChat(userId: string): Promise<string> {
    try {
      console.log('🔧 ChatService: getOrCreateUserChat appelé avec userId:', userId);
      logger.debug('🔍 Recherche d\'un chat existant pour userId:', userId);
      
      if (!this.currentUser) {
        console.log('❌ ChatService: Utilisateur non authentifié dans getOrCreateUserChat');
        throw new Error('Utilisateur non authentifié');
      }

      // Rechercher un chat existant où l'utilisateur est participant
      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId)
      );
      
      console.log('🔍 ChatService: Requête pour participants:', userId);
      const chatsSnapshot = await getDocs(chatsQuery);
      console.log('📊 ChatService: Résultat requête participants:', chatsSnapshot.size, 'chats trouvés');
      
      if (!chatsSnapshot.empty) {
        const existingChat = chatsSnapshot.docs[0];
        console.log('✅ ChatService: Chat existant trouvé:', existingChat.id);
        logger.success('✅ Chat existant trouvé:', existingChat.id);
        return existingChat.id;
      }
      
      // Créer un nouveau chat si aucun n'existe (conforme aux recommandations Gemini)
      console.log('🆕 ChatService: Création d\'un nouveau chat pour userId:', userId);
      logger.debug('🆕 Création d\'un nouveau chat pour userId:', userId);
      const newChatData = {
        userId: userId,
        participants: [userId, 'support'],
        createdAt: serverTimestamp(),
        topic: 'Support général',
        title: 'Support client'
      };
      
      const chatRef = await addDoc(collection(db, 'chats'), newChatData);
      console.log('✅ ChatService: Nouveau chat créé:', chatRef.id);
      logger.success('✅ Nouveau chat créé:', chatRef.id);
      
      return chatRef.id;
    } catch (error) {
      console.error('❌ ChatService: Erreur lors de la récupération/création du chat:', error);
      logger.error('❌ Erreur lors de la récupération/création du chat:', error);
      throw error;
    }
  }

  // Charger les chats de l'utilisateur avec écoute en temps réel (conforme aux recommandations Gemini)
  loadUserChats(callback: (chats: Chat[]) => void): () => void {
    if (!this.currentUser) {
      logger.error('❌ Utilisateur non authentifié pour charger les chats');
      return () => {};
    }

    logger.debug('📡 Chargement des chats pour userId:', this.currentUser.uid);

    // Requête conforme aux recommandations Gemini
    const chatsQuery = query(
      collection(db, 'chats'),
      or(
        where('userId', '==', this.currentUser.uid),
        where('participants', 'array-contains', this.currentUser.uid)
      ),
      orderBy('lastMessageTimestamp', 'desc')
    );

    this.unsubscribeChats = onSnapshot(chatsQuery, (snapshot: QuerySnapshot<DocumentData>) => {
      const userChats: Chat[] = [];
      snapshot.forEach((doc) => {
        userChats.push({ id: doc.id, ...doc.data() } as Chat);
      });
      logger.debug('📡 Chats mis à jour en temps réel:', userChats.length);
      callback(userChats);
    }, (error) => {
      logger.error('❌ Erreur lors du chargement des chats:', error);
    });

    return () => {
      if (this.unsubscribeChats) {
        this.unsubscribeChats();
        this.unsubscribeChats = null;
      }
    };
  }

  // Récupérer tous les chats d'un utilisateur (version synchrone)
  async getUserChats(userId: string): Promise<Chat[]> {
    try {
      logger.debug('📋 Récupération des chats pour userId:', userId);
      
      if (!this.currentUser) {
        throw new Error('Utilisateur non authentifié');
      }

      const chatsQuery = query(
        collection(db, 'chats'),
        or(
          where('userId', '==', userId),
          where('participants', 'array-contains', userId)
        ),
        orderBy('lastMessageTimestamp', 'desc')
      );
      
      const chatsSnapshot = await getDocs(chatsQuery);
      
      const chats: Chat[] = chatsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Chat[];
      
      logger.debug('📋 Chats récupérés:', chats.length);
      return chats;
    } catch (error) {
      logger.error('❌ Erreur lors de la récupération des chats:', error);
      throw error;
    }
  }

  // Charger les messages d'un chat avec écoute en temps réel (conforme aux recommandations Gemini)
  loadChatMessages(chatId: string, callback: (messages: Message[]) => void): () => void {
    if (!this.currentUser) {
      logger.error('❌ Utilisateur non authentifié pour charger les messages');
      return () => {};
    }

    logger.debug('💬 Chargement des messages pour chatId:', chatId);

    // Requête conforme aux recommandations Gemini pour les messages
    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    this.unsubscribeMessages = onSnapshot(messagesQuery, (snapshot: QuerySnapshot<DocumentData>) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          senderId: data.senderId,
          text: data.text,
          timestamp: data.timestamp,
          status: data.status || 'sent',
          type: data.type || 'text',
          metadata: data.metadata
        } as Message);
      });
      logger.debug('💬 Messages mis à jour en temps réel:', messages.length);
      
      if (messages.length > 0) {
        callback(messages);
      } else {
        // Fallback: essayer de lire depuis la collection racine 'chats'
        logger.debug('🔄 Aucun message dans la sous-collection, tentative de lecture depuis la collection racine...');
        this.loadMessagesFromRootCollection(chatId, callback);
      }
    }, (error) => {
      logger.error('❌ Erreur lors du chargement des messages:', error);
      // En cas d'erreur, essayer le fallback
      this.loadMessagesFromRootCollection(chatId, callback);
    });

    return () => {
      if (this.unsubscribeMessages) {
        this.unsubscribeMessages();
        this.unsubscribeMessages = null;
      }
    };
  }

  // Méthode de fallback pour lire les messages depuis la collection racine
  private async loadMessagesFromRootCollection(chatId: string, callback: (messages: Message[]) => void): Promise<void> {
    try {
      logger.debug('🔄 Tentative de lecture des messages depuis la collection racine chats...');
      
      // Requête simple pour voir tous les documents de l'utilisateur
      const simpleQuery = query(
        collection(db, 'chats'),
        where('userId', '==', this.currentUser?.uid)
      );

      try {
        console.log('🔍 ChatService: Requête simple pour userId:', this.currentUser?.uid);
        logger.debug('🔍 Requête simple pour userId:', this.currentUser?.uid);
        
        const snapshot = await getDocs(simpleQuery);
        console.log('📊 ChatService: Résultat requête simple:', snapshot.size, 'documents');
        logger.debug('📊 Résultat requête simple:', snapshot.size, 'documents');
        
        const messages: Message[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log('📄 ChatService: Document simple:', doc.id, data);
          logger.debug('📄 Document simple:', doc.id, data);
          
          // Vérifier si c'est un message (a un champ 'text')
          if (data.text && typeof data.text === 'string') {
            messages.push({
              id: doc.id,
              senderId: data.senderId || data.userId || 'unknown',
              text: data.text,
              timestamp: data.timestamp || data.createdAt || Timestamp.now(),
              status: data.status || 'sent',
              type: data.type || 'text',
              metadata: data.metadata
            } as Message);
          }
        });

        if (messages.length > 0) {
          console.log('✅ ChatService: Messages trouvés avec la requête simple:', messages.length);
          logger.success('✅ Messages trouvés avec la requête simple:', messages.length);
          callback(messages);
          return;
        }
      } catch (queryError) {
        console.error('❌ ChatService: Requête simple échouée:', queryError);
        logger.debug('⚠️ Requête simple échouée:', queryError);
      }
      
      console.log('⚠️ ChatService: Aucun message trouvé avec la requête simple');
      logger.warn('⚠️ Aucun message trouvé avec la requête simple');
      callback([]);
    } catch (error) {
      console.error('❌ ChatService: Erreur lors du fallback de lecture des messages:', error);
      logger.error('❌ Erreur lors du fallback de lecture des messages:', error);
      callback([]);
    }
  }

  // Envoyer un message (conforme aux recommandations Gemini)
  async sendMessage(chatId: string, text: string, senderId: string = 'user'): Promise<Message> {
    try {
      logger.debug('📤 Envoi d\'un message:', { chatId, text, senderId });
      
      if (!this.currentUser) {
        throw new Error('Utilisateur non authentifié');
      }
      
      logger.debug('✅ Utilisateur authentifié:', this.currentUser.uid);
      
      // Structure du message conforme aux recommandations Gemini
      const messageData = {
        senderId: senderId,
        text: text,
        timestamp: serverTimestamp(),
        status: 'sent' as const,
        type: 'text' as const
      };
      
      // Ajouter le message à la sous-collection (conforme aux recommandations Gemini)
      const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);
      
      // Mettre à jour le chat avec le dernier message
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: text,
        lastMessageTimestamp: serverTimestamp()
      });
      
      const newMessage: Message = {
        id: messageRef.id,
        ...messageData,
        timestamp: Timestamp.now() // Utiliser le timestamp actuel pour l'affichage immédiat
      };
      
      logger.success('✅ Message envoyé avec succès:', newMessage);
      return newMessage;
    } catch (error) {
      logger.error('❌ Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  }

  // Écouter les messages en temps réel (alias pour loadChatMessages)
  subscribeToChatMessages(chatId: string, callback: (messages: Message[]) => void): () => void {
    return this.loadChatMessages(chatId, callback);
  }

  // Marquer un message comme lu
  async markMessageAsRead(chatId: string, messageId: string): Promise<void> {
    try {
      logger.debug('👁️ Marquage du message comme lu:', messageId);
      
      if (!this.currentUser) {
        throw new Error('Utilisateur non authentifié');
      }

      await updateDoc(doc(db, 'chats', chatId, 'messages', messageId), {
        status: 'read'
      });
      
      logger.success('✅ Message marqué comme lu');
    } catch (error) {
      logger.error('❌ Erreur lors du marquage du message comme lu:', error);
      throw error;
    }
  }

  // Marquer tous les messages d'un chat comme lus
  async markAllMessagesAsRead(chatId: string, userId: string): Promise<void> {
    try {
      logger.debug('👁️ Marquage de tous les messages comme lus pour userId:', userId);
      
      if (!this.currentUser) {
        throw new Error('Utilisateur non authentifié');
      }

      // Récupérer tous les messages non lus qui ne sont pas de l'utilisateur
      const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        where('senderId', '!=', userId)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      
      // Filtrer côté client les messages non lus
      const unreadMessages = messagesSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.status !== 'read';
      });
      
      if (unreadMessages.length === 0) {
        logger.debug('ℹ️ Aucun message non lu à marquer');
        return;
      }
      
      const updatePromises = unreadMessages.map(doc =>
        updateDoc(doc.ref, { status: 'read' })
      );
      
      await Promise.all(updatePromises);
      logger.success(`✅ ${unreadMessages.length} messages marqués comme lus`);
    } catch (error) {
      logger.error('❌ Erreur lors du marquage des messages comme lus:', error);
      // Ne pas throw l'erreur pour éviter de bloquer l'envoi de messages
      logger.warn('⚠️ Continuing without marking messages as read');
    }
  }

  // Récupérer un chat complet avec ses messages
  async getChatWithMessages(chatId: string): Promise<ChatWithMessages | null> {
    try {
      logger.debug('📋 Récupération du chat avec messages:', chatId);
      
      if (!this.currentUser) {
        throw new Error('Utilisateur non authentifié');
      }

      // Récupérer le chat
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      
      if (!chatDoc.exists()) {
        logger.warn('⚠️ Chat non trouvé:', chatId);
        return null;
      }
      
      const chatData = chatDoc.data() as Chat;
      
      // Récupérer les messages (conforme aux recommandations Gemini)
      const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('timestamp', 'asc')
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      
      let messages: Message[] = messagesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          senderId: data.senderId,
          text: data.text,
          timestamp: data.timestamp,
          status: data.status || 'sent',
          type: data.type || 'text',
          metadata: data.metadata
        } as Message;
      });

      // Si aucun message dans la sous-collection, essayer le fallback
      if (messages.length === 0) {
        logger.debug('🔄 Aucun message dans la sous-collection, tentative de lecture depuis la collection racine...');
        messages = await this.getMessagesFromRootCollection(chatId);
      }
      
      const chatWithMessages: ChatWithMessages = {
        ...chatData,
        id: chatDoc.id,
        messages
      };
      
      logger.debug('📋 Chat avec messages récupéré:', chatWithMessages.messages.length);
      return chatWithMessages;
    } catch (error) {
      logger.error('❌ Erreur lors de la récupération du chat avec messages:', error);
      throw error;
    }
  }

  // Méthode de fallback pour récupérer les messages depuis la collection racine (version synchrone)
  private async getMessagesFromRootCollection(chatId: string): Promise<Message[]> {
    try {
      logger.debug('🔄 Tentative de lecture des messages depuis la collection racine chats...');
      
      // Essayer différentes structures de données possibles
      const possibleQueries = [
        // Structure 1: messages avec chatId
        query(collection(db, 'chats'), where('chatId', '==', chatId)),
        // Structure 2: messages avec userId et type de message
        query(collection(db, 'chats'), where('userId', '==', this.currentUser?.uid), where('type', '==', 'message')),
        // Structure 3: tous les documents qui ont un champ 'text'
        query(collection(db, 'chats'), where('text', '!=', null))
      ];

      for (const queryRef of possibleQueries) {
        try {
          const snapshot = await getDocs(queryRef);
          const messages: Message[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            // Vérifier si c'est un message (a un champ 'text')
            if (data.text && typeof data.text === 'string') {
              messages.push({
                id: doc.id,
                senderId: data.senderId || data.userId || 'unknown',
                text: data.text,
                timestamp: data.timestamp || data.createdAt || Timestamp.now(),
                status: data.status || 'sent',
                type: data.type || 'text',
                metadata: data.metadata
              } as Message);
            }
          });

          if (messages.length > 0) {
            logger.success(`✅ ${messages.length} messages trouvés dans la collection racine avec la structure:`, queryRef);
            return messages;
          }
        } catch (queryError) {
          logger.debug('⚠️ Requête fallback échouée:', queryError);
        }
      }
      
      logger.warn('⚠️ Aucun message trouvé dans aucune structure de données');
      return [];
    } catch (error) {
      logger.error('❌ Erreur lors du fallback de lecture des messages:', error);
      return [];
    }
  }

  // Supprimer un message
  async deleteMessage(chatId: string, messageId: string): Promise<void> {
    try {
      logger.debug('🗑️ Suppression du message:', messageId);
      
      if (!this.currentUser) {
        throw new Error('Utilisateur non authentifié');
      }

      // Vérifier que l'utilisateur est le propriétaire du message
      const messageDoc = await getDoc(doc(db, 'chats', chatId, 'messages', messageId));
      
      if (!messageDoc.exists()) {
        throw new Error('Message non trouvé');
      }
      
      const messageData = messageDoc.data();
      if (messageData.senderId !== this.currentUser.uid && messageData.senderId !== 'support') {
        throw new Error('Permission refusée pour supprimer ce message');
      }
      
      // Marquer le message comme supprimé au lieu de le supprimer physiquement
      await updateDoc(doc(db, 'chats', chatId, 'messages', messageId), {
        deletedAt: serverTimestamp(),
        text: '[Message supprimé]'
      });
      
      logger.success('✅ Message supprimé avec succès');
    } catch (error) {
      logger.error('❌ Erreur lors de la suppression du message:', error);
      throw error;
    }
  }

  // Nettoyer les ressources
  destroy(): void {
    this.cleanupListeners();
    this.currentUser = null;
  }
}

// Export de l'instance singleton
export const chatService = ChatService.getInstance();

