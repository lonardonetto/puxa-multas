
import { useState } from 'react';

export default function Educacional() {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

  const courses = [
    {
      id: 1,
      title: 'Direito do Trânsito Básico',
      description: 'Fundamentos essenciais do Direito do Trânsito para iniciantes. Aprenda sobre legislação, infrações e procedimentos básicos.',
      duration: '4h 30min',
      lessons: 12,
      level: 'Básico',
      thumbnail: 'https://readdy.ai/api/search-image?query=Professional%20law%20education%20course%20thumbnail%20about%20basic%20traffic%20law%2C%20modern%20clean%20design%20with%20gavel%20and%20traffic%20signs%2C%20blue%20and%20green%20colors%2C%20educational%20concept%2C%20high%20quality%20illustration&width=400&height=225&seq=1&orientation=landscape',
      progress: 45,
      category: 'Fundamentos',
    },
    {
      id: 2,
      title: 'Como Atender Cliente de Edital',
      description: 'Técnicas e estratégias para atendimento especializado de clientes que buscam participar de editais públicos.',
      duration: '3h 15min',
      lessons: 10,
      level: 'Intermediário',
      thumbnail: 'https://readdy.ai/api/search-image?query=Professional%20business%20training%20course%20thumbnail%20about%20client%20service%20and%20public%20tenders%2C%20modern%20corporate%20style%20with%20handshake%20and%20documents%2C%20blue%20and%20green%20colors%2C%20high%20quality%20illustration&width=400&height=225&seq=2&orientation=landscape',
      progress: 0,
      category: 'Atendimento',
    },
    {
      id: 3,
      title: 'Direito do Trânsito Avançado',
      description: 'Aprofunde seus conhecimentos em casos complexos, jurisprudência e estratégias avançadas de defesa.',
      duration: '6h 45min',
      lessons: 18,
      level: 'Avançado',
      thumbnail: 'https://readdy.ai/api/search-image?query=Professional%20advanced%20law%20course%20thumbnail%20about%20traffic%20law%20expertise%2C%20modern%20design%20with%20legal%20books%20and%20scales%20of%20justice%2C%20blue%20and%20green%20colors%2C%20high%20quality%20illustration&width=400&height=225&seq=3&orientation=landscape',
      progress: 0,
      category: 'Especialização',
    },
    {
      id: 4,
      title: 'Recursos de Multas de Trânsito',
      description: 'Domine a arte de criar recursos eficazes contra multas de trânsito. Modelos, prazos e argumentações.',
      duration: '5h 20min',
      lessons: 15,
      level: 'Intermediário',
      thumbnail: 'https://readdy.ai/api/search-image?query=Professional%20legal%20course%20thumbnail%20about%20traffic%20ticket%20appeals%20and%20defense%20strategies%2C%20modern%20design%20with%20documents%20and%20pen%2C%20blue%20and%20green%20colors%2C%20high%20quality%20illustration&width=400&height=225&seq=4&orientation=landscape',
      progress: 78,
      category: 'Recursos',
    },
    {
      id: 5,
      title: 'Legislação de Trânsito Atualizada',
      description: 'Mantenha-se atualizado com as últimas mudanças na legislação de trânsito brasileira e suas implicações.',
      duration: '3h 50min',
      lessons: 11,
      level: 'Básico',
      thumbnail: 'https://readdy.ai/api/search-image?query=Professional%20law%20education%20course%20thumbnail%20about%20updated%20traffic%20legislation%2C%20modern%20design%20with%20law%20books%20and%20Brazilian%20flag%2C%20blue%20and%20green%20colors%2C%20high%20quality%20illustration&width=400&height=225&seq=5&orientation=landscape',
      progress: 100,
      category: 'Legislação',
    },
    {
      id: 6,
      title: 'Prospecção e Vendas para Editais',
      description: 'Aprenda técnicas de prospecção, abordagem e fechamento de vendas específicas para o mercado de editais.',
      duration: '4h 10min',
      lessons: 13,
      level: 'Intermediário',
      thumbnail: 'https://readdy.ai/api/search-image?query=Professional%20sales%20training%20course%20thumbnail%20about%20prospecting%20and%20selling%20to%20public%20tenders%2C%20modern%20business%20style%20with%20charts%20and%20handshake%2C%20blue%20and%20green%20colors%2C%20high%20quality%20illustration&width=400&height=225&seq=6&orientation=landscape',
      progress: 0,
      category: 'Vendas',
    },
    {
      id: 7,
      title: 'Análise de Processos Administrativos',
      description: 'Entenda como analisar processos administrativos de trânsito e identificar oportunidades de defesa.',
      duration: '5h 35min',
      lessons: 16,
      level: 'Avançado',
      thumbnail: 'https://readdy.ai/api/search-image?query=Professional%20legal%20analysis%20course%20thumbnail%20about%20administrative%20traffic%20processes%2C%20modern%20design%20with%20magnifying%20glass%20and%20documents%2C%20blue%20and%20green%20colors%2C%20high%20quality%20illustration&width=400&height=225&seq=7&orientation=landscape',
      progress: 23,
      category: 'Análise',
    },
    {
      id: 8,
      title: 'Comunicação e Negociação com Clientes',
      description: 'Desenvolva habilidades de comunicação assertiva e técnicas de negociação para melhor atendimento.',
      duration: '3h 40min',
      lessons: 12,
      level: 'Básico',
      thumbnail: 'https://readdy.ai/api/search-image?query=Professional%20communication%20skills%20course%20thumbnail%20about%20client%20negotiation%20and%20service%2C%20modern%20business%20style%20with%20people%20talking%2C%20blue%20and%20green%20colors%2C%20high%20quality%20illustration&width=400&height=225&seq=8&orientation=landscape',
      progress: 0,
      category: 'Soft Skills',
    },
  ];

  const categories = [
    { id: 'all', label: 'Todos os Cursos', count: courses.length },
    { id: 'Fundamentos', label: 'Fundamentos', count: courses.filter(c => c.category === 'Fundamentos').length },
    { id: 'Atendimento', label: 'Atendimento', count: courses.filter(c => c.category === 'Atendimento').length },
    { id: 'Recursos', label: 'Recursos', count: courses.filter(c => c.category === 'Recursos').length },
    { id: 'Especialização', label: 'Especialização', count: courses.filter(c => c.category === 'Especialização').length },
  ];

  const inProgress = courses.filter(c => c.progress > 0 && c.progress < 100);
  const completed = courses.filter(c => c.progress === 100);

  return (
    <div className="space-y-8 p-8">
      {/* Hero Section */}
      <div className="relative w-full h-96 rounded-xl overflow-hidden">
        <img
          src="https://readdy.ai/api/search-image?query=Professional%20online%20education%20platform%20hero%20banner%20showing%20diverse%20students%20learning%20about%20law%20and%20traffic%20regulations%2C%20modern%20digital%20learning%20environment%20with%20laptops%20and%20books%2C%20blue%20and%20green%20colors%2C%20inspiring%20educational%20atmosphere%2C%20high%20quality%20photography&width=1200&height=400&seq=9&orientation=landscape"
          alt="Educacional"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-center px-12">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-3 py-1 bg-[#F59E0B] text-white text-xs font-bold rounded-full whitespace-nowrap">
                PREMIUM
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full whitespace-nowrap">
                Exclusivo para Assinantes
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
              Módulo Educacional
            </h1>
            <p className="text-base text-white/90 mb-6 leading-relaxed">
              Aprimore suas habilidades com cursos especializados em Direito do Trânsito, 
              atendimento ao cliente e estratégias de vendas para editais.
            </p>
            <div className="flex items-center space-x-4">
              <button className="px-8 py-3 bg-[#10B981] text-white rounded-lg text-sm font-bold hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap flex items-center space-x-2">
                <i className="ri-play-circle-line text-xl"></i>
                <span>Continuar Assistindo</span>
              </button>
              <button className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-semibold hover:bg-white/30 transition-colors cursor-pointer whitespace-nowrap flex items-center space-x-2">
                <i className="ri-information-line text-xl"></i>
                <span>Mais Informações</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="ri-book-open-line text-2xl"></i>
            </div>
            <span className="text-3xl font-bold">{courses.length}</span>
          </div>
          <p className="text-sm font-medium">Cursos Disponíveis</p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="ri-play-circle-line text-2xl"></i>
            </div>
            <span className="text-3xl font-bold">{inProgress.length}</span>
          </div>
          <p className="text-sm font-medium">Em Andamento</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="ri-checkbox-circle-line text-2xl"></i>
            </div>
            <span className="text-3xl font-bold">{completed.length}</span>
          </div>
          <p className="text-sm font-medium">Concluídos</p>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="ri-time-line text-2xl"></i>
            </div>
            <span className="text-3xl font-bold">36h</span>
          </div>
          <p className="text-sm font-medium">Horas de Conteúdo</p>
        </div>
      </div>

      {/* Continue Watching */}
      {inProgress.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <i className="ri-play-circle-line text-[#10B981] mr-3"></i>
            Continue Assistindo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgress.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => setSelectedCourse(course.id)}
              >
                <div className="relative w-full h-48">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <i className="ri-play-fill text-3xl text-[#1E3A8A]"></i>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 px-3 py-1 bg-[#10B981] text-white text-xs font-bold rounded-full whitespace-nowrap">
                    {course.level}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Progresso</span>
                      <span className="font-semibold">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#10B981] h-2 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <i className="ri-time-line"></i>
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <i className="ri-play-list-line"></i>
                      <span>{course.lessons} aulas</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              className="px-5 py-2.5 bg-gray-100 hover:bg-[#1E3A8A] hover:text-white text-gray-700 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center space-x-2"
            >
              <span>{category.label}</span>
              <span className="px-2 py-0.5 bg-gray-200 hover:bg-white/20 rounded-full text-xs font-bold">
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* All Courses */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <i className="ri-book-line text-[#1E3A8A] mr-3"></i>
          Todos os Cursos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
              onClick={() => setSelectedCourse(course.id)}
            >
              <div className="relative w-full h-48">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                    <i className="ri-play-fill text-3xl text-[#1E3A8A]"></i>
                  </div>
                </div>
                <div className="absolute top-3 right-3 px-3 py-1 bg-[#10B981] text-white text-xs font-bold rounded-full whitespace-nowrap">
                  {course.level}
                </div>
                {course.progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                    <div
                      className="bg-[#10B981] h-1 transition-all"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="mb-2">
                  <span className="text-xs font-semibold text-[#1E3A8A] bg-blue-50 px-2 py-1 rounded">
                    {course.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-1">
                    <i className="ri-time-line"></i>
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <i className="ri-play-list-line"></i>
                    <span>{course.lessons} aulas</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Courses */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <i className="ri-checkbox-circle-line text-[#10B981] mr-3"></i>
            Cursos Concluídos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {completed.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer group relative"
                onClick={() => setSelectedCourse(course.id)}
              >
                <div className="absolute top-3 left-3 z-10 w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center">
                  <i className="ri-checkbox-circle-fill text-2xl text-white"></i>
                </div>
                <div className="relative w-full h-48">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <i className="ri-restart-line text-3xl text-[#1E3A8A]"></i>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-[#1E3A8A] bg-blue-50 px-2 py-1 rounded">
                      {course.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-1">
                      <i className="ri-time-line"></i>
                      <span>{course.duration}</span>
                    </div>
                    <span className="text-[#10B981] font-semibold">Assistir novamente</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] rounded-xl p-8 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6">
              <i className="ri-graduation-cap-line text-4xl"></i>
            </div>
            <h3 className="text-2xl font-bold mb-3">Benefícios do Módulo Educacional</h3>
            <p className="text-base text-white/90 mb-6 leading-relaxed">
              Acesso ilimitado a todos os cursos, certificados de conclusão e suporte especializado 
              para impulsionar sua carreira no Direito do Trânsito.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-check-line text-sm"></i>
                </div>
                <span className="text-sm">Certificados reconhecidos ao concluir cada curso</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-check-line text-sm"></i>
                </div>
                <span className="text-sm">Atualizações constantes de conteúdo</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-check-line text-sm"></i>
                </div>
                <span className="text-sm">Suporte direto com especialistas</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-check-line text-sm"></i>
                </div>
                <span className="text-sm">Acesso vitalício aos cursos concluídos</span>
              </div>
            </div>
          </div>
          <div className="relative w-full h-full min-h-80 rounded-xl overflow-hidden">
            <img
              src="https://readdy.ai/api/search-image?query=Professional%20online%20learning%20platform%20showing%20student%20studying%20law%20courses%20on%20laptop%2C%20modern%20educational%20technology%2C%20blue%20and%20green%20colors%2C%20inspiring%20learning%20environment%2C%20high%20quality%20photography&width=600&height=600&seq=10&orientation=squarish"
              alt="Educacional Benefits"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
