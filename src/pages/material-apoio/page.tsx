
export default function MaterialApoio() {
  const materials = [
    {
      id: 1,
      type: 'logo',
      title: 'Logo Principal',
      description: 'Logo em alta resolução para uso em materiais impressos e digitais',
      format: 'PNG, SVG',
      size: '2.4 MB',
      image: 'https://readdy.ai/api/search-image?query=Professional%20modern%20logo%20design%20for%20legal%20traffic%20resources%20company%2C%20clean%20minimalist%20style%2C%20blue%20and%20green%20colors%2C%20white%20background%2C%20corporate%20branding%20identity%2C%20high%20quality%20vector%20illustration&width=400&height=300&seq=1&orientation=landscape',
      icon: 'ri-image-line',
      color: 'from-blue-600 to-blue-700',
    },
    {
      id: 2,
      type: 'logo',
      title: 'Logo Versão Horizontal',
      description: 'Logo horizontal para assinaturas de e-mail e cabeçalhos',
      format: 'PNG, SVG',
      size: '1.8 MB',
      image: 'https://readdy.ai/api/search-image?query=Horizontal%20logo%20design%20for%20legal%20traffic%20resources%20company%2C%20modern%20professional%20style%2C%20blue%20and%20green%20colors%2C%20white%20background%2C%20corporate%20branding%2C%20high%20quality%20vector%20illustration&width=400&height=300&seq=2&orientation=landscape',
      icon: 'ri-image-line',
      color: 'from-blue-600 to-blue-700',
    },
    {
      id: 3,
      type: 'logo',
      title: 'Logo Versão Monocromática',
      description: 'Logo em preto e branco para impressões especiais',
      format: 'PNG, SVG',
      size: '1.2 MB',
      image: 'https://readdy.ai/api/search-image?query=Monochrome%20black%20and%20white%20logo%20design%20for%20legal%20traffic%20resources%20company%2C%20minimalist%20professional%20style%2C%20clean%20white%20background%2C%20corporate%20branding%20identity%2C%20high%20quality%20vector%20illustration&width=400&height=300&seq=3&orientation=landscape',
      icon: 'ri-image-line',
      color: 'from-gray-700 to-gray-800',
    },
    {
      id: 4,
      type: 'card',
      title: 'Modelo de Cartão de Visita - Frente',
      description: 'Design profissional para a frente do cartão de visita',
      format: 'PDF, AI',
      size: '3.1 MB',
      image: 'https://readdy.ai/api/search-image?query=Professional%20business%20card%20front%20design%20for%20legal%20traffic%20resources%20company%2C%20modern%20corporate%20style%2C%20blue%20and%20green%20colors%2C%20clean%20layout%20with%20logo%20and%20contact%20information%2C%20high%20quality%20print%20ready%20design&width=400&height=300&seq=4&orientation=landscape',
      icon: 'ri-bank-card-line',
      color: 'from-green-600 to-green-700',
    },
    {
      id: 5,
      type: 'card',
      title: 'Modelo de Cartão de Visita - Verso',
      description: 'Design profissional para o verso do cartão de visita',
      format: 'PDF, AI',
      size: '2.9 MB',
      image: 'https://readdy.ai/api/search-image?query=Professional%20business%20card%20back%20design%20for%20legal%20traffic%20resources%20company%2C%20modern%20corporate%20style%2C%20blue%20and%20green%20colors%2C%20clean%20layout%20with%20services%20information%2C%20high%20quality%20print%20ready%20design&width=400&height=300&seq=5&orientation=landscape',
      icon: 'ri-bank-card-line',
      color: 'from-green-600 to-green-700',
    },
    {
      id: 6,
      type: 'guide',
      title: 'Como Configurar seu WhatsApp de Forma Profissional',
      description: 'Guia completo com passo a passo para configuração profissional do WhatsApp Business',
      format: 'PDF',
      size: '4.7 MB',
      image: 'https://readdy.ai/api/search-image?query=Professional%20WhatsApp%20Business%20setup%20guide%20cover%20design%2C%20modern%20corporate%20style%2C%20smartphone%20showing%20WhatsApp%20interface%2C%20blue%20and%20green%20colors%2C%20clean%20white%20background%2C%20professional%20business%20documentation%20style&width=400&height=300&seq=6&orientation=landscape',
      icon: 'ri-file-pdf-line',
      color: 'from-orange-600 to-orange-700',
    },
    {
      id: 7,
      type: 'graphic',
      title: 'Banner para Redes Sociais',
      description: 'Banners otimizados para Facebook, Instagram e LinkedIn',
      format: 'PNG, PSD',
      size: '5.2 MB',
      image: 'https://readdy.ai/api/search-image?query=Professional%20social%20media%20banner%20design%20for%20legal%20traffic%20resources%20company%2C%20modern%20corporate%20style%2C%20blue%20and%20green%20colors%2C%20clean%20layout%20with%20call%20to%20action%2C%20high%20quality%20digital%20marketing%20material&width=400&height=300&seq=7&orientation=landscape',
      icon: 'ri-layout-line',
      color: 'from-purple-600 to-purple-700',
    },
    {
      id: 8,
      type: 'graphic',
      title: 'Papel Timbrado',
      description: 'Modelo de papel timbrado para documentos oficiais',
      format: 'PDF, DOCX',
      size: '1.9 MB',
      image: 'https://readdy.ai/api/search-image?query=Professional%20letterhead%20design%20for%20legal%20traffic%20resources%20company%2C%20modern%20corporate%20style%2C%20blue%20and%20green%20colors%2C%20clean%20layout%20with%20logo%20and%20company%20information%2C%20high%20quality%20print%20ready%20document&width=400&height=300&seq=8&orientation=landscape',
      icon: 'ri-file-text-line',
      color: 'from-indigo-600 to-indigo-700',
    },
    {
      id: 9,
      type: 'graphic',
      title: 'Assinatura de E-mail',
      description: 'Template de assinatura profissional para e-mails corporativos',
      format: 'HTML',
      size: '0.5 MB',
      image: 'https://readdy.ai/api/search-image?query=Professional%20email%20signature%20template%20design%20for%20legal%20traffic%20resources%20company%2C%20modern%20corporate%20style%2C%20blue%20and%20green%20colors%2C%20clean%20layout%20with%20contact%20information%20and%20social%20media%20icons%2C%20high%20quality%20digital%20design&width=400&height=300&seq=9&orientation=landscape',
      icon: 'ri-mail-line',
      color: 'from-teal-600 to-teal-700',
    },
    {
      id: 10,
      type: 'graphic',
      title: 'Apresentação Institucional',
      description: 'Template de apresentação PowerPoint com identidade visual',
      format: 'PPTX, PDF',
      size: '8.3 MB',
      image: 'https://readdy.ai/api/search-image?query=Professional%20PowerPoint%20presentation%20template%20design%20for%20legal%20traffic%20resources%20company%2C%20modern%20corporate%20style%2C%20blue%20and%20green%20colors%2C%20clean%20slides%20layout%20with%20charts%20and%20infographics%2C%20high%20quality%20business%20presentation&width=400&height=300&seq=10&orientation=landscape',
      icon: 'ri-slideshow-line',
      color: 'from-red-600 to-red-700',
    },
    {
      id: 11,
      type: 'graphic',
      title: 'Folder Institucional',
      description: 'Folder tri-fold com informações sobre serviços',
      format: 'PDF, AI',
      size: '6.1 MB',
      image: 'https://readdy.ai/api/search-image?query=Professional%20tri-fold%20brochure%20design%20for%20legal%20traffic%20resources%20company%2C%20modern%20corporate%20style%2C%20blue%20and%20green%20colors%2C%20clean%20layout%20with%20services%20information%20and%20images%2C%20high%20quality%20print%20ready%20marketing%20material&width=400&height=300&seq=11&orientation=landscape',
      icon: 'ri-book-open-line',
      color: 'from-cyan-600 to-cyan-700',
    },
    {
      id: 12,
      type: 'graphic',
      title: 'Capa para Relatórios',
      description: 'Template de capa profissional para relatórios e documentos',
      format: 'PDF, DOCX',
      size: '2.3 MB',
      image: 'https://readdy.ai/api/search-image?query=Professional%20report%20cover%20design%20for%20legal%20traffic%20resources%20company%2C%20modern%20corporate%20style%2C%20blue%20and%20green%20colors%2C%20clean%20layout%20with%20geometric%20patterns%2C%20high%20quality%20business%20document%20design&width=400&height=300&seq=12&orientation=landscape',
      icon: 'ri-file-chart-line',
      color: 'from-emerald-600 to-emerald-700',
    },
  ];

  const categories = [
    { id: 'all', label: 'Todos', icon: 'ri-apps-line' },
    { id: 'logo', label: 'Logos', icon: 'ri-image-line' },
    { id: 'card', label: 'Cartões de Visita', icon: 'ri-bank-card-line' },
    { id: 'guide', label: 'Guias', icon: 'ri-file-pdf-line' },
    { id: 'graphic', label: 'Materiais Gráficos', icon: 'ri-layout-line' },
  ];

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Material de Apoio</h2>
          <p className="text-sm text-gray-600 mt-2">Baixe logos, modelos e materiais gráficos para usar nossa marca</p>
        </div>
        <button className="px-6 py-3 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-download-cloud-line mr-2"></i>
          Baixar Tudo
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="ri-image-line text-2xl"></i>
            </div>
            <span className="text-3xl font-bold">3</span>
          </div>
          <p className="text-sm font-medium">Logos Disponíveis</p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="ri-bank-card-line text-2xl"></i>
            </div>
            <span className="text-3xl font-bold">2</span>
          </div>
          <p className="text-sm font-medium">Modelos de Cartão</p>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="ri-file-pdf-line text-2xl"></i>
            </div>
            <span className="text-3xl font-bold">1</span>
          </div>
          <p className="text-sm font-medium">Guia Profissional</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="ri-layout-line text-2xl"></i>
            </div>
            <span className="text-3xl font-bold">6</span>
          </div>
          <p className="text-sm font-medium">Materiais Gráficos</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              className="px-5 py-2.5 bg-gray-100 hover:bg-[#1E3A8A] hover:text-white text-gray-700 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center space-x-2"
            >
              <i className={`${category.icon} text-lg`}></i>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Materiais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((material) => (
          <div key={material.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative w-full h-48">
              <img
                src={material.image}
                alt={material.title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute top-3 right-3 bg-gradient-to-r ${material.color} text-white px-3 py-1 rounded-full flex items-center space-x-1`}>
                <i className={`${material.icon} text-sm`}></i>
                <span className="text-xs font-semibold">{material.format}</span>
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{material.title}</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{material.description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-gray-500">
                  <i className="ri-file-line text-lg"></i>
                  <span className="text-xs font-medium">{material.size}</span>
                </div>
                <button className={`px-4 py-2 bg-gradient-to-r ${material.color} text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap flex items-center space-x-2`}>
                  <i className="ri-download-line"></i>
                  <span>Baixar</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Diretrizes de Uso */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-[#1E3A8A] rounded-xl flex items-center justify-center">
            <i className="ri-information-line text-white text-2xl"></i>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Diretrizes de Uso da Marca</h3>
            <p className="text-sm text-gray-600">Orientações importantes para uso correto dos materiais</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-[#10B981] rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-check-line text-white text-xl"></i>
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-3">Permitido</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-[#10B981] mt-0.5">✓</span>
                    <span>Usar os materiais em comunicações oficiais</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#10B981] mt-0.5">✓</span>
                    <span>Adaptar cores para fundos diferentes</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#10B981] mt-0.5">✓</span>
                    <span>Redimensionar mantendo proporções</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#10B981] mt-0.5">✓</span>
                    <span>Usar em materiais impressos e digitais</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-6 border border-red-200">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-close-line text-white text-xl"></i>
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-3">Não Permitido</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-red-600 mt-0.5">✗</span>
                    <span>Alterar cores ou elementos da logo</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-600 mt-0.5">✗</span>
                    <span>Distorcer ou deformar a marca</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-600 mt-0.5">✗</span>
                    <span>Adicionar efeitos ou sombras</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-600 mt-0.5">✗</span>
                    <span>Usar em contextos inadequados</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-5 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-[#1E3A8A] rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="ri-lightbulb-line text-white text-lg"></i>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Dica Importante</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                Todos os materiais foram desenvolvidos seguindo as melhores práticas de design e identidade visual. 
                Para garantir a consistência da marca, sempre utilize os arquivos originais disponibilizados aqui. 
                Em caso de dúvidas sobre o uso correto, entre em contato com nossa equipe de suporte.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Guia WhatsApp em Destaque */}
      <div className="bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          <div className="flex flex-col justify-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6">
              <i className="ri-whatsapp-line text-4xl"></i>
            </div>
            <h3 className="text-3xl font-bold mb-4">Guia Completo WhatsApp Business</h3>
            <p className="text-lg leading-relaxed mb-6 text-white/90">
              Aprenda a configurar seu WhatsApp de forma profissional e padronizada. 
              Este guia inclui passo a passo detalhado, melhores práticas e dicas exclusivas 
              para atendimento de excelência.
            </p>
            <div className="space-y-3 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-check-line text-sm"></i>
                </div>
                <span className="text-sm">Configuração de perfil profissional</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-check-line text-sm"></i>
                </div>
                <span className="text-sm">Mensagens automáticas e respostas rápidas</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-check-line text-sm"></i>
                </div>
                <span className="text-sm">Catálogo de serviços e etiquetas</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-check-line text-sm"></i>
                </div>
                <span className="text-sm">Métricas e análise de atendimento</span>
              </div>
            </div>
            <button className="px-8 py-4 bg-white text-[#128C7E] rounded-lg text-base font-bold hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center space-x-2 w-fit">
              <i className="ri-download-line text-xl"></i>
              <span>Baixar Guia Completo (PDF)</span>
            </button>
          </div>

          <div className="relative w-full h-full min-h-96 rounded-xl overflow-hidden">
            <img
              src="https://readdy.ai/api/search-image?query=Professional%20WhatsApp%20Business%20interface%20on%20smartphone%20screen%20showing%20professional%20chat%20conversation%20with%20customer%2C%20modern%20clean%20design%2C%20green%20and%20white%20colors%2C%20business%20communication%20concept%2C%20high%20quality%20photography&width=600&height=600&seq=13&orientation=squarish"
              alt="WhatsApp Business"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
