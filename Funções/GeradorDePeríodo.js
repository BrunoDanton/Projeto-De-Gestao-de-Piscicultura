import conversãoAlimentarAcumulada from './ConversãoAlimentarAcumulada.js';
import conversãoAlimentarProjetada from './ConversãoAlimentarProjetada.js';
import custoProjetadoDaRação from './CustoProjetadoDaRação.js';
import ganhoDeBiomassaAcumulado from './GanhoDeBiomassaAcumulada.js';
import ganhoDeBiomassaProjetado from './GanhoDeBiomassaProjetado.js';
import ganhoDeBiomassaProjetado from './GanhoDeBiomassaProjetado.js';
import ganhoDePesoAcumulado from './GanhoDePesoAcumulado.js';
import ganhoDePesoProjetado from './GanhoDePesoProjetado.js';
import percentualDoGasto from './PercentualDoGasto.js';
import preçoDaFase from './PreçoDaFase.js';
import projeçãoConsumoAcumulado from './ProjeçãoConsumoAcumulado.js';
import projeçãoConsumoAcumulado from './ProjeçãoConsumoAcumulado.js';
import projeçãoConsumoSemanal from './ProjeçãoConsumoSemanal.js';
import raçãoDiariaPorTrato from './RaçãoDiariaPorTrato.js';
import raçãoDiariaQtdPeixes from './RaçãoDiariaQtdPeixes.js';

export const criarFase = (faseDeCultivo, descrição, granulometria, precoDaRacaoKg, QtdTratosPorDia, diasDaFase, QtdPeixes, índice) => {

    const RaçãoDiariaQtdPeixes = raçãoDiariaQtdPeixes(pesoMínimo, pesoMáximo)(QtdPeixes)(tratoDiário)
    const RaçãoDiariaPorTrato = raçãoDiariaPorTrato(RaçãoDiariaQtdPeixes)(tratoDiário)
    const ProjeçãoConsumoSemanal = projeçãoConsumoSemanal(RaçãoDiariaQtdPeixes)(diasDaFase)
    const ProjeçãoConsumoAcumulado = projeçãoConsumoAcumulado(totalAnterior)(ProjeçãoConsumoSemanal)
    const ConversãoAlimentarProjetada = conversãoAlimentarProjetada(QtdPeixes)(ProjeçãoConsumoSemanal)(pesoMínimo, pesoMáximo)
    const ConversãoAlimentarAcumulada = conversãoAlimentarAcumulada(totalAnterior2)(ConversãoAlimentarProjetada)
    const CustoProjetadoDaRação = custoProjetadoDaRação(precoDaRacaoKg)(ProjeçãoConsumoSemanal)
    const PreçoDaFase = preçoDaFase()
    const PercentualDoGasto = percentualDoGasto()
    const GanhoDePesoProjetado = ganhoDePesoProjetado(pesoMínimo, pesoMáximo)
    const GanhoDePesoAcumulado = ganhoDePesoAcumulado(totalAnterior3)(GanhoDePesoProjetado)
    const GanhoDeBiomassaProjetado = ganhoDeBiomassaProjetado(QtdPeixes)(GanhoDePesoProjetado)
    const GanhoDeBiomassaAcumulado = ganhoDeBiomassaAcumulado(totalAnterior4, GanhoDeBiomassaProjetado)
    
    return {
        produtoRacao: { descrição: descrição, granulometria: granulometria },

        faseDeCultivo: faseDeCultivo,

        precoProjetadoDaRaçãoKg: precoDaRacaoKg,

        peso: { de: null, até: null },

        diasDaFase: diasDaFase,

        semanaDeCriacao: índice + 1,

        tratos: { tratoDiário: null, QtdTratosPorDia: QtdTratosPorDia },

        raçãoDiariaPorTrato: RaçãoDiariaPorTrato,

        raçãoDiariaQtdPeixes: RaçãoDiariaQtdPeixes,

        consumoDeRação: { semanalProjetado: ProjeçãoConsumoSemanal, semanalProjetadoAcumulado: ProjeçãoConsumoAcumulado},

        conversaoAlimentar: { projetada: ConversãoAlimentarProjetada, acumuladaProjetada: ConversãoAlimentarAcumulada },

        custo: { custoProjetadoDaRação: CustoProjetadoDaRação, preçoDaFase: PreçoDaFase, percentualDoPrograma: PercentualDoGasto },

        ganhoDePesoMédioDoPeixe: { projetadoSemanaGramas: GanhoDePesoProjetado, acumuladoSemanaGramas: GanhoDePesoAcumulado },

        ganhoBiomassa: { projetadaSemanaKg: GanhoDeBiomassaProjetado, acumuladaSemanaKg: GanhoDeBiomassaAcumulado }
    }
}

export const criarFases = (nomePeríodo, qtdFases, descrição, granulometria, precoDaRacaoKg, QtdTratosPorDia, diasDaFase, QtdPeixes, faseInicial = 0) => {
    return Array.from({length: qtdFases}, (_, i) => criarFase(nomePeríodo, descrição, granulometria, precoDaRacaoKg, QtdTratosPorDia, diasDaFase, QtdPeixes, i + faseInicial))
}

const criarPeríodo = (nomePeríodo, qtdFases, descrição, granulometria, precoDaRacaoKg, QtdTratosPorDia, diasDaFase, QtdPeixes, faseInicial = 0) => {
    return {nomePeríodo: nomePeríodo, fases: criarFases(nomePeríodo, qtdFases, descrição, granulometria, precoDaRacaoKg, QtdTratosPorDia, diasDaFase, QtdPeixes, faseInicial)}
}

export const criarPeríodos = (listaDePeríodos) => {

    return listaDePeríodos.reduce((acc, [nome, qtd, descrição, granulometria, precoDaRacaoKg, QtdTratosPorDia, QtdPeixes, diasDaFase = 7]) => {

        const faseInicial = acc.totalFases
        const novoPeríodo = criarPeríodo(nome, qtd, descrição, granulometria, precoDaRacaoKg, QtdTratosPorDia, diasDaFase, QtdPeixes, faseInicial)

        return {
            períodos: [...acc.períodos, novoPeríodo],
            totalFases: faseInicial + qtd
        }

        }, {períodos: [], totalFases: 0}).períodos
}
