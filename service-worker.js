const NOME_CACHE = 'piscicultura-cache-v1';
// Lista de arquivos revisada para ser mais explícita
const ARQUIVOS_PARA_CACHE = [
    'ProgramaAlimentar.html', 
    'ProgramaAlimentar.css',
    'ProgramaAlimentar.js',
    'manifest.json',
    'pdf-styles.css',
    'ícones/ícone-192.png',
    'ícones/ícone-512.jpg',
    'Funções/ConversãoAlimentarAcumulada.js',
    'Funções/ConversãoAlimentarProjetada.js',
    'Funções/CustoProjetadoDaRação.js',
    'Funções/GanhoDeBiomassaAcumulada.js',
    'Funções/GanhoDeBiomassaProjetado.js',
    'Funções/GanhoDePesoAcumulado.js',
    'Funções/GanhoDePesoProjetado.js',
    'Funções/ProjeçãoConsumoAcumulado.js',
    'Funções/ProjeçãoConsumoSemanal.js',
    'Funções/RaçãoDiariaPorTrato.js',
    'Funções/RaçãoDiariaQtdPeixes.js',
    'Funções/GeradorDePeríodo.js',
];

// O resto do arquivo permanece o mesmo...

self.addEventListener('install', (event) => {
    console.log('Service Worker: Instalando...');
    event.waitUntil(
        caches.open(NOME_CACHE).then((cache) => {
            console.log('Service Worker: Colocando arquivos no cache.');
            // Se esta etapa falhar, verifique o console para erros de "arquivo não encontrado" (404)
            return cache.addAll(ARQUIVOS_PARA_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
