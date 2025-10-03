// GeradorDePeríodo.js

export const criarFase = (faseDeCultivo, índice, dadosDaFase) => {
    return {
        produtoRacao: { descrição: dadosDaFase.descricaoRacao ?? null, granulometria: dadosDaFase.granulometria ?? null },

        faseDeCultivo,

        preçoProjetadoDaRaçãoKg: dadosDaFase.precoRacao ?? null,

        // Corrigido: agora só usamos "ate" (sem acento)
        peso: { de: dadosDaFase.peso?.de ?? null, ate: dadosDaFase.peso?.ate ?? null },

        diasDaFase: dadosDaFase.dias ?? null,

        semanaDeCriacao: índice + 1,

        tratos: { tratoDiário: dadosDaFase.tratoDiario ?? null, QtdTratosPorDia: dadosDaFase.tratosPorDia ?? null },

        raçãoDiariaPorTrato: null,

        raçãoDiariaQtdPeixes: null,

        consumoDeRação: { semanalProjetado: null, semanalProjetadoAcumulado: null },

        conversaoAlimentar: { projetada: null, acumuladaProjetada: null },

        custo: { custoProjetadoDaRação: null, preçoDoPeríodo: null, percentualDoPrograma: null },

        ganhoDePesoMédioDoPeixe: { projetadoSemanaGramas: null, acumuladoSemanaGramas: null },

        ganhoBiomassa: { projetadaSemanaKg: null, acumuladaSemanaKg: null }
    }
}

export const criarFases = (nomePeríodo, qtdFases, faseInicial = 0, arraysDeDados) => {
    return Array.from({ length: qtdFases }, (_, i) => {
        const dadosDaFaseAtual = {
            descricaoRacao: arraysDeDados.descriçõesRacao[i],
            granulometria: arraysDeDados.granulometrias[i],
            precoRacao: arraysDeDados.precosRacao[i],
            peso: arraysDeDados.pesos[i],
            dias: arraysDeDados.diasPorFase[i],
            tratoDiario: arraysDeDados.tratosDiarios[i],
            tratosPorDia: arraysDeDados.tratosPorDia[i]
        };

        return criarFase(nomePeríodo, i + faseInicial, dadosDaFaseAtual);
    });
}

export const criarPeríodo = (nomePeríodo, qtdFases, faseInicial = 0, arraysDeDados) => {
    return { nomePeríodo, fases: criarFases(nomePeríodo, qtdFases, faseInicial, arraysDeDados) }
}

export const criarPeríodos = (listaDePeríodos) => {
    return listaDePeríodos.reduce((acc, [nome, qtd, arraysDeDados]) => {
        const faseInicial = acc.totalFases;
        const novoPeríodo = criarPeríodo(nome, qtd, faseInicial, arraysDeDados);

        return {
            períodos: [...acc.períodos, novoPeríodo],
            totalFases: faseInicial + qtd
        }
    }, { períodos: [], totalFases: 0 }).períodos;
}

