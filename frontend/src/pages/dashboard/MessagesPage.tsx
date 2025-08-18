import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Paperclip, Smile, Clock, Check, CheckCheck, Loader2 } from 'lucide-react';
import { chatService, Message as ChatMessage } from '../../services/chatService';
import { formatDate } from '../../utils/formatters';
import ModernVerificationState from '../../components/ModernVerificationState';
import { useKycSync } from '../../hooks/useNotifications';
import { useAuth } from '../../hooks/useAuth';
import { logger } from '../../utils/logger';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

const MessagesPage: React.FC = () => {
  console.log('🔧 MessagesPage: Composant chargé');
  const { t, i18n } = useTranslation();
  const { userStatus, isUnverified, syncKycStatus } = useKycSync();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // chatService est déjà importé

  console.log('🔧 MessagesPage: État initial - user:', user?.uid, 'loading:', loading);

  // Fonction utilitaire pour convertir les Timestamps Firestore
  const convertTimestamp = (timestamp: any): Date => {
    if (timestamp?.toDate) {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    return new Date(timestamp);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Charger les messages depuis la collection chats
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        
        if (!user?.uid) {
          logger.error('Aucun utilisateur connecté');
          setLoading(false);
          return;
        }

        // Synchroniser le statut KYC avant de charger les messages
        await syncKycStatus();

        logger.debug('Chargement des messages pour userId:', user.uid);
        
        // Obtenir ou créer un chat pour l'utilisateur
        const currentChatId = await chatService.getOrCreateUserChat(user.uid);
        setChatId(currentChatId);
        
        // Récupérer les messages du chat
        const chatWithMessages = await chatService.getChatWithMessages(currentChatId);
        const chatMessages = chatWithMessages?.messages || [];
        
        logger.debug('Messages reçus:', chatMessages.length);
        
        // Si aucun message, créer un message de bienvenue par défaut
        if (chatMessages.length === 0) {
          logger.warn('Aucun message trouvé, création d\'un message de bienvenue');
          const welcomeMessage: Message = {
            id: 'welcome',
            text: t('messages.welcome') || 'Bienvenue !',
            sender: 'support',
            timestamp: new Date(),
            status: 'read'
          };
          setMessages([welcomeMessage]);
        } else {
          logger.success('Messages chargés avec succès');
          // Mapper les messages du chat vers le format local
          const mappedMessages: Message[] = chatMessages.map(msg => {
            // Conversion de la date Firestore
            const timestamp = convertTimestamp(msg.timestamp);

            // Déterminer le sender : si senderId est l'utilisateur connecté, c'est 'user', sinon 'support'
            const isFromUser = msg.senderId === user.uid;
            const sender: 'user' | 'support' = isFromUser ? 'user' : 'support';

            logger.debug(`Message ${msg.id}: senderId=${msg.senderId}, isFromUser=${isFromUser}, finalSender=${sender}, timestamp=${timestamp}`);

            return {
              id: msg.id,
              text: msg.text,
              sender: sender,
              timestamp: timestamp,
              status: msg.status
            };
          });
          
          setMessages(mappedMessages);
        }
      } catch (error) {
        logger.error('Erreur lors du chargement des messages:', error);
        // En cas d'erreur, afficher un message de bienvenue par défaut
        const welcomeMessage: Message = {
          id: 'welcome',
          text: t('messages.welcome'),
          sender: 'support',
          timestamp: new Date(),
          status: 'read'
        };
        setMessages([welcomeMessage]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      loadMessages();
    }
  }, [user?.uid, syncKycStatus, chatService]);

  // Écouter les messages en temps réel
  useEffect(() => {
    if (!chatId || !user?.uid) return;

    logger.debug('Démarrage de l\'écoute en temps réel pour chatId:', chatId);
    
    const unsubscribe = chatService.loadChatMessages(chatId, (chatMessages) => {
      const mappedMessages: Message[] = chatMessages.map(msg => {
        const timestamp = convertTimestamp(msg.timestamp);
        const isFromUser = msg.senderId === user.uid;
        const sender: 'user' | 'support' = isFromUser ? 'user' : 'support';

        return {
          id: msg.id,
          text: msg.text,
          sender: sender,
          timestamp: timestamp,
          status: msg.status
        };
      });
      
      setMessages(mappedMessages);
    });

    return () => {
      logger.debug('Arrêt de l\'écoute en temps réel pour chatId:', chatId);
      unsubscribe();
    };
  }, [chatId, user?.uid, chatService]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && chatId && user?.uid) {
      const messageText = newMessage.trim();
      setNewMessage('');
      setIsTyping(true);

      try {
        // Envoyer le message utilisateur
        const userMessage = await chatService.sendMessage(chatId, messageText, user.uid);
        
        logger.success('Message utilisateur envoyé:', userMessage);
        
        // Marquer tous les messages comme lus
        await chatService.markAllMessagesAsRead(chatId, user.uid);

        // Simuler une réponse du support seulement pour le premier message
        if (messages.length === 0) {
          setTimeout(async () => {
            try {
              // Envoyer la réponse du support via Firestore
              const supportMessage = await chatService.sendMessage(chatId, t('messages.autoReply') || 'Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.', 'support');
              logger.success('Réponse du support envoyée:', supportMessage);
            } catch (error) {
              logger.error('Erreur lors de l\'envoi de la réponse du support:', error);
              // En cas d'erreur, créer un message local comme fallback
              const supportMessage: Message = {
                id: `support-${Date.now()}`,
                text: t('messages.autoReply') || 'Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.',
                sender: 'support',
                timestamp: new Date(),
                status: 'sent'
              };
              setMessages(prev => [...prev, supportMessage]);
              logger.success('Réponse du support simulée localement (fallback)');
            } finally {
              setIsTyping(false);
            }
          }, 2000);
        } else {
          setIsTyping(false);
        }
      } catch (error) {
        logger.error('Erreur lors de l\'envoi du message:', error);
        setIsTyping(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Fonction pour obtenir la locale basée sur la langue actuelle
  const getCurrentLocale = (): string => {
    const langMap: { [key: string]: string } = {
      'pt': 'pt-PT',
      'en': 'en-US',
      'es': 'es-ES',
      'de': 'de-DE',
      'it': 'it-IT',
      'nl': 'nl-NL',
      'fr': 'fr-FR'
    };
    return langMap[i18n.language] || 'fr-FR';
  };

  const formatTime = (date: Date) => {
    return formatDate(date, 'time', getCurrentLocale());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  // Si l'utilisateur n'est pas vérifié ou en cours de vérification, afficher le composant ModernVerificationState
  if (isUnverified) {
    const title = userStatus === 'pending' ? t('messages.verification.temporarilyUnavailableTitle') : t('messages.unavailable');
    const description = userStatus === 'pending' 
      ? t('messages.verification.pendingDescription')
      : t('messages.unavailableUnverified');
    
    return (
      <ModernVerificationState
        userStatus={userStatus}
        title={title}
        description={description}
        showFeatures={true}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('messages.title')}</h1>
        <p className="text-gray-600">{t('messages.subtitle')}</p>
      </div>

      {/* Chat Container - Fixed height like WhatsApp */}
      <div className="bg-white rounded-lg shadow-sm border flex flex-col flex-1 min-h-0">
        {/* Chat Header - Fixed */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{t('messages.supportName')}</h3>
              <p className="text-sm text-gray-500">{t('messages.online')} • {t('messages.quickResponse')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-500">{t('messages.onlineStatus')}</span>
          </div>
        </div>

        {/* Messages Area - Scrollable, takes remaining space */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center space-x-2 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t('messages.loading')}</span>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <div className={`flex items-center justify-between mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span className="text-xs">{formatTime(message.timestamp)}</span>
                      {message.sender === 'user' && (
                        <div className="flex items-center ml-2">
                          {getStatusIcon(message.status)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{t('messages.typing')}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input - Fixed at bottom */}
        <div className="p-4 border-t bg-gray-50 rounded-b-lg flex-shrink-0">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={String(t('messages.inputPlaceholder'))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage; 