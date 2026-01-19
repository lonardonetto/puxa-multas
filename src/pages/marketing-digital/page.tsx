export default function MarketingDigital() {
  const instagramPosts = [
    {
      id: 1,
      image: 'https://readdy.ai/api/search-image?query=Professional%20business%20resources%20document%20with%20legal%20papers%20and%20gavel%20on%20clean%20white%20desk%2C%20modern%20office%20setting%2C%20bright%20natural%20lighting%2C%20minimalist%20composition%2C%20corporate%20professional%20style%2C%20high%20quality%20photography&width=400&height=400&seq=1&orientation=squarish',
      caption: '📋 Recebeu uma multa injusta? Nossos recursos especializados podem te ajudar a reverter! Entre em contato e conheça nossos serviços.',
      likes: 234,
      comments: 18,
    },
    {
      id: 2,
      image: 'https://readdy.ai/api/search-image?query=Modern%20car%20fleet%20management%20dashboard%20on%20computer%20screen%20showing%20vehicle%20tracking%2C%20clean%20office%20desk%2C%20professional%20business%20environment%2C%20bright%20lighting%2C%20corporate%20style%20photography&width=400&height=400&seq=2&orientation=squarish',
      caption: '🚗 Gestão de frotas nunca foi tão fácil! Rastreie todas as multas dos seus veículos em um só lugar. Tecnologia que simplifica sua rotina.',
      likes: 189,
      comments: 12,
    },
    {
      id: 3,
      image: 'https://readdy.ai/api/search-image?query=Artificial%20intelligence%20technology%20concept%20with%20digital%20interface%20and%20legal%20documents%2C%20modern%20professional%20setting%2C%20clean%20white%20background%2C%20futuristic%20corporate%20style%2C%20high%20quality%20photography&width=400&height=400&seq=3&orientation=squarish',
      caption: '🤖 Inteligência Artificial a serviço dos seus recursos! Criamos defesas personalizadas e eficientes para cada tipo de infração.',
      likes: 312,
      comments: 25,
    },
    {
      id: 4,
      image: 'https://readdy.ai/api/search-image?query=Happy%20business%20team%20celebrating%20success%20in%20modern%20office%2C%20professional%20people%20smiling%2C%20bright%20corporate%20environment%2C%20clean%20white%20background%2C%20professional%20photography%20style&width=400&height=400&seq=4&orientation=squarish',
      caption: '✅ Mais de 1.200 recursos aprovados este ano! Junte-se aos nossos clientes satisfeitos e recupere seus pontos na CNH.',
      likes: 267,
      comments: 31,
    },
    {
      id: 5,
      image: 'https://readdy.ai/api/search-image?query=Professional%20business%20consultation%20meeting%20with%20documents%20and%20laptop%2C%20modern%20office%20setting%2C%20clean%20white%20desk%2C%20corporate%20professional%20style%2C%20bright%20natural%20lighting%2C%20high%20quality%20photography&width=400&height=400&seq=5&orientation=squarish',
      caption: '💼 Consultoria especializada em recursos de trânsito. Nossa equipe está pronta para defender seus direitos com excelência.',
      likes: 198,
      comments: 15,
    },
    {
      id: 6,
      image: 'https://readdy.ai/api/search-image?query=Digital%20marketing%20campaign%20concept%20with%20smartphone%20showing%20social%20media%20analytics%2C%20modern%20office%20desk%2C%20clean%20white%20background%2C%20professional%20corporate%20style%20photography&width=400&height=400&seq=6&orientation=squarish',
      caption: '📱 Acompanhe suas multas em tempo real pelo nosso app! Praticidade e controle na palma da sua mão.',
      likes: 221,
      comments: 19,
    },
  ];

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Marketing Digital</h2>
          <p className="text-sm text-gray-600 mt-2">Gerencie suas campanhas e conteúdos para redes sociais</p>
        </div>
        <button className="px-6 py-3 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-add-line mr-2"></i>
          Nova Campanha
        </button>
      </div>

      {/* Posts para Instagram */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-xl flex items-center justify-center">
              <i className="ri-instagram-line text-white text-2xl"></i>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Posts para Instagram</h3>
              <p className="text-sm text-gray-600">Publicações sugeridas para sua empresa de recursos</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap">
            <i className="ri-download-line mr-2"></i>
            Baixar Todos
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instagramPosts.map((post) => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative w-full h-80">
                <img
                  src={post.image}
                  alt={`Post ${post.id}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-xs font-semibold text-gray-800">Post #{post.id}</span>
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-sm text-gray-700 leading-relaxed mb-4">{post.caption}</p>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <i className="ri-heart-line text-lg"></i>
                      <span className="text-sm font-medium">{post.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <i className="ri-chat-3-line text-lg"></i>
                      <span className="text-sm font-medium">{post.comments}</span>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap">
                    <i className="ri-download-line mr-1"></i>
                    Baixar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="ri-lightbulb-line text-white text-lg"></i>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-1">Dicas para melhor engajamento</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Publique nos horários de pico: 12h-14h e 18h-21h</li>
                <li>• Use hashtags relevantes: #RecursosDeTransito #MultasDeTransito #DefesaDeMultas</li>
                <li>• Interaja com os comentários nas primeiras horas após a publicação</li>
                <li>• Varie o tipo de conteúdo: educativo, cases de sucesso e dicas práticas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Campanha */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-[#1E3A8A] rounded-xl flex items-center justify-center">
            <i className="ri-megaphone-line text-white text-2xl"></i>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Campanha</h3>
            <p className="text-sm text-gray-600">Divulgue sua empresa e alcance novos leads</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative w-full h-full rounded-xl overflow-hidden">
            <img
              src="https://readdy.ai/api/search-image?query=Professional%20digital%20marketing%20campaign%20concept%20with%20laptop%20showing%20analytics%20dashboard%20and%20social%20media%20icons%2C%20modern%20office%20desk%20with%20coffee%2C%20clean%20white%20background%2C%20bright%20natural%20lighting%2C%20corporate%20professional%20style%2C%20high%20quality%20photography&width=600&height=600&seq=7&orientation=squarish"
              alt="Campanha Digital"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-3 py-1 bg-[#10B981] text-white text-xs font-semibold rounded-full whitespace-nowrap">
                    Campanha Premium
                  </span>
                  <span className="px-3 py-1 bg-[#1E3A8A] text-white text-xs font-semibold rounded-full whitespace-nowrap">
                    Alta Performance
                  </span>
                </div>
                <h4 className="text-lg font-bold text-gray-800">Alcance Máximo Garantido</h4>
                <p className="text-sm text-gray-600 mt-1">Estratégia completa para captação de leads qualificados</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 flex flex-col">
            <div className="bg-gradient-to-br from-[#1E3A8A] to-[#10B981] rounded-xl p-8 text-white flex-1 flex flex-col">
              <h4 className="text-2xl font-bold mb-4">Contrate uma Campanha</h4>
              <p className="text-lg leading-relaxed mb-6">
                Contrate uma Campanha para divulgar sua empresa e alcançar novos leads.
              </p>
              
              <div className="space-y-4 mb-6 flex-1">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="ri-check-line text-sm"></i>
                  </div>
                  <div>
                    <p className="font-semibold">Anúncio Insta e Face Ads</p>
                    <p className="text-sm text-white/80">Campanhas segmentadas no Instagram e Facebook</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="ri-check-line text-sm"></i>
                  </div>
                  <div>
                    <p className="font-semibold">Google Ads</p>
                    <p className="text-sm text-white/80">Anúncios no Google para máxima visibilidade</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="ri-check-line text-sm"></i>
                  </div>
                  <div>
                    <p className="font-semibold">Relatórios Detalhados</p>
                    <p className="text-sm text-white/80">Métricas e análises semanais</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="ri-check-line text-sm"></i>
                  </div>
                  <div>
                    <p className="font-semibold">Captação de Leads Qualificados</p>
                    <p className="text-sm text-white/80">Landing pages otimizadas + CRM integrado</p>
                  </div>
                </div>
              </div>

              <button className="w-full px-6 py-4 bg-white text-[#1E3A8A] rounded-lg text-base font-bold hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-rocket-line mr-2"></i>
                Contratar Campanha Agora
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                <div className="w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="ri-eye-line text-white text-xl"></i>
                </div>
                <p className="text-2xl font-bold text-gray-800">50K+</p>
                <p className="text-xs text-gray-600 mt-1">Impressões/mês</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                <div className="w-12 h-12 bg-[#1E3A8A] rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="ri-user-add-line text-white text-xl"></i>
                </div>
                <p className="text-2xl font-bold text-gray-800">200+</p>
                <p className="text-xs text-gray-600 mt-1">Leads/mês</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                <div className="w-12 h-12 bg-[#F59E0B] rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="ri-line-chart-line text-white text-xl"></i>
                </div>
                <p className="text-2xl font-bold text-gray-800">85%</p>
                <p className="text-xs text-gray-600 mt-1">Taxa conversão</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-[#1E3A8A] rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-question-answer-line text-white text-xl"></i>
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">Como funciona?</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Nossa equipe especializada cria e gerencia toda a estratégia digital da sua empresa. 
                  Desde a criação de conteúdo até a análise de resultados, cuidamos de tudo para você 
                  focar no que realmente importa: atender seus clientes.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-[#10B981] rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-time-line text-white text-xl"></i>
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">Quando começo a ver resultados?</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Os primeiros leads começam a chegar já na primeira semana! Em 30 dias você terá 
                  um fluxo constante de clientes potenciais interessados nos seus serviços de recursos 
                  de trânsito e gestão de multas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campanhas Ativas */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Campanhas Ativas</h3>
          <button className="text-sm text-[#1E3A8A] font-medium hover:underline cursor-pointer whitespace-nowrap">
            Ver todas
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-[#10B981] rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-advertisement-line text-white text-2xl"></i>
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-800">Campanha Google Ads - Recursos de Trânsito</h4>
                <p className="text-sm text-gray-600 mt-1">Iniciada em 15/01/2024 • 45 dias restantes</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#10B981]">1.247</p>
                <p className="text-xs text-gray-600">Cliques</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#1E3A8A]">89</p>
                <p className="text-xs text-gray-600">Conversões</p>
              </div>
              <span className="px-4 py-2 bg-[#10B981] text-white text-sm font-semibold rounded-lg whitespace-nowrap">
                Ativa
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-instagram-line text-white text-2xl"></i>
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-800">Campanha Instagram - Gestão de Frotas</h4>
                <p className="text-sm text-gray-600 mt-1">Iniciada em 20/01/2024 • 40 dias restantes</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">3.456</p>
                <p className="text-xs text-gray-600">Alcance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-600">156</p>
                <p className="text-xs text-gray-600">Leads</p>
              </div>
              <span className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-lg whitespace-nowrap">
                Ativa
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}