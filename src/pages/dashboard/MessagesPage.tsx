import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Paperclip, Smile, Clock, Check, CheckCheck, Loader2 } from 'lucide-react';
import { FirebaseDataService, FirebaseMessage } from '../../services/firebaseData';
import { parseFirestoreDate, formatDate } from '../../utils/dateUtils';
import ModernVerificationState from '../../components/ModernVerificationState';
import { useKycSync } from '../../hooks/useNotifications';
import { logger } from '../../utils/logger';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

const MessagesPage: React.FC = () => {
  const { t } = useTranslation();
  const { userStatus, isUnverified, syncKycStatus } = useKycSync();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Charger les messages depuis Firestore
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const userId = FirebaseDataService.getCurrentUserId();
        
        if (!userId) {
          logger.error('Aucun utilisateur connecté');
          setLoading(false);
          return;
        }

        // Synchroniser le statut KYC avant de charger les messages
        await syncKycStatus();

        logger.debug('Chargement des messages pour userId:', userId);
        const firebaseMessages = await FirebaseDataService.getUserMessages(userId);
        
        logger.debug('Messages reçus:', firebaseMessages);
        
        // Si aucun message dans Firestore, créer un message de bienvenue par défaut
        if (firebaseMessages.length === 0) {
          logger.warn('Aucun message trouvé, création d\'un message de bienvenue');
          const welcomeMessage: Message = {
            id: 'welcome',
            text: 'Bonjour ! Je suis votre assistant virtuel AmCbunq. Comment puis-je vous aider aujourd\'hui ?',
            sender: 'support',
            timestamp: new Date(),
            status: 'read'
          };
          setMessages([welcomeMessage]);
        } else {
          logger.success('Messages chargés avec succès');
          // Mapper les messages Firebase vers le format local
          const mappedMessages: Message[] = firebaseMessages.map(msg => {
            // Conversion sécurisée de la date avec l'utilitaire
            const timestamp = parseFirestoreDate(msg.timestamp);

            // Déterminer le sender : si senderId est l'utilisateur connecté, c'est 'user', sinon 'support'
            const currentUserId = FirebaseDataService.getCurrentUserId();
            const isFromUser = msg.senderId === currentUserId;
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
          text: 'Bonjour ! Je suis votre assistant virtuel AmCbunq. Comment puis-je vous aider aujourd\'hui ?',
          sender: 'support',
          timestamp: new Date(),
          status: 'read'
        };
        setMessages([welcomeMessage]);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [syncKycStatus]);

  // Synchroniser le statut KYC au chargement
  useEffect(() => {
    syncKycStatus();
  }, [syncKycStatus]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const userId = FirebaseDataService.getCurrentUserId();
      if (!userId) {
        logger.error('Aucun utilisateur connecté');
        return;
      }

      const messageText = newMessage.trim();
      setNewMessage('');
      setIsTyping(true);

      try {
        // Envoyer le message utilisateur
        const userMessage = await FirebaseDataService.sendMessage(userId, messageText, 'user');
        
        if (userMessage) {
          // Déterminer le sender basé sur senderId
          const currentUserId = FirebaseDataService.getCurrentUserId();
          const isFromUser = userMessage.senderId === currentUserId;
          const sender: 'user' | 'support' = isFromUser ? 'user' : 'support';
          
          const localUserMessage: Message = {
            id: userMessage.id,
            text: userMessage.text,
            sender: sender,
            timestamp: parseFirestoreDate(userMessage.timestamp),
            status: userMessage.status
          };
          
          setMessages(prev => [...prev, localUserMessage]);
        }

        // Simuler une réponse du support
        setTimeout(async () => {
          const supportResponse = await FirebaseDataService.sendMessage(userId, 'Merci pour votre message. Un conseiller va vous répondre dans les plus brefs délais.', 'support');
          
          if (supportResponse) {
            // Déterminer le sender basé sur senderId
            const currentUserId = FirebaseDataService.getCurrentUserId();
            const isFromUser = supportResponse.senderId === currentUserId;
            const sender: 'user' | 'support' = isFromUser ? 'user' : 'support';
            
            const localSupportMessage: Message = {
              id: supportResponse.id,
              text: supportResponse.text,
              sender: sender,
              timestamp: parseFirestoreDate(supportResponse.timestamp),
              status: supportResponse.status
            };
            
            setMessages(prev => [...prev, localSupportMessage]);
          }
          
          setIsTyping(false);
        }, 2000);
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

  const formatTime = (date: Date) => {
    return formatDate(date, 'time');
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
    const title = userStatus === 'pending' ? 'Messages temporairement indisponibles' : 'Messages indisponibles';
    const description = userStatus === 'pending' 
      ? 'La messagerie sera disponible une fois votre vérification d\'identité terminée. Votre dossier est en cours d\'examen.'
      : 'Pour accéder au chat avec notre support, vous devez d\'abord valider votre identité.';
    
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
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Service client AmCbunq</p>
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
              <h3 className="font-semibold text-gray-900">Support AmCbunq</h3>
              <p className="text-sm text-gray-500">En ligne • Réponse rapide</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-500">En ligne</span>
          </div>
        </div>

        {/* Messages Area - Scrollable, takes remaining space */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center space-x-2 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Chargement des messages...</span>
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
                      <span className="text-sm">Support en train d'écrire...</span>
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
                placeholder="Tapez votre message..."
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