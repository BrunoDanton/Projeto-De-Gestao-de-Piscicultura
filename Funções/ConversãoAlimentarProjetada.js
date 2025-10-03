const conversãoAlimentarProjetada = (qtdPeixes) => (projeçãoConsumoSemanal) => (pesoMínimo, pesoMáximo) => {
    const ganhoPesoIndividual = pesoMáximo - pesoMínimo;
    const ganhoBiomassaTotalGramas = ganhoPesoIndividual * qtdPeixes;
    if (ganhoBiomassaTotalGramas <= 0) {
        return 0;
    }
    const ganhoBiomassaTotalKg = ganhoBiomassaTotalGramas / 1000;

    const fcr = projeçãoConsumoSemanal / ganhoBiomassaTotalKg;

    return fcr;
};

export default conversãoAlimentarProjetada;