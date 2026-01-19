import { useState } from 'react';

interface Message {
  id: number;
  text: string;
  time: string;
  sent: boolean;
}

interface Contact {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  online: boolean;
}

export default function ChatWhatsApp() {
  const [selectedContact, setSelectedContact] = useState<number>(1);
  const [messageText, setMessageText] = useState('');

  const contacts: Contact[] = [
    {
      id: 1,
      name: 'Carlos Silva',
      lastMessage: 'Obrigado pela atenção!',
      time: '10:45',
      unread: 0,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20Brazilian%20businessman%20portrait%20smiling%20confident%2C%20clean%20white%20background%2C%20corporate%20headshot%20style%2C%20high%20quality%20photography&width=100&height=100&seq=1&orientation=squarish',
      online: true,
    },
    {
      id: 2,
      name: 'Maria Santos',
      lastMessage: 'Quanto custa o rastreamento?',
      time: '10:32',
      unread: 2,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20Brazilian%20businesswoman%20portrait%20smiling%20confident%2C%20clean%20white%20background%2C%20corporate%20headshot%20style%2C%20high%20quality%20photography&width=100&height=100&seq=2&orientation=squarish',
      online: true,
    },
    {
      id: 3,
      name: 'João Oliveira',
      lastMessage: 'Preciso de ajuda com recurso',
      time: '09:58',
      unread: 1,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20Brazilian%20business%20man%20portrait%20smiling%20friendly%2C%20clean%20white%20background%2C%20corporate%20headshot%20style%2C%20high%20quality%20photography&width=100&height=100&seq=3&orientation=squarish',
      online: false,
    },
    {
      id: 4,
      name: 'Ana Paula',
      lastMessage: 'Vocês trabalham com frotas?',
      time: '09:15',
      unread: 0,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20Brazilian%20woman%20portrait%20smiling%20confident%20professional%2C%20clean%20white%20background%2C%20corporate%20headshot%20style%2C%20high%20quality%20photography&width=100&height=100&seq=4&orientation=squarish',
      online: true,
    },
    {
      id: 5,
      name: 'Pedro Costa',
      lastMessage: 'Quando sai o resultado?',
      time: '08:47',
      unread: 3,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20Brazilian%20male%20portrait%20smiling%20confident%20business%2C%20clean%20white%20background%2C%20corporate%20headshot%20style%2C%20high%20quality%20photography&width=100&height=100&seq=5&orientation=squarish',
      online: false,
    },
    {
      id: 6,
      name: 'Transportadora ABC',
      lastMessage: 'Tenho 50 veículos para rastrear',
      time: '08:12',
      unread: 0,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20company%20logo%20transportation%20business%2C%20clean%20white%20background%2C%20corporate%20style%2C%20high%20quality&width=100&height=100&seq=6&orientation=squarish',
      online: true,
    },
  ];

  const [conversations, setConversations] = useState<Record<number, Message[]>>({
    1: [
      { id: 1, text: 'Olá! Gostaria de informações sobre recursos de multas', time: '10:30', sent: false },
      { id: 2, text: 'Olá Carlos! Claro, temos especialistas em recursos de trânsito. Qual tipo de infração você recebeu?', time: '10:31', sent: true },
      { id: 3, text: 'Foi uma multa por excesso de velocidade, código 7471', time: '10:33', sent: false },
      { id: 4, text: 'Entendo. Essa é uma infração gravíssima. Podemos analisar seu caso e criar um recurso personalizado. O valor do serviço é R$ 350,00 e temos 85% de taxa de sucesso.', time: '10:35', sent: true },
      { id: 5, text: 'Quanto tempo demora o processo?', time: '10:40', sent: false },
      { id: 6, text: 'O prazo médio é de 30 a 60 dias. Você acompanha tudo em tempo real pelo nosso sistema. Posso enviar um orçamento detalhado?', time: '10:42', sent: true },
      { id: 7, text: 'Sim, por favor!', time: '10:44', sent: false },
      { id: 8, text: 'Perfeito! Vou preparar e enviar em alguns minutos. Você também pode acessar nosso portal para mais informações.', time: '10:44', sent: true },
      { id: 9, text: 'Obrigado pela atenção!', time: '10:45', sent: false },
    ],
    2: [
      { id: 1, text: 'Boa tarde! Vi que vocês fazem rastreamento de multas', time: '10:30', sent: false },
      { id: 2, text: 'Boa tarde Maria! Sim, fazemos rastreamento completo. Quantos veículos você tem?', time: '10:31', sent: true },
      { id: 3, text: 'Tenho 3 veículos da minha empresa', time: '10:32', sent: false },
      { id: 4, text: 'Quanto custa o rastreamento?', time: '10:32', sent: false },
    ],
    3: [
      { id: 1, text: 'Olá, entrei com recurso há 20 dias', time: '09:55', sent: false },
      { id: 2, text: 'Olá João! Vou verificar o status do seu recurso. Pode me passar o número do protocolo?', time: '09:56', sent: true },
      { id: 3, text: 'É o protocolo REC-2024-0145', time: '09:57', sent: false },
      { id: 4, text: 'Preciso de ajuda com recurso', time: '09:58', sent: false },
    ],
    4: [
      { id: 1, text: 'Bom dia! Vocês atendem empresas?', time: '09:10', sent: false },
      { id: 2, text: 'Bom dia Ana! Sim, atendemos empresas de todos os portes. Temos planos especiais para frotas.', time: '09:12', sent: true },
      { id: 3, text: 'Vocês trabalham com frotas?', time: '09:15', sent: false },
    ],
    5: [
      { id: 1, text: 'Oi, entrei com recurso semana passada', time: '08:45', sent: false },
      { id: 2, text: 'Olá Pedro! Seu recurso está em análise na JARI. Normalmente leva de 30 a 45 dias.', time: '08:46', sent: true },
      { id: 3, text: 'Quando sai o resultado?', time: '08:47', sent: false },
    ],
    6: [
      { id: 1, text: 'Olá, sou da Transportadora ABC', time: '08:10', sent: false },
      { id: 2, text: 'Olá! Bem-vindo! Como podemos ajudar sua transportadora?', time: '08:11', sent: true },
      { id: 3, text: 'Tenho 50 veículos para rastrear', time: '08:12', sent: false },
    ],
  });

  const currentContact = contacts.find(c => c.id === selectedContact);
  const currentMessages = conversations[selectedContact] || [];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMessage: Message = {
        id: currentMessages.length + 1,
        text: messageText,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        sent: true,
      };
      
      setConversations({
        ...conversations,
        [selectedContact]: [...currentMessages, newMessage],
      });
      
      setMessageText('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Chat WhatsApp</h2>
          <p className="text-gray-600 mt-2">Atendimento em tempo real com seus clientes</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-green-100 rounded-lg border border-green-300">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '700px' }}>
        <div className="flex h-full">
          {/* Lista de Contatos */}
          <div className="w-96 border-r border-gray-200 flex flex-col">
            <div className="p-4 bg-[#1E3A8A] text-white">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="ri-whatsapp-line text-2xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg">WhatsApp Business</h3>
                  <p className="text-xs text-white/80">6 conversas ativas</p>
                </div>
              </div>
            </div>

            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar conversa..."
                  className="w-full px-4 py-2 pl-10 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                />
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact.id)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedContact === contact.id ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                      </div>
                      {contact.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-gray-800 truncate">{contact.name}</h4>
                        <span className="text-xs text-gray-500">{contact.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                    </div>
                    {contact.unread > 0 && (
                      <div className="w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">{contact.unread}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Área de Chat */}
          <div className="flex-1 flex flex-col">
            {/* Header do Chat */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img src={currentContact?.avatar} alt={currentContact?.name} className="w-full h-full object-cover" />
                    </div>
                    {currentContact?.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{currentContact?.name}</h3>
                    <p className="text-xs text-gray-500">
                      {currentContact?.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors cursor-pointer">
                    <i className="ri-phone-line text-xl text-gray-600"></i>
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors cursor-pointer">
                    <i className="ri-more-2-fill text-xl text-gray-600"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#E5DDD5]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23e5ddd5\'/%3E%3Cpath d=\'M20 20h60v60H20z\' fill=\'%23d9d0c7\' opacity=\'.1\'/%3E%3C/svg%3E")' }}>
              <div className="space-y-4">
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-lg ${
                        message.sent
                          ? 'bg-[#D9FDD3] text-gray-800'
                          : 'bg-white text-gray-800'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <div className="flex items-center justify-end space-x-1 mt-1">
                        <span className="text-xs text-gray-500">{message.time}</span>
                        {message.sent && (
                          <i className="ri-check-double-line text-sm text-blue-500"></i>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input de Mensagem */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors cursor-pointer">
                  <i className="ri-emotion-happy-line text-2xl text-gray-600"></i>
                </button>
                <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors cursor-pointer">
                  <i className="ri-attachment-line text-2xl text-gray-600"></i>
                </button>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Digite uma mensagem..."
                  className="flex-1 px-4 py-3 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] border border-gray-200"
                />
                <button
                  onClick={handleSendMessage}
                  className="w-12 h-12 bg-[#10B981] hover:bg-green-600 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  <i className="ri-send-plane-fill text-xl text-white"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
