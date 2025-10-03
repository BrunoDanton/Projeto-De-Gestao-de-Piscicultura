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
import { criarPeríodos } from './Funções/GeradorDePeríodo copy.js';


const períodos = (períodosIncompletos, qtdPeixes) => {
    
    // Usamos um REDUCE principal para iterar sobre os PERÍODOS.
    // O 'acumuladorGeral' vai carregar os totais entre os períodos.
    const resultadoFinalReduce = períodosIncompletos.reduce((acumuladorGeral, periodoAtual) => {

        // VAMOS VERIFICAR O VALOR QUE ESTÁ CHEGANDO DO PERÍODO ANTERIOR
        console.log(`Iniciando período '${periodoAtual.nomePeríodo}'. Última conversão total era:`, acumuladorGeral.ultimaConversaoTotal); // <--- ADICIONE ESTA LINHA
        
        // O reduce INTERNO (das fases) agora começa com os últimos totais do acumulador GERAL.
        const resultadoReduceDasFases = periodoAtual.fases.reduce((acumuladorFase, faseAtual) => {
            
            // 1. Calcula os valores PROJETADOS (lógica continua a mesma)
            const racaoQtd = raçãoDiariaQtdPeixes(faseAtual.peso.de, faseAtual.peso.ate)(qtdPeixes)(faseAtual.tratos.tratoDiário);
            const consumoSemanal = projeçãoConsumoSemanal(racaoQtd)(faseAtual.diasDaFase);
            const conversaoProjetada = conversãoAlimentarProjetada(qtdPeixes)(consumoSemanal)(faseAtual.peso.de, faseAtual.peso.ate);
            const ganhoPeso = ganhoDePesoProjetado(faseAtual.peso.de, faseAtual.peso.ate);
            const biomassaProjetada = ganhoDeBiomassaProjetado(qtdPeixes)(ganhoPeso);

            // 2. Calcula os valores ACUMULADOS usando o acumulador da FASE
            const consumoAcumulado = projeçãoConsumoAcumulado(acumuladorFase.ultimoConsumoAcumulado)(consumoSemanal);
            const ganhoPesoAcumulado = ganhoDePesoAcumulado(acumuladorFase.ultimoGanhoPesoAcumulado, ganhoPeso);
            const conversaoAcumulada = conversãoAlimentarAcumulada(acumuladorFase.ultimaConversaoAcumulada)(conversaoProjetada);
            const biomassaAcumulada = ganhoDeBiomassaAcumulado(acumuladorFase.ultimaBiomassaAcumulada, biomassaProjetada);
            
            // 3. Cria o objeto da fase COMPLETA (lógica continua a mesma)
            const novaFaseCompleta = {
                ...faseAtual,
                raçãoDiariaQtdPeixes: racaoQtd,
                raçãoDiariaPorTrato: raçãoDiariaPorTrato(racaoQtd)(faseAtual.tratos.tratoDiário),
                consumoDeRação: { semanalProjetado: consumoSemanal, semanalProjetadoAcumulado: consumoAcumulado },
                conversaoAlimentar: { projetada: conversaoProjetada, acumuladaProjetada: conversaoAcumulada },
                custo: {
                    custoProjetadoDaRação: custoProjetadoDaRação(faseAtual.preçoProjetadoDaRaçãoKg)(consumoSemanal),
                    preçoDoPeríodo: null, // Será preenchido depois
                    percentualDoPrograma: null // Será preenchido depois
                },
                ganhoDePesoMédioDoPeixe: { projetadoSemanaGramas: ganhoPeso, acumuladoSemanaGramas: ganhoPesoAcumulado },
                ganhoBiomassa: { projetadaSemanaKg: biomassaProjetada, acumuladaSemanaKg: biomassaAcumulada }
            };

            // 4. Retorna o novo estado do acumulador da FASE
            return {
                fasesCompletas: [...acumuladorFase.fasesCompletas, novaFaseCompleta],
                ultimoConsumoAcumulado: consumoAcumulado,
                ultimaConversaoAcumulada: conversaoAcumulada,
                ultimoGanhoPesoAcumulado: ganhoPesoAcumulado,
                ultimaBiomassaAcumulada: biomassaAcumulada
            };

        }, { // Valor inicial do acumulador da FASE, buscando os dados do acumulador GERAL
            fasesCompletas: [],
            ultimoConsumoAcumulado: acumuladorGeral.ultimoConsumoTotal,
            ultimaConversaoAcumulada: acumuladorGeral.ultimaConversaoTotal,
            ultimoGanhoPesoAcumulado: acumuladorGeral.ultimoGanhoPesoTotal,
            ultimaBiomassaAcumulada: acumuladorGeral.ultimaBiomassaTotal
        });

        // Cria o novo período com as fases calculadas
        const novoPeriodoCompleto = {
            ...periodoAtual,
            fases: resultadoReduceDasFases.fasesCompletas
        };

        // ATUALIZA O ACUMULADOR GERAL para a próxima iteração de PERÍODO
        return {
            períodosCompletos: [...acumuladorGeral.períodosCompletos, novoPeriodoCompleto],
            ultimoConsumoTotal: resultadoReduceDasFases.ultimoConsumoAcumulado,
            ultimaConversaoTotal: resultadoReduceDasFases.ultimaConversaoAcumulada,
            ultimoGanhoPesoTotal: resultadoReduceDasFases.ultimoGanhoPesoAcumulado,
            ultimaBiomassaTotal: resultadoReduceDasFases.ultimaBiomassaAcumulada
        };

    }, { // Valor inicial do ACUMULADOR GERAL
        períodosCompletos: [],
        ultimoConsumoTotal: 0,
        ultimaConversaoTotal: 0,
        ultimoGanhoPesoTotal: 0,
        ultimaBiomassaTotal: 0
    });

    // O resultado que queremos está dentro da propriedade 'períodosCompletos' do nosso acumulador final
    return resultadoFinalReduce.períodosCompletos;
};

const calcularCustoDoPeriodo = (periodo) => {
    return periodo.fases.reduce((totalParcial, faseAtual) => {
        // Adicionamos ( ... || 0) para evitar erros se o valor for nulo
        return totalParcial + (faseAtual.custo.custoProjetadoDaRação || 0);
    }, 0);
};

const CalcularPreço = (períodos) => {
    return períodos.map(período => {
        const custoTotal = calcularCustoDoPeriodo(período);

        const novasFases = período.fases.map(faseAtual => {
            return {
                ...faseAtual,
                custo: {
                    ...faseAtual.custo,
                    custoTotalDoPeriodo: custoTotal // << LINHA CORRIGIDA
                }
            };
        });

        return {
            ...período,
            fases: novasFases
        };
    });
};

const adicionarPercentuais = (períodos) => {
    // 1. Calcula o custo total do programa uma única vez
    const custoTotalDoPrograma = períodos.reduce((total, periodo) => {
        return total + calcularCustoDoPeriodo(periodo);
    }, 0);

    // 2. Usa .map() para criar um novo array de períodos
    return períodos.map(periodo => {
        // Calcula o percentual para este período específico
    const percentualDoPeríodo = custoTotalDoPrograma > 0
        ? (calcularCustoDoPeriodo(periodo) / custoTotalDoPrograma) * 100
        : 0; // Se o custo total for 0, o percentual também é 0.


        // Cria o novo array de fases, adicionando o percentual a cada uma
        const novasFases = periodo.fases.map(fase => {
            return {
                ...fase,
                custo: {
                    ...fase.custo,
                    percentualDoPrograma: percentualDoPeríodo
                }
            };
        });

        // Retorna o novo objeto de período com as fases atualizadas
        return {
            ...periodo,
            fases: novasFases
        };
    });
};

function exibirResultadosNaPagina(períodosCompletos) {
    const container = document.getElementById('container-tabelas');
    container.innerHTML = ''; // Limpa o container antes de adicionar novo conteúdo

    períodosCompletos.forEach(periodo => {
        // Cria um título para o período
        const tituloPeriodo = document.createElement('h2');
        tituloPeriodo.textContent = periodo.nomePeríodo;
        container.appendChild(tituloPeriodo);

        // Cria a estrutura da tabela com as novas colunas no cabeçalho
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
            <tbody>
                </tbody>
        `;

        const corpoTabela = tabela.querySelector('tbody');

        // Preenche o corpo da tabela com os dados de cada fase, incluindo os novos dados
        periodo.fases.forEach(fase => {
            const linha = corpoTabela.insertRow();
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
                <td>${(fase.consumoDeRação.semanalProjetado).toFixed(2)} kg</td>
                <td>${(fase.consumoDeRação.semanalProjetadoAcumulado).toFixed(2)} kg</td>
                <td>${fase.conversaoAlimentar.projetada.toFixed(3)}</td>
                <td>${fase.conversaoAlimentar.acumuladaProjetada.toFixed(3)}</td>
                <td>R$ ${fase.custo.custoProjetadoDaRação.toFixed(2)}</td>
                <td>R$ ${fase.custo.custoTotalDoPeriodo.toFixed(2)}</td>
                <td>${fase.custo.percentualDoPrograma.toFixed(2)}%</td>
            `;
        });
        
        container.appendChild(tabela);
    });
}

// NOVA FUNÇÃO para exibir os parâmetros de entrada
function exibirParametrosDeEntrada(listaPeriodos, qtdPeixes) {
    const container = document.getElementById('container-parametros');
    let htmlConteudo = '<h2>Parâmetros de Entrada</h2>';

    htmlConteudo += `<h3>Geral</h3><ul><li>Quantidade de Peixes: ${qtdPeixes.toLocaleString('pt-BR')}</li></ul>`;

    listaPeriodos.forEach(([nome, qtd, dados]) => {
        htmlConteudo += `<h3>Fase: ${nome} `;
        htmlConteudo += `<h5>(${qtd} semana(s))</h5>`
        htmlConteudo += '<ul>';
        htmlConteudo += `<li>Preços da Ração: [${dados.precosRacao.join(', ')}]</li>`;
        htmlConteudo += `<li>Dias por Semana: [${dados.diasPorFase.join(', ')}]</li>`;
        htmlConteudo += `<li>Tratos por Dia: [${dados.tratosPorDia.join(', ')}]</li>`;
        htmlConteudo += `<li>% do P.V.: [${dados.tratosDiarios.join(', ')}]</li>`;
        htmlConteudo += '</ul>';
    });

    container.innerHTML = htmlConteudo;
}

// ========================================================================
// LÓGICA DO FORMULÁRIO DINÂMICO
// ========================================================================

const formPrincipal = document.getElementById('form-principal');
const containerPeriodosForm = document.getElementById('container-periodos-form');
const btnAdicionarPeriodo = document.getElementById('btn-adicionar-periodo');
const templatePeriodo = document.getElementById('template-periodo');
const templateFase = document.getElementById('template-fase');

window.addEventListener('DOMContentLoaded', () => {
    const dadosSalvosJSON = localStorage.getItem('dadosPiscicultura');

    if (dadosSalvosJSON) {
        try {
            const dadosSalvos = JSON.parse(dadosSalvosJSON);
            
            // Repopula a quantidade de peixes
            document.getElementById('qtdPeixes').value = dadosSalvos.qtdPeixes || 10000;

            // Recria os períodos e fases no formulário
            dadosSalvos.periodos.forEach(([nome, qtd, dados]) => {
                adicionarNovoPeriodo(); // Adiciona o card do período
                const todosPeriodosCards = containerPeriodosForm.querySelectorAll('.periodo-card');
                const ultimoPeriodoCard = todosPeriodosCards[todosPeriodosCards.length - 1];
                
                // Preenche o nome do período
                ultimoPeriodoCard.querySelector('.nome-periodo').value = nome;
                
                const containerFases = ultimoPeriodoCard.querySelector('.container-fases');
                for(let i = 0; i < qtd; i++) {
                    const cloneFase = templateFase.content.cloneNode(true);
                    const novaFaseCard = cloneFase.querySelector('.fase-card');
                    
                    // Preenche os dados de cada fase
                    novaFaseCard.querySelector('.peso-de').value = dados.pesos[i].de;
                    novaFaseCard.querySelector('.peso-ate').value = dados.pesos[i].ate;
                    novaFaseCard.querySelector('.desc-racao').value = dados.descriçõesRacao[i];
                    novaFaseCard.querySelector('.gran-racao').value = dados.granulometrias[i];
                    novaFaseCard.querySelector('.preco-racao').value = dados.precosRacao[i];
                    novaFaseCard.querySelector('.dias-fase').value = dados.diasPorFase[i];
                    novaFaseCard.querySelector('.trato-diario').value = dados.tratosDiarios[i];
                    novaFaseCard.querySelector('.tratos-dia').value = dados.tratosPorDia[i];

                    containerFases.appendChild(novaFaseCard);
                }
            });

            console.log("Dados do formulário carregados do localStorage.");
        } catch (error) {
            console.error("Erro ao carregar dados do localStorage:", error);
            // Se os dados estiverem corrompidos, limpa para evitar erros futuros
            localStorage.removeItem('dadosPiscicultura');

        }
    }
});

// --- Função para Adicionar um novo Período ---
function adicionarNovoPeriodo() {
    const clonePeriodo = templatePeriodo.content.cloneNode(true);
    const periodoCard = clonePeriodo.querySelector('.periodo-card');
    containerPeriodosForm.appendChild(periodoCard);
}

// --- Event Listeners ---
btnAdicionarPeriodo.addEventListener('click', adicionarNovoPeriodo);

// Adicionar/Remover Fases e Períodos (delegação de eventos)
containerPeriodosForm.addEventListener('click', (e) => {
// Dentro de containerPeriodosForm.addEventListener('click', (e) => { ... });

if (e.target.classList.contains('btn-adicionar-fase')) {
    const containerFases = e.target.previousElementSibling;
    const fases = containerFases.querySelectorAll('.fase-card');
    const ultimaFase = fases.length > 0 ? fases[fases.length - 1] : null;

    // 1. Clona o template
    const cloneFase = templateFase.content.cloneNode(true);
    const novaFaseCard = cloneFase.querySelector('.fase-card');
    
    // 2. Se existe uma fase anterior, copia os dados dela
    if (ultimaFase) {
        // Pega todos os inputs da última fase e da nova fase
        const inputsAntigos = ultimaFase.querySelectorAll('input');
        const inputsNovos = novaFaseCard.querySelectorAll('input');

        inputsAntigos.forEach((inputAntigo, index) => {
            // Repete o valor do campo anterior no novo campo
            inputsNovos[index].value = inputAntigo.value;
        });

        // Lógica especial para o peso: "De" se torna o "Até" anterior
        const pesoAteAnterior = ultimaFase.querySelector('.peso-ate').value;
        novaFaseCard.querySelector('.peso-de').value = pesoAteAnterior;
        // Limpa o campo "Peso (Até)" da nova fase para forçar a inserção
        novaFaseCard.querySelector('.peso-ate').value = ''; 
    }

    // 3. Adiciona a nova fase à página
    containerFases.appendChild(novaFaseCard);
}

// ... (o resto do event listener continua o mesmo)
    if (e.target.classList.contains('btn-remover-fase')) {
        e.target.parentElement.remove();
    }
    if (e.target.classList.contains('btn-remover-periodo')) {
        e.target.parentElement.remove();
    }
});

// --- Função principal que é chamada ao enviar o formulário ---
formPrincipal.addEventListener('submit', (e) => {
    e.preventDefault(); // Impede o recarregamento da página

    const qtdPeixes = parseFloat(document.getElementById('qtdPeixes').value);
    
    // 1. Coletar dados do formulário e transformar na estrutura que já usamos
    const meusPeríodosComDados = [...containerPeriodosForm.querySelectorAll('.periodo-card')].map(cardPeriodo => {
        const nome = cardPeriodo.querySelector('.nome-periodo').value;
        const fasesCards = [...cardPeriodo.querySelectorAll('.fase-card')];
        const qtd = fasesCards.length;

        const dados = {
            descriçõesRacao: fasesCards.map(f => f.querySelector('.desc-racao').value),
            granulometrias: fasesCards.map(f => f.querySelector('.gran-racao').value),
            precosRacao: fasesCards.map(f => parseFloat(f.querySelector('.preco-racao').value)),
            pesos: fasesCards.map(f => ({ de: parseFloat(f.querySelector('.peso-de').value), ate: parseFloat(f.querySelector('.peso-ate').value) })),
            diasPorFase: fasesCards.map(f => parseInt(f.querySelector('.dias-fase').value)),
            tratosDiarios: fasesCards.map(f => parseFloat(f.querySelector('.trato-diario').value)),
            tratosPorDia: fasesCards.map(f => parseInt(f.querySelector('.tratos-dia').value))
        };
        return [nome, qtd, dados];
    });

    const dadosParaSalvar = {
        qtdPeixes: qtdPeixes,
        periodos: meusPeríodosComDados
    };
    // Converte o objeto para uma string JSON e salva no localStorage
    localStorage.setItem('dadosPiscicultura', JSON.stringify(dadosParaSalvar));

    // 2. Chamar a cadeia de funções de cálculo que já criamos antes
    const estruturaInicial = criarPeríodos(meusPeríodosComDados);
    const periodosCalculados = períodos(estruturaInicial, qtdPeixes);
    const periodosComPreco = CalcularPreço(periodosCalculados);
    const resultadoFinal = adicionarPercentuais(periodosComPreco);

    // 3. Exibir os resultados
    document.querySelector('.container-principal').style.display = 'flex';
    exibirParametrosDeEntrada(meusPeríodosComDados, qtdPeixes);
    exibirResultadosNaPagina(resultadoFinal);
});
