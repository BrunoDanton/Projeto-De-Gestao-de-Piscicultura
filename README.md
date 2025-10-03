#  Plano Alimentar para Piscicultura 🐟

Calculadora e simulador para planejamento de piscicultura. Crie fases e semanas de cultivo dinamicamente para projetar o plano alimentar, estimar custos, FCR, ganho de biomassa e conversão alimentar. Uma ferramenta PWA completa, instalável e com funcionamento offline para otimizar a produção e a tomada de decisão.

![Screenshot do Projeto](Img%20-%20Plano%20Alimentar.png)

---

## ✨ Funcionalidades

* **Formulário Dinâmico:** Adicione e remova múltiplas fases de cultivo (ex: Alevinagem, Engorda) e múltiplas semanas dentro de cada período.
* **Preenchimento Automático:** Os dados de uma semana são automaticamente preenchidos na próxima, agilizando a inserção de dados.
* **Cálculos Detalhados:** O sistema calcula automaticamente para cada semana:
    * Consumo de ração (semanal e acumulado)
    * Ganho de peso e de biomassa (semanal e acumulado)
    * Conversão alimentar (projetada e acumulada)
    * Custos com ração
* **Acumulação Contínua:** Os valores acumulados (consumo, biomassa, etc.) continuam a contagem de uma fase para a outra, fornecendo uma visão geral do ciclo completo.
* **Análise Financeira:** Calcula o custo total de cada fase e o percentual que cada uma representa no custo total do programa.
* **Persistência de Dados:** O formulário preenchido é salvo automaticamente no navegador (`localStorage`), para que você não perca seus dados ao fechar a página.
* **Experiência de Aplicativo (PWA):**
    * **Instalável:** Pode ser "instalado" no computador, ganhando um ícone na área de trabalho.
    * **Offline:** Funciona mesmo sem conexão com a internet após o primeiro carregamento.

## 🚀 Tecnologias Utilizadas

* **HTML5:** Estrutura do formulário e das tabelas.
* **CSS3:** Estilização moderna, incluindo layout com Flexbox e Grid.
* **JavaScript (ES6+):** Lógica de negócio, manipulação do DOM e cálculos, utilizando recursos como:
    * Módulos (`import`/`export`)
    * Funções de Array (`map`, `reduce`, `forEach`)
    * Operador Spread (`...`) para imutabilidade
* **Progressive Web App (PWA):**
    * `manifest.json`
    * `Service Worker` para funcionamento offline.

## ⚙️ Como Utilizar

Para rodar este projeto localmente, é necessário servi-lo através de um servidor web (devido às restrições de segurança do Service Worker). A forma mais fácil é usando a extensão **Live Server** no VS Code.

1.  Clone este repositório:
    ```bash
    git clone [https://github.com/BrunoDanton/Projeto-De-Gestão-de-Piscicultura.git](https://github.com/BrunoDanton/Projeto-De-Gestao-de-Piscicultura.git)
    ```
2.  Abra a pasta do projeto no Visual Studio Code.
3.  Instale a extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).
4.  Clique com o botão direito no arquivo `ProgramaAlimentar.html` e selecione "Open with Live Server".
5.  O projeto abrirá no seu navegador. Após alguns segundos, um ícone de instalação aparecerá na barra de endereço, permitindo que você instale o PWA no seu computador.

## 📂 Estrutura dos Arquivos

```
/
├── Funções/
│   ├── (diversos arquivos .js com as fórmulas de cálculo)
│   └── GeradorDePeríodo copy.js
├── ícones/
│   ├── ícone-192.png
│   └── ícone-512.png
├── manifest.json
├── ProgramaAlimentar.css
├── ProgramaAlimentar.html
├── ProgramaAlimentar.js
└── service-worker.js
```

---

*Feito com base em um projeto colaborativo.*
