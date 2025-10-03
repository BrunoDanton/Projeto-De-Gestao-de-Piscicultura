const raçãoDiariaQtdPeixes = (pesoMínimo, pesoMáximo) => (qtdPeixes) => (tratoDiario) => {
    // Exemplo de lógica (SUA LÓGICA PODE SER DIFERENTE)
    // O importante é que no final, isso retorne um NÚMERO
    const pesoMedio = (pesoMínimo + pesoMáximo) / 2;
    // Por exemplo, digamos que você queira calcular a ração por dia com base no peso médio, quantidade de peixes e trato diário.
    // Esta é uma lógica hipotética, você deve colocar a SUA lógica aqui.
    const resultadoNumerico = (pesoMedio * qtdPeixes * tratoDiario) / 100
    return resultadoNumerico; // ISSO PRECISA SER UM NÚMERO
};

export default raçãoDiariaQtdPeixes;