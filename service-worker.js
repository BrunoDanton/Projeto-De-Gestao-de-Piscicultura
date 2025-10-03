const NOME_CACHE = 'piscicultura-cache-v1';
// Lista de arquivos que o Service Worker vai armazenar em cache.
const ARQUIVOS_PARA_CACHE = [
    '/',
    'ProgramaAlimentar.html',
    'ProgramaAlimentar.css',
    'ProgramaAlimentar.js',
    'ícones/ícone-192.png',
    'ícones/ícone-512.png',
    './Funções/ConversãoAlimentarAcumulada.js',
    './Funções/ConversãoAlimentarProjetada.js',
    './Funções/CustoProjetadoDaRação.js',
    './Funções/GanhoDeBiomassaAcumulada.js',
    './Funções/GanhoDeBiomassaProjetado.js',
    './Funções/GanhoDePesoAcumulado.js',
    './Funções/GanhoDePesoProjetado.js',
    './Funções/ProjeçãoConsumoAcumulado.js',
    './Funções/ProjeçãoConsumoSemanal.js',
    './Funções/RaçãoDiariaPorTrato.js',
    './Funções/RaçãoDiariaQtdPeixes.js',
    './Funções/GeradorDePeríodo copy.js',
    // Se você tiver mais arquivos, adicione-os aqui.
];

// Evento de 'install': chamado quando o Service Worker é instalado.
self.addEventListener('install', (event) => {
    console.log('Service Worker: Instalando...');
    event.waitUntil(
        caches.open(NOME_CACHE).then((cache) => {
            console.log('Service Worker: Colocando arquivos no cache.');
            return cache.addAll(ARQUIVOS_PARA_CACHE);
        })
    );
});

// Evento de 'fetch': chamado toda vez que a página tenta buscar um arquivo.
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Se o arquivo estiver no cache, retorna ele. Senão, busca na rede.
            return response || fetch(event.request);
        })
    );
});