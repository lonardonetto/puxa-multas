import React from 'react';

interface ContractHeaderProps {
    organizationName: string;
    organizationCnpj?: string;
    organizationAddress?: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    headerStyle?: 'minimal' | 'elegant' | 'classic';
}

/**
 * Componente de cabeçalho timbrado para contratos
 * Suporta múltiplos estilos visuais e cores personalizáveis
 */
export const ContractHeader: React.FC<ContractHeaderProps> = ({
    organizationName,
    organizationCnpj,
    organizationAddress,
    logoUrl,
    primaryColor = '#1a1a1a',
    secondaryColor = '#333333',
    headerStyle = 'elegant'
}) => {
    // Estilo Elegante com faixas geométricas (inspirado no modelo Help Soluções)
    if (headerStyle === 'elegant') {
        return (
            <div className="relative mb-8 print:mb-6">
                {/* Faixas decorativas superiores */}
                <div className="absolute top-0 right-0 w-48 h-32 overflow-hidden print:w-36 print:h-24">
                    <svg viewBox="0 0 200 150" className="w-full h-full" preserveAspectRatio="xMaxYMin slice">
                        {/* Triângulo grande */}
                        <polygon
                            points="200,0 200,150 50,150"
                            fill={primaryColor}
                        />
                        {/* Triângulo médio */}
                        <polygon
                            points="200,0 200,100 100,100"
                            fill={secondaryColor}
                            opacity="0.8"
                        />
                        {/* Linha diagonal decorativa */}
                        <line
                            x1="80" y1="150" x2="200" y2="30"
                            stroke="white"
                            strokeWidth="2"
                            opacity="0.3"
                        />
                        {/* Pontos decorativos */}
                        <g fill="white" opacity="0.2">
                            {[...Array(5)].map((_, i) => (
                                [...Array(5)].map((_, j) => (
                                    <circle key={`${i}-${j}`} cx={120 + i * 15} cy={60 + j * 15} r="2" />
                                ))
                            ))}
                        </g>
                    </svg>
                </div>

                {/* Conteúdo do cabeçalho */}
                <div className="flex items-start space-x-4 pb-6 border-b-4 relative z-10" style={{ borderColor: primaryColor }}>
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt="Logo"
                            className="h-20 w-auto object-contain print:h-16"
                        />
                    ) : (
                        <div
                            className="w-20 h-20 flex items-center justify-center rounded print:w-16 print:h-16"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <span className="text-white text-3xl font-black print:text-2xl">
                                {organizationName.charAt(0)}
                            </span>
                        </div>
                    )}

                    <div className="flex-1">
                        <h1
                            className="text-2xl font-black tracking-wide print:text-xl text-gray-900"
                        >
                            {organizationName.toUpperCase()}
                        </h1>
                        <div className="mt-2 space-y-0.5 text-xs text-gray-600">
                            {organizationCnpj && <p>CNPJ: {organizationCnpj}</p>}
                            {organizationAddress && <p className="max-w-md">{organizationAddress}</p>}
                        </div>
                    </div>
                </div>

                {/* Barra colorida */}
                <div
                    className="h-1.5 mt-1"
                    style={{
                        background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
                    }}
                />
            </div>
        );
    }

    // Estilo Clássico (tradicional, sem faixas)
    if (headerStyle === 'classic') {
        return (
            <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
                {logoUrl && (
                    <img
                        src={logoUrl}
                        alt="Logo"
                        className="h-16 mx-auto mb-4 object-contain"
                    />
                )}
                <h1 className="text-2xl font-bold text-gray-800">{organizationName}</h1>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                    {organizationCnpj && <p>CNPJ: {organizationCnpj}</p>}
                    {organizationAddress && <p>{organizationAddress}</p>}
                </div>
            </div>
        );
    }

    // Estilo Minimal (simples e limpo)
    return (
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-300">
            <div className="flex items-center space-x-3">
                {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-12 object-contain" />
                ) : (
                    <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <span className="text-white text-xl font-bold">
                            {organizationName.charAt(0)}
                        </span>
                    </div>
                )}
                <div>
                    <h1 className="text-lg font-bold text-gray-900">
                        {organizationName}
                    </h1>
                    {organizationCnpj && (
                        <p className="text-xs text-gray-600">CNPJ: {organizationCnpj}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Componente de rodapé decorativo para contratos
 */
export const ContractFooter: React.FC<{ primaryColor?: string; secondaryColor?: string }> = ({
    primaryColor = '#1a1a1a',
    secondaryColor = '#333333'
}) => {
    return (
        <div className="relative mt-16 pt-8">
            {/* Faixas decorativas inferiores */}
            <div className="absolute bottom-0 left-0 w-48 h-24 overflow-hidden print:w-36 print:h-20">
                <svg viewBox="0 0 200 100" className="w-full h-full" preserveAspectRatio="xMinYMax slice">
                    <polygon
                        points="0,100 0,0 150,100"
                        fill={primaryColor}
                    />
                    <polygon
                        points="0,100 0,40 80,100"
                        fill={secondaryColor}
                        opacity="0.8"
                    />
                    <g fill="white" opacity="0.2">
                        {[...Array(4)].map((_, i) => (
                            [...Array(4)].map((_, j) => (
                                <circle key={`${i}-${j}`} cx={20 + i * 15} cy={40 + j * 15} r="2" />
                            ))
                        ))}
                    </g>
                </svg>
            </div>

            <div className="absolute bottom-0 right-0 w-48 h-24 overflow-hidden print:w-36 print:h-20">
                <svg viewBox="0 0 200 100" className="w-full h-full" preserveAspectRatio="xMaxYMax slice">
                    <polygon
                        points="200,100 200,0 50,100"
                        fill={primaryColor}
                    />
                    <polygon
                        points="200,100 200,40 120,100"
                        fill={secondaryColor}
                        opacity="0.8"
                    />
                </svg>
            </div>

            {/* Linha divisória */}
            <div
                className="h-1 mb-4"
                style={{
                    background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor}, ${primaryColor})`
                }}
            />
        </div>
    );
};

export default ContractHeader;
