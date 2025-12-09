import conversãoAlimentarAcumulada from './Funções/ConversãoAlimentarAcumulada.js';
import conversãoAlimentarProjetada from './Funções/ConversãoAlimentarProjetada.js';
import custoProjetadoDaRação from './Funções/CustoProjetadoDaRação.js';
import ganhoDeBiomassaAcumulado from './Funções/GanhoDeBiomassaAcumulada.js';
import ganhoDeBiomassaProjetado from './Funções/GanhoDeBiomassaProjetado.js';
import ganhoDePesoAcumulado from './Funções/GanhoDePesoAcumulado.js';
import ganhoDePesoProjetado from './Funções/GanhoDePesoProjetado.js';
import projeçãoConsumoAcumulado from './Funções/ProjeçãoConsumoAcumulado.js';
import projeçãoConsumoSemanal from './Funções/ProjeçãoConsumoSemanal.js';
import raçãoDiariaPorTrato from './Funções/RaçãoDiariaPorTrato.js';
import raçãoDiariaQtdPeixes from './Funções/RaçãoDiariaQtdPeixes.js';
import { criarPeríodos } from './Funções/GeradorDePeríodo.js';


// FUNÇÃO PRINCIPAL DE CÁLCULO

const períodos = (períodosIncompletos, qtdPeixes) => {
    return períodosIncompletos.reduce((acumuladorGeral, periodoAtual) => {

        console.log(`Iniciando período '${periodoAtual.nomePeríodo}'. Última conversão total:`, acumuladorGeral.ultimaConversaoTotal);

        const resultadoReduceDasFases = periodoAtual.fases.reduce((acumuladorFase, faseAtual) => {
            // Cálculos projetados 
            const racaoQtd = raçãoDiariaQtdPeixes(faseAtual.peso.de, faseAtual.peso.ate)(qtdPeixes)(faseAtual.tratos.tratoDiário);
            const consumoSemanal = projeçãoConsumoSemanal(racaoQtd)(faseAtual.diasDaFase);
            const conversaoProjetada = conversãoAlimentarProjetada(qtdPeixes)(consumoSemanal)(faseAtual.peso.de, faseAtual.peso.ate);
            const ganhoPeso = ganhoDePesoProjetado(faseAtual.peso.de, faseAtual.peso.ate);
            const biomassaProjetada = ganhoDeBiomassaProjetado(qtdPeixes)(ganhoPeso);

            // Cálculos acumulados
            const consumoAcumulado = projeçãoConsumoAcumulado(acumuladorFase.ultimoConsumoAcumulado)(consumoSemanal);
            const ganhoPesoAcumulado = ganhoDePesoAcumulado(acumuladorFase.ultimoGanhoPesoAcumulado, ganhoPeso);
            const conversaoAcumulada = conversãoAlimentarAcumulada(acumuladorFase.ultimaConversaoAcumulada)(conversaoProjetada);
            const biomassaAcumulada = ganhoDeBiomassaAcumulado(acumuladorFase.ultimaBiomassaAcumulada, biomassaProjetada);

            // Objeto da fase 
            const novaFaseCompleta = {
                ...faseAtual,
                raçãoDiariaQtdPeixes: racaoQtd,
                raçãoDiariaPorTrato: raçãoDiariaPorTrato(racaoQtd)(faseAtual.tratos.tratoDiário),

                consumoDeRação: {
                    semanalProjetado: consumoSemanal,
                    semanalProjetadoAcumulado: consumoAcumulado
                },

                conversaoAlimentar: {
                    projetada: conversaoProjetada,
                    acumuladaProjetada: conversaoAcumulada
                },

                custo: {
                    custoProjetadoDaRação: custoProjetadoDaRação(faseAtual.preçoProjetadoDaRaçãoKg)(consumoSemanal),
                    preçoDoPeríodo: null,
                    percentualDoPrograma: null
                },

                ganhoDePesoMédioDoPeixe: {
                    projetadoSemanaGramas: ganhoPeso,
                    acumuladoSemanaGramas: ganhoPesoAcumulado
                },

                ganhoBiomassa: {
                    projetadaSemanaKg: biomassaProjetada,
                    acumuladaSemanaKg: biomassaAcumulada
                }
            };

            // Atualiza acumulador da fase
            return {
                fasesCompletas: [...acumuladorFase.fasesCompletas, novaFaseCompleta],
                ultimoConsumoAcumulado: consumoAcumulado,
                ultimaConversaoAcumulada: conversaoAcumulada,
                ultimoGanhoPesoAcumulado: ganhoPesoAcumulado,
                ultimaBiomassaAcumulada: biomassaAcumulada
            };

        }, {
            fasesCompletas: [],
            ultimoConsumoAcumulado: acumuladorGeral.ultimoConsumoTotal,
            ultimaConversaoAcumulada: acumuladorGeral.ultimaConversaoTotal,
            ultimoGanhoPesoAcumulado: acumuladorGeral.ultimoGanhoPesoTotal,
            ultimaBiomassaAcumulada: acumuladorGeral.ultimaBiomassaTotal
        });

        const novoPeriodoCompleto = { ...periodoAtual, fases: resultadoReduceDasFases.fasesCompletas };

        return {
            períodosCompletos: [...acumuladorGeral.períodosCompletos, novoPeriodoCompleto],
            ultimoConsumoTotal: resultadoReduceDasFases.ultimoConsumoAcumulado,
            ultimaConversaoTotal: resultadoReduceDasFases.ultimaConversaoAcumulada,
            ultimoGanhoPesoTotal: resultadoReduceDasFases.ultimoGanhoPesoAcumulado,
            ultimaBiomassaTotal: resultadoReduceDasFases.ultimaBiomassaAcumulada
        };

    }, {
        períodosCompletos: [],
        ultimoConsumoTotal: 0,
        ultimaConversaoTotal: 0,
        ultimoGanhoPesoTotal: 0,
        ultimaBiomassaTotal: 0
    }).períodosCompletos;
};


// FUNÇÕES DE CUSTO

const calcularCustoDoPeriodo = (periodo) =>
    periodo.fases.reduce((total, fase) => total + (fase.custo.custoProjetadoDaRação || 0), 0);

const CalcularPreço = (períodos) =>
    períodos.map(periodo => {
        const custoTotal = calcularCustoDoPeriodo(periodo);
        const novasFases = periodo.fases.map(fase => ({
            ...fase,
            custo: { ...fase.custo, custoTotalDoPeriodo: custoTotal }
        }));
        return { ...periodo, fases: novasFases };
    });

const adicionarPercentuais = (períodos) => {
    const custoTotalDoPrograma = períodos.reduce((total, p) => total + calcularCustoDoPeriodo(p), 0);
    return períodos.map(periodo => {
        const percentual = custoTotalDoPrograma > 0
            ? (calcularCustoDoPeriodo(periodo) / custoTotalDoPrograma) * 100
            : 0;
        const novasFases = periodo.fases.map(fase => ({
            ...fase,
            custo: { ...fase.custo, percentualDoPrograma: percentual }
        }));
        return { ...periodo, fases: novasFases };
    });
};


// FUNÇÕES DE EXIBIÇÃO

function exibirResultadosNaPagina(períodosCompletos) {
    const container = document.getElementById('container-tabelas');
    container.innerHTML = '';

    períodosCompletos.forEach(periodo => {
        // Título 
        const titulo = document.createElement('h2');
        titulo.textContent = periodo.nomePeríodo;
        container.appendChild(titulo);

        // Tabela
        const tabela = document.createElement('table');
        tabela.innerHTML = `
            <thead>
                <tr>
                    <th>Semana</th>
                    <th>Peso (De)</th>
                    <th>Peso (Até)</th>
                    <th>Ração Diária Total</th>
                    <th>Ração por Trato</th>
                    <th>Ganho de Peso (g)</th>
                    <th>Ganho de Peso Acum. (g)</th>
                    <th>Ganho Biomassa Semana (kg)</th>
                    <th>Biomassa Acum. (kg)</th>
                    <th>Consumo da Semana (kg)</th>
                    <th>Consumo Acum. (kg)</th>
                    <th>Conv. Alimentar</th>
                    <th>Conv. Alimentar Acum.</th>
                    <th>Custo Ração Semana (R$)</th>
                    <th>Custo Total Fase (R$)</th>
                    <th>% Custo Programa</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const corpo = tabela.querySelector('tbody');

        periodo.fases.forEach(fase => {
            const linha = corpo.insertRow();
            linha.innerHTML = `
                <td>${fase.semanaDeCriacao}</td>
                <td>${fase.peso.de.toFixed(1)} g</td>
                <td>${fase.peso.ate.toFixed(1)} g</td>
                <td>${fase.raçãoDiariaQtdPeixes.toFixed(0)} g</td>
                <td>${fase.raçãoDiariaPorTrato.toFixed(0)} g</td>
                <td>${fase.ganhoDePesoMédioDoPeixe.projetadoSemanaGramas.toFixed(1)} g</td>
                <td>${fase.ganhoDePesoMédioDoPeixe.acumuladoSemanaGramas.toFixed(1)} g</td>
                <td>${fase.ganhoBiomassa.projetadaSemanaKg.toFixed(2)} kg</td>
                <td>${fase.ganhoBiomassa.acumuladaSemanaKg.toFixed(2)} kg</td>
                <td>${fase.consumoDeRação.semanalProjetado.toFixed(2)} kg</td>
                <td>${fase.consumoDeRação.semanalProjetadoAcumulado.toFixed(2)} kg</td>
                <td>${fase.conversaoAlimentar.projetada.toFixed(3)}</td>
                <td>${fase.conversaoAlimentar.acumuladaProjetada.toFixed(3)}</td>
                <td>R$ ${fase.custo.custoProjetadoDaRação.toFixed(2)}</td>
                <td>R$ ${fase.custo.custoTotalDoPeriodo.toFixed(2)}</td>
                <td>${fase.custo.percentualDoPrograma.toFixed(2)}%</td>
            `;
        });

        container.appendChild(tabela);

        const quebraDePagina = document.createElement("div");
        quebraDePagina.classList.add("page-break");
        container.appendChild(quebraDePagina);
    });
}

function exibirParametrosDeEntrada(listaPeriodos, qtdPeixes) {
    const container = document.getElementById('container-parametros');
    let html = '<h2>Parâmetros de Entrada</h2>';

    // Pega o valor dos dias diretamente do input do formulário
    const diasPorSemana = document.getElementById('tamanhoSemana').value;

    html += `<h3>Geral</h3><ul>`;
    html += `<li>Quantidade de Peixes: ${qtdPeixes.toLocaleString('pt-BR')}</li>`;
    html += `<li>Dias por Semana: ${diasPorSemana}</li>`; // USA A VARIÁVEL CORRETA
    html += `</ul>`;

    // A lógica para exibir os períodos continua a mesma
    listaPeriodos.forEach(([nome, qtd, dados]) => {
        html += `<h3>Período: ${nome} (${qtd} fases)</h3><ul>`;
        html += `<li>Preços da Ração: [${dados.precosRacao.join(', ')}]</li>`;
        html += `<li>Tratos por Dia: [${dados.tratosPorDia.join(', ')}]</li>`;
        html += `<li>% do P.V.: [${dados.tratosDiarios.join(', ')}]</li>`;
        html += '</ul>';
    });

    container.innerHTML = html;
}


// FORMULÁRIO DINÂMICO

const btnGerarRelatorio = document.getElementById('btn-gerar-relatorio');
const containerPeriodosForm = document.getElementById('container-periodos-form');
const btnAdicionarPeriodo = document.getElementById('btn-adicionar-periodo');
const templatePeriodo = document.getElementById('template-periodo');
const templateFase = document.getElementById('template-fase');

// Recarregar dados salvos 
window.addEventListener('DOMContentLoaded', () => {
    const dadosSalvosJSON = localStorage.getItem('dadosPiscicultura');
    if (!dadosSalvosJSON) return;

    try {
        const dadosSalvos = JSON.parse(dadosSalvosJSON);
        
        // Preenche os parâmetros gerais
        document.getElementById('qtdPeixes').value = dadosSalvos.qtdPeixes || 10000;
        document.getElementById('tamanhoSemana').value = dadosSalvos.diasPorFase || 7; // CORRIGIDO

        // Recria os períodos e fases
        dadosSalvos.periodos.forEach(([nome, qtd, dados]) => {
            adicionarNovoPeriodo();
            const ultimoCard = [...containerPeriodosForm.querySelectorAll('.periodo-card')].pop();
            ultimoCard.querySelector('.nome-periodo').value = nome;

            const containerFases = ultimoCard.querySelector('.container-fases');
            for (let i = 0; i < qtd; i++) {
                const novaFaseCard = templateFase.content.cloneNode(true).querySelector('.fase-card');
                
                // Preenche os dados de cada fase (sem o campo 'dias-fase')
                novaFaseCard.querySelector('.peso-de').value = dados.pesos[i].de;
                novaFaseCard.querySelector('.peso-ate').value = dados.pesos[i].ate;
                novaFaseCard.querySelector('.desc-racao').value = dados.descriçõesRacao[i];
                novaFaseCard.querySelector('.gran-racao').value = dados.granulometrias[i];
                novaFaseCard.querySelector('.preco-racao').value = dados.precosRacao[i];
                // LINHA COM ERRO REMOVIDA DAQUI
                novaFaseCard.querySelector('.trato-diario').value = dados.tratosDiarios[i];
                novaFaseCard.querySelector('.tratos-dia').value = dados.tratosPorDia[i];
                containerFases.appendChild(novaFaseCard);
            }
        });
    } catch (error) {
        console.error("Erro ao carregar dados salvos:", error);
        localStorage.removeItem('dadosPiscicultura');
    }
});

// Adicionar/Remover Períodos e Fases 
function adicionarNovoPeriodo() {
    // Agora clona o template inteiro e o adiciona
    const clonePeriodo = templatePeriodo.content.cloneNode(true);
    containerPeriodosForm.appendChild(clonePeriodo);
}
btnAdicionarPeriodo.addEventListener('click', adicionarNovoPeriodo);

containerPeriodosForm.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-adicionar-fase')) {
        const containerFases = e.target.previousElementSibling;
        const ultimaFase = containerFases.querySelector('.fase-card:last-child');
        const novaFaseCard = templateFase.content.cloneNode(true).querySelector('.fase-card');

        if (ultimaFase) {
            const pesoAteAnterior = ultimaFase.querySelector('.peso-ate').value;
            [...ultimaFase.querySelectorAll('input')].forEach((input, i) => {
                novaFaseCard.querySelectorAll('input')[i].value = input.value;
            });
            novaFaseCard.querySelector('.peso-de').value = pesoAteAnterior;
            novaFaseCard.querySelector('.peso-ate').value = '';
        }

        containerFases.appendChild(novaFaseCard);
    }
    if (e.target.classList.contains('btn-remover-fase')) e.target.parentElement.remove();
    if (e.target.classList.contains('btn-remover-periodo')) e.target.parentElement.remove();
});

// Submissão do formulário
btnGerarRelatorio.addEventListener('click', () => {
    const qtdPeixes = parseFloat(document.getElementById('qtdPeixes').value);
    const diasPorFaseGeral = parseInt(document.getElementById('tamanhoSemana').value);

    const meusPeríodosComDados = [...containerPeriodosForm.querySelectorAll('.periodo-card')].map(card => {
        const nome = card.querySelector('.nome-periodo').value;
        const fasesCards = [...card.querySelectorAll('.fase-card')];
        const qtd = fasesCards.length;

        const dados = {
            descriçõesRacao: fasesCards.map(f => f.querySelector('.desc-racao').value),
            granulometrias: fasesCards.map(f => f.querySelector('.gran-racao').value),
            precosRacao: fasesCards.map(f => parseFloat(f.querySelector('.preco-racao').value)),
            pesos: fasesCards.map(f => ({
                de: parseFloat(f.querySelector('.peso-de').value),
                ate: parseFloat(f.querySelector('.peso-ate').value)
            })),
            
            diasPorFase: Array(qtd).fill(diasPorFaseGeral), // Cria um array com o valor repetido 'qtd' vezes
            tratosDiarios: fasesCards.map(f => parseFloat(f.querySelector('.trato-diario').value)),
            tratosPorDia: fasesCards.map(f => parseInt(f.querySelector('.tratos-dia').value))
        };
        return [nome, qtd, dados];
    });

    localStorage.setItem('dadosPiscicultura', JSON.stringify({ qtdPeixes, periodos: meusPeríodosComDados }));

    const estruturaInicial = criarPeríodos(meusPeríodosComDados);
    const resultadoFinal = adicionarPercentuais(CalcularPreço(períodos(estruturaInicial, qtdPeixes)));

    document.querySelector('.container-principal').style.display = 'flex';
    exibirParametrosDeEntrada(meusPeríodosComDados, qtdPeixes);
    exibirResultadosNaPagina(resultadoFinal);
});


// ==========================================================
// FUNÇÕES DE EXPORTAÇÃO DE RELATÓRIOS (VERSÃO CORRIGIDA)
// ==========================================================

document.getElementById('btn-exportar-pdf').addEventListener('click', () => {
    const elementoParaImprimir = document.querySelector('#container-tabelas');

    if (!elementoParaImprimir || elementoParaImprimir.offsetParent === null) {
        alert("⚠️ Gere o relatório antes de exportar para PDF.");
        return;
    }

    // Estilos e opções
    const linkEstiloPrincipal = document.querySelector('link[href="ProgramaAlimentar.css"]');
    const head = document.head;
    const linkEstiloPdf = document.createElement('link');
    linkEstiloPdf.rel = 'stylesheet';
    linkEstiloPdf.href = 'pdf-styles.css'; // O nome do seu arquivo é pdf-styles.css

    const opt = {
        margin:       0.1,
        filename:     'relatorio_plano_alimentar.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }, // Pode manter portrait aqui
    };

    // Aplica o link de estilo do PDF
    if (linkEstiloPrincipal) linkEstiloPrincipal.disabled = true;
    
    linkEstiloPdf.onload = () => {
        // --- NOVA LINHA: Aplica a escala ANTES de gerar o PDF ---
        elementoParaImprimir.style.transform = 'scale(0.7)';

        html2pdf().set(opt).from(elementoParaImprimir).save().then(() => {
            // --- NOVA LINHA: Remove a escala DEPOIS de gerar o PDF ---
            elementoParaImprimir.style.transform = 'none';

            // Limpeza dos estilos
            head.removeChild(linkEstiloPdf);
            if (linkEstiloPrincipal) linkEstiloPrincipal.disabled = false;
        });
    };
    head.appendChild(linkEstiloPdf);
});
