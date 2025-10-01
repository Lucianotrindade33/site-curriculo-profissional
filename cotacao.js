document.addEventListener('DOMContentLoaded', () => {
    
    // ======================================================================
    // ⚠️ CHAVES DE API ⚠️
    // ======================================================================
    const API_KEY_TEMPO = '082c80b2880e05600b75186b5e65e281'; // Sua chave OpenWeatherMap
    const API_KEY_UNSPLASH = 'uJ46ExbipK2QDvH3J2USFfYU9MfIPYv9ONu6_1gEjxY';   // Sua chave Unsplash
    
    // VARIÁVEL GLOBAL: Armazena a cotação do Dólar (USD)
    let usdParaBRL = 0;
    
    // ======================================================================
    // FUNÇÃO DE ANIMAÇÃO TYPEWRITER (DIGITANDO)
    // ======================================================================
    const typeWriterEffect = (elementId, text, delay = 5) => {
        const element = document.getElementById(elementId);
        let i = 0;
        
        // Garante que o elemento está vazio antes de começar
        element.innerHTML = ''; 

        const typing = () => {
            if (i < text.length) {
                // Adiciona a próxima letra
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(typing, delay);
            }
        };

        // Inicia a animação
        typing();
    };

    // ======================================================================
    // 1. COTAÇÃO DE MOEDAS (Função que popula usdParaBRL)
    // ======================================================================
    const API_URL_COTACAO = 'https://open.er-api.com/v6/latest/BRL';
    const cotacaoDiv = document.getElementById('cotacao-resultado');

    const buscarCotacao = async () => {
        try {
            cotacaoDiv.innerHTML = '<p>Buscando cotações em tempo real...</p>';
            const response = await fetch(API_URL_COTACAO);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP! Status: ${response.status}`);
            }
            
            const data = await response.json();
            const taxas = data.rates;

            const usdToBRL_local = (1 / taxas.USD).toFixed(4); 
            const eurToBRL = (1 / taxas.EUR).toFixed(4); 

            // SALVANDO O VALOR GLOBALMENTE
            usdParaBRL = parseFloat(usdToBRL_local); 
            
            const htmlResultado = `
                <table class="tabela-cotacao">
                    <thead>
                        <tr>
                            <th>Moeda</th>
                            <th>Valor por 1 Moeda em Reais (R$)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Dólar Americano (USD)</td>
                            <td class="valor">R$ ${usdToBRL_local}</td>
                        </tr>
                        <tr>
                            <td>Euro (EUR)</td>
                            <td class="valor">R$ ${eurToBRL}</td>
                        </tr>
                    </tbody>
                </table>
                <p class="data-atualizacao">Última atualização: ${new Date(data.time_last_update_utc).toLocaleString('pt-BR')}</p>
            `;

            cotacaoDiv.innerHTML = htmlResultado;

        } catch (error) {
            console.error('Erro ao buscar dados da API de Cotação:', error);
            cotacaoDiv.innerHTML = '<p style="color: red;">Erro ao carregar cotações.</p>';
        }
    };

    buscarCotacao();
    
    // ======================================================================
    // 2. PREVISÃO DO TEMPO & PROJEÇÃO DE VENDAS
    // ======================================================================
    const tempoDiv = document.getElementById('tempo-resultado');
    const inputCidade = document.getElementById('input-cidade');
    const btnBuscar = document.getElementById('btn-buscar-tempo');

    // Função para buscar a URL da imagem (Unsplash) - (Não alterada)
    const buscarURLImagem = async (cidadeNome) => {
        if (!cidadeNome) return null; 
        
        const API_URL_IMAGEM = `https://api.unsplash.com/search/photos?query=${cidadeNome}&client_id=${API_KEY_UNSPLASH}&per_page=1&orientation=landscape`;

        try {
            const response = await fetch(API_URL_IMAGEM);
            if (!response.ok) {
                console.error('Erro ao buscar imagem do Unsplash:', response.status);
                return null;
            }
            
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                return {
                    url: data.results[0].urls.regular,
                    fotografo: data.results[0].user.name
                };
            }
            return null;
        } catch (error) {
            console.error('Erro ao buscar URL da imagem:', error);
            return null;
        }
    };


    const buscarTempo = async () => {
        const cidade = inputCidade.value.trim();
        
        if (cidade === "") {
            tempoDiv.innerHTML = '<p style="color: orange;">Por favor, digite o nome de uma cidade.</p>';
            return;
        }

        if (API_KEY_TEMPO.length < 5) {
            tempoDiv.innerHTML = '<p style="color: red;">ERRO: Por favor, insira sua chave de API do OpenWeatherMap.</p>';
            return;
        }

        tempoDiv.innerHTML = '<p>Buscando previsão e imagem...</p>';
        
        try {
            // 1. BUSCA O TEMPO
            const tempoResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${API_KEY_TEMPO}&units=metric&lang=pt_br`);
            
            if (!tempoResponse.ok) {
                if (tempoResponse.status === 404) {
                    tempoDiv.innerHTML = `<p style="color: red;">Cidade "${cidade}" não encontrada. Verifique o nome.</p>`;
                } else {
                    throw new Error(`Erro HTTP! Status: ${tempoResponse.status}`);
                }
                return; 
            }
            const tempoData = await tempoResponse.json();

            // 2. BUSCA A URL DA IMAGEM
            const imagemInfo = await buscarURLImagem(tempoData.name);
            
            // 3. EXTRAÇÃO DOS DADOS DE TEMPO
            const temperatura = tempoData.main.temp.toFixed(1);
            const descricao = tempoData.weather[0].description;
            const icone = tempoData.weather[0].icon;
            const umidade = tempoData.main.humidity;
            const cidadeNomeCompleto = `${tempoData.name}, ${tempoData.sys.country}`;
            
            
            // ======================================================================
            // ⭐️ LÓGICA DE PROJEÇÃO DE VENDAS ⭐️
            // ======================================================================
            const tempValue = parseFloat(temperatura); 
            let picolesVendidos = 0;
            let motivoVenda = "";

            if (tempValue <= 15) {
                picolesVendidos = 50;
                motivoVenda = "a temperatura está baixa (inferior ou igual a 15°C).";
            } else if (tempValue > 15 && tempValue <= 25) {
                picolesVendidos = 60;
                motivoVenda = "a temperatura está amena (entre 15°C e 25°C).";
            } else { // tempValue > 25
                picolesVendidos = 120;
                motivoVenda = "a temperatura está alta (superior a 25°C), o que é ideal para sorvetes!";
            }
            
            const custoPorPicoleUSD = 1; // $1 USD
            const receitaEstimadaUSD = picolesVendidos * custoPorPicoleUSD;

            // CÁLCULO EM REAIS
            let receitaEstimadaBRL = 0;
            if (usdParaBRL > 0) {
                receitaEstimadaBRL = receitaEstimadaUSD * usdParaBRL;
            }
            
            const textoReceitaBRL = receitaEstimadaBRL > 0 
                ? `${receitaEstimadaBRL.toFixed(2)}` 
                : '0.00'; // Valor limpo para animação

            
            // ======================================================================
            // ⭐️ HTML TEMPO E IMAGEM (BLOCO 1) ⭐️
            // ======================================================================
            
            const imagemURL = imagemInfo ? imagemInfo.url : null;
            const styleFundo = imagemURL 
                ? `background-image: url('${imagemURL}');`
                : '';

            const creditoFoto = imagemInfo ? 
                `<figcaption class="credito-foto">Foto: ${imagemInfo.fotografo} / Unsplash</figcaption>` : 
                '';

            const htmlResultadoTempo = `
                <div class="tempo-box-fundo" style="${styleFundo}">
                    <h3>${cidadeNomeCompleto}</h3>
                    <div class="tempo-dados">
                        <img src="http://openweathermap.org/img/wn/${icone}@2x.png" alt="${descricao}" class="icone-tempo">
                        <p class="temp-valor">${temperatura}°C</p>
                        <p class="temp-descricao">Condição: ${descricao.toUpperCase()}</p>
                        <p class="temp-umidade">Umidade: ${umidade}%</p>
                    </div>
                    ${creditoFoto}
                </div>
            `;
            
            
            // ======================================================================
            // 🍦 RELATÓRIO DE VENDAS SEPARADO (BLOCO 2 - PRONTO PARA ANIMAÇÃO) 🍦
            // ======================================================================
            const htmlRelatorioVendas = `
                <div class="vendas-relatorio-separado">
                    <h4 class="relatorio-titulo">🍦 Projeção de Vendas Detalhada 🍦</h4>
                    
                    <p class="vendas-motivo-texto" id="motivo-texto-animacao">Calculando...</p>
                    
                    <div class="vendas-detalhes">
                        <div class="vendas-metrica">
                            <span class="vendas-numero" id="picoles-animacao">0</span> 
                            <span class="vendas-unidade">picolés vendidos</span>
                        </div>
                        
                        <div class="vendas-receita-box">
                            <p class="vendas-receita-dolar">Receita Estimada (USD): **$<span id="usd-animacao">0.00</span>**</p>
                            <p class="vendas-receita-real">Receita Estimada (BRL): R$ <span id="brl-animacao">0.00</span></p>
                        </div>
                    </div>
                </div>
            `;
            
            // 5. INJETA AMBOS OS BLOCOS (Tempo + Vendas) NA PÁGINA
            tempoDiv.innerHTML = htmlResultadoTempo + htmlRelatorioVendas;
            
            
            // ======================================================================
            // 6. EXECUTA AS ANIMAÇÕES APÓS INJETAR O HTML
            // ======================================================================
            
            const motivoText = `Com **${temperatura}°C** em ${tempoData.name}, e considerando que ${motivoVenda}, a estimativa é:`;
            
            // Animação 1: Motivo
            typeWriterEffect('motivo-texto-animacao', motivoText, 25); // Velocidade mais lenta para texto

            // Animação 2: Picolés (Atrasada em 1 segundo)
            setTimeout(() => {
                typeWriterEffect('picoles-animacao', picolesVendidos.toString(), 10);
            }, 1000); 
            
            // Animação 3: USD (Atrasada em 1.5 segundos)
            setTimeout(() => {
                typeWriterEffect('usd-animacao', receitaEstimadaUSD.toFixed(2).toString(), 10);
            }, 1500); 

            // Animação 4: BRL (Atrasada em 2 segundos)
            setTimeout(() => {
                typeWriterEffect('brl-animacao', textoReceitaBRL.toString(), 10);
            }, 2000); 


        } catch (error) {
            console.error('Erro ao buscar dados da API de Tempo:', error);
            tempoDiv.innerHTML = `<p style="color: red;">Erro ao buscar previsão do tempo. Detalhes: ${error.message}</p>`;
        }
    };

    // Eventos de clique e tecla
    btnBuscar.addEventListener('click', buscarTempo);
    
    inputCidade.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            buscarTempo();
        }
    });
});