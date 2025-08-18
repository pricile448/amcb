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

// Types pour la messagerie
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
    // Initialiser l'écoute de l'état d'authentification
    this.initializeAuthListener();
  }

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  // Initialiser l'écoute de l'état d'authentification
  private initializeAuthListener(): void {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        logger.debug('Utilisateur connecté:', user.uid);
      } else {
        logger.debug('Aucun utilisateur connecté');
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

  // Obtenir ou créer un chat pour un utilisateur
  async getOrCreateUserChat(userId: string): Promise<string> {
    try {
      logger.debug('Recherche d\'un chat existant pour userId:', userId);
      
      if (!this.currentUser) {
        throw new Error('Utilisateur non authentifié');
      }

      // Chercher un chat existant où l'utilisateur est participant
      const chatsQuery = query(
        collection(db, 'chats'),
        or(
          where('userId', '==', userId),
          where('participants', 'array-contains', userId)
        ),
        limit(1)
      );
      
      const chatsSnapshot = await getDocs(chatsQuery);
      
      if (!chatsSnapshot.empty) {
        const chatId = chatsSnapshot.docs[0].id;
        logger.debug('Chat existant trouvé:', chatId);
        return chatId;
      }
      
      // Créer un nouveau chat si aucun n'existe
      logger.debug('Création d\'un nouveau chat pour userId:', userId);
      const newChatData = {
        userId: userId,
        participants: [userId, 'support'],
        createdAt: serverTimestamp(),
        topic: 'Support général',
        title: 'Support client'
      };
      
      const chatRef = await addDoc(collection(db, 'chats'), newChatData);
      logger.success('Nouveau chat créé:', chatRef.id);
      
      return chatRef.id;
    } catch (error) {
      logger.error('Erreur lors de la récupération/création du chat:', error);
      throw error;
    }
  }

  // Charger les chats de l'utilisateur avec écoute en temps réel
  loadUserChats(callback: (chats: Chat[]) => void): () => void {
    if (!this.currentUser) {
      logger.error('Utilisateur non authentifié pour charger les chats');
      return () => {};
    }

    logger.debug('Chargement des chats pour userId:', this.currentUser.uid);

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
      logger.debug('Chats mis à jour:', userChats.length);
      callback(userChats);
    }, (error) => {
      logger.error('Erreur lors du chargement des chats:', error);
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
      logger.debug('Récupération des chats pour userId:', userId);
      
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
      
      logger.debug('Chats récupérés:', chats.length);
      return chats;
    } catch (error) {
      logger.error('Erreur lors de la récupération des chats:', error);
      throw error;
    }
  }

  // Charger les messages d'un chat avec écoute en temps réel
  loadChatMessages(chatId: string, callback: (messages: Message[]) => void): () => void {
    if (!this.currentUser) {
      logger.error('Utilisateur non authentifié pour charger les messages');
      return () => {};
    }

    logger.debug('Chargement des messages pour chatId:', chatId);

    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    this.unsubscribeMessages = onSnapshot(messagesQuery, (snapshot: QuerySnapshot<DocumentData>) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as Message);
      });
      logger.debug('Messages mis à jour:', messages.length);
      callback(messages);
    }, (error) => {
      logger.error('Erreur lors du chargement des messages:', error);
    });

    return () => {
      if (this.unsubscribeMessages) {
        this.unsubscribeMessages();
        this.unsubscribeMessages = null;
      }
    };
  }

  // Récupérer les messages d'un chat (version synchrone)
  async getChatMessages(chatId: string): Promise<Message[]> {
    try {
      logger.debug('Récupération des messages pour chatId:', chatId);
      
      if (!this.currentUser) {
        throw new Error('Utilisateur non authentifié');
      }

      const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('timestamp', 'asc')
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      
      const messages: Message[] = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      logger.debug('Messages récupérés:', messages.length);
      return messages;
    } catch (error) {
      logger.error('Erreur lors de la récupération des messages:', error);
      throw error;
    }
  }

  // Envoyer un message
  async sendMessage(chatId: string, senderId: string, text: string): Promise<Message> {
    try {
      logger.debug('Envoi d\'un message dans chatId:', chatId, 'par senderId:', senderId);
      
      if (!this.currentUser) {
        throw new Error('Utilisateur non authentifié');
      }
      
      logger.debug('Utilisateur authentifié:', this.currentUser.uid);
      
      const messageData = {
        senderId: senderId,
        text: text,
        timestamp: serverTimestamp(),
        status: 'sent' as const,
        type: 'text' as const
      };
      
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
      
      logger.success('Message envoyé avec succès:', newMessage);
      return newMessage;
    } catch (error) {
      logger.error('Erreur lors de l\'envoi du message:', error);
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
      logger.debug('Marquage du message comme lu:', messageId);
      
      if (!this.currentUser) {
        throw new Error('Utilisateur non authentifié');
      }

      await updateDoc(doc(db, 'chats', chatId, 'messages', messageId), {
        status: 'read'
      });
      
      logger.success('Message marqué comme lu');
    } catch (error) {
      logger.error('Erreur lors du marquage du message comme lu:', error);
      throw error;
    }
  }

  // Marquer tous les messages d'un chat comme lus
  async markAllMessagesAsRead(chatId: string, userId: string): Promise<void> {
    try {
      logger.debug('Marquage de tous les messages comme lus pour userId:', userId);
      
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
        logger.debug('Aucun message non lu à marquer');
        return;
      }
      
      const updatePromises = unreadMessages.map(doc =>
        updateDoc(doc.ref, { status: 'read' })
      );
      
      await Promise.all(updatePromises);
      logger.success(`${unreadMessages.length} messages marqués comme lus`);
    } catch (error) {
      logger.error('Erreur lors du marquage des messages comme lus:', error);
      // Ne pas throw l'erreur pour éviter de bloquer l'envoi de messages
      logger.warn('Continuing without marking messages as read');
    }
  }

  // Récupérer un chat complet avec ses messages
  async getChatWithMessages(chatId: string): Promise<ChatWithMessages | null> {
    try {
      logger.debug('Récupération du chat complet avec messages:', chatId);
      
      if (!this.currentUser) {
        throw new Error('Utilisateur non authentifié');
      }

      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      
      if (!chatDoc.exists()) {
        logger.warn('Chat non trouvé:', chatId);
        return null;
      }
      
      const chat = {
        id: chatDoc.id,
        ...chatDoc.data()
      } as Chat;
      
      const messages = await this.getChatMessages(chatId);
      
      const chatWithMessages: ChatWithMessages = {
        ...chat,
        messages
      };
      
      logger.debug('Chat complet récupéré avec', messages.length, 'messages');
      return chatWithMessages;
    } catch (error) {
      logger.error('Erreur lors de la récupération du chat complet:', error);
      throw error;
    }
  }

  // Supprimer un message (pour les administrateurs)
  async deleteMessage(chatId: string, messageId: string): Promise<void> {
    try {
      logger.debug('Suppression du message:', messageId);
      
      if (!this.currentUser) {
        throw new Error('Utilisateur non authentifié');
      }

      // Note: Cette opération nécessite des règles Firestore appropriées
      // pour les administrateurs
      await updateDoc(doc(db, 'chats', chatId, 'messages', messageId), {
        text: '[Message supprimé]',
        deleted: true,
        deletedAt: serverTimestamp()
      });
      
      logger.success('Message supprimé');
    } catch (error) {
      logger.error('Erreur lors de la suppression du message:', error);
      throw error;
    }
  }

  // Nettoyer les ressources lors de la déconnexion
  cleanup(): void {
    this.cleanupListeners();
  }
}

export default ChatService;
