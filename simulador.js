document.addEventListener('DOMContentLoaded', () => {
    // CRÍTICO: Configurações EmailJS
    const serviceId = 'service_w9680wn'; 
    const templateId = 'template_uh4fd6q'; 
    const publicKey = 'ECjTNMoHjUJ25-3dq'; 
    
    // 1. Dicionário de dados dos carros e coeficientes de financiamento
    const carros = {
        corollaXei: { preco: 193720, img: 'corolla-xei.jpg' },
        corollaGli: { preco: 168300, img: 'corolla-gli.jpg' },
        corollaCrossXr: { preco: 182900, img: 'corolla-cross-xr.jpg' },
        corollaCrossXre: { preco: 193720, img: 'corolla-cross-xre.jpg' },
        corollaCrossHibrida: { preco: 221900, img: 'corolla-cross-hibrida.jpg' },
        sw4SrxPlatinum: { preco: 446000, img: 'sw4-srx-platinum.jpg' },
        hiluxSrx: { preco: 344820, img: 'hilux-srx.jpg' }
    };

    const coeficientes = {
        '24x': 0.048345,
        '36x': 0.04002,
        '48x': 0.03698
    };

    // 2. Referências aos elementos HTML
    const carroSelect = document.getElementById('carro');
    const carPriceElement = document.getElementById('carPrice');
    const entradaInput = document.getElementById('entrada');
    const calcularBtn = document.getElementById('calcularBtn');
    const resultsDiv = document.getElementById('results');
    const bgImageContainer = document.querySelector('.background-image-container');
    
    // Referências da Ficha Cadastral
    const mainContent = document.getElementById('main-content');
    const fichaSection = document.getElementById('fichaSection');
    const showFichaBtn = document.getElementById('showFichaBtn');
    const fichaForm = document.getElementById('fichaForm');
    const fichaImpressaoDiv = document.getElementById('ficha-impressao');
    const cepInput = document.getElementById('cep');
    const enderecoInput = document.getElementById('endereco');
    const bairroInput = document.getElementById('bairro');
    const cidadeInput = document.getElementById('cidade');
    const estadoInput = document.getElementById('estado');
    const cepMessage = document.getElementById('cepMessage');
    
    // Referências do Formulário de Contato
    const contactForm = document.getElementById('contactForm');
    const contactSuccessMessage = document.getElementById('contactSuccessMessage');

    // NOVAS Referências para o fluxo de "Vamos nos conectar"
    const connectTriggerBtn = document.getElementById('connectTriggerBtn');
    const connectTriggerSection = document.getElementById('connectTriggerSection');
    const connectSection = document.getElementById('connectSection');
    const backToSimuladorBtn = document.getElementById('backToSimuladorBtn');
    
    // Inicializa o EmailJS
    emailjs.init(publicKey);

    // 3. Funções auxiliares
    const formatPrice = (price) => {
        const num = parseFloat(price);
        return isNaN(num) ? 'R$ 0,00' : num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const clearAddressFields = () => {
        enderecoInput.value = '';
        bairroInput.value = '';
        cidadeInput.value = '';
        estadoInput.value = '';
    };

    const enableAddressFields = () => {
        enderecoInput.disabled = false;
        bairroInput.disabled = false;
        cidadeInput.disabled = false;
        estadoInput.disabled = false;
    };

    const disableAddressFields = () => {
        enderecoInput.disabled = true;
        bairroInput.disabled = true;
        cidadeInput.disabled = true;
        estadoInput.disabled = true;
    };

    const formatPlainText = (label, value, isPrice = false) => {
        const val = value ? String(value).trim() : '';
        let displayValue;
        
        if (!val || (isPrice && parseFloat(val) === 0)) {
            displayValue = 'Não informado';
        } else if (isPrice) {
            displayValue = formatPrice(val);
        } else {
            displayValue = val;
        }

        return `${label}: ${displayValue}\n`;
    };

    const cleanSimulationHtml = (html) => {
        let text = html.replace(/<[^>]*>/g, '');
        text = text.replace(/------/g, '\n------\n'); 
        text = text.replace(/ {2,}/g, ' ');
        text = text.replace(/\n{3,}/g, '\n\n');
        text = text.replace(/Valor Financiado:/g, 'Valor Financiado:');
        return text.trim();
    };
    
    // 4. Lógica Principal
    carroSelect.addEventListener('change', () => {
        const selectedCarro = carroSelect.value;
        if (selectedCarro) {
            const carroInfo = carros[selectedCarro];
            carPriceElement.textContent = `Preço: ${formatPrice(carroInfo.preco)}`;
            carPriceElement.style.display = 'block';
            bgImageContainer.style.backgroundImage = `url('./img/${carroInfo.img}')`;
            entradaInput.value = '';
            resultsDiv.innerHTML = '<p>Nenhuma simulação realizada ainda.</p>';
            fichaSection.classList.add('hidden');
        } else {
            carPriceElement.style.display = 'none';
        }
    });

    calcularBtn.addEventListener('click', () => {
        const selectedCarro = carroSelect.value;
        const entrada = parseFloat(entradaInput.value);
        if (!selectedCarro || isNaN(entrada) || entrada < 0) {
            resultsDiv.innerHTML = '<p>Por favor, selecione um carro e insira um valor de entrada válido.</p>';
            fichaSection.classList.add('hidden');
            return;
        }
        const precoCarro = carros[selectedCarro].preco;
        if (entrada >= precoCarro) {
            resultsDiv.innerHTML = '<p>O valor de entrada não pode ser maior ou igual ao preço do carro.</p>';
            fichaSection.classList.add('hidden');
            return;
        }
        const valorFinanciado = precoCarro - entrada;
        resultsDiv.innerHTML = '';
        resultsDiv.innerHTML += `<p class="highlight">Valor Financiado: ${formatPrice(valorFinanciado)}</p>`;
        for (const [parcelas, coeficiente] of Object.entries(coeficientes)) {
            const valorParcela = valorFinanciado * coeficiente;
            const totalPago = valorParcela * parseInt(parcelas);
            resultsDiv.innerHTML += `
                <p><strong>${parcelas}:</strong> ${formatPrice(valorParcela)}</p>
                <p>Total pago com juros: ${formatPrice(totalPago)}</p>
                <hr>
            `;
        }
        fichaSection.classList.remove('hidden');
    });

    showFichaBtn.addEventListener('click', () => {
        fichaForm.classList.toggle('hidden');
        if (!fichaForm.classList.contains('hidden')) {
            showFichaBtn.textContent = 'ESCONDER FICHA';
        } else {
            showFichaBtn.textContent = 'PREENCHER FICHA';
        }
    });

    cepInput.addEventListener('blur', async (e) => {
        const cep = e.target.value.replace(/\D/g, '');
        clearAddressFields();
        cepMessage.textContent = '';
        disableAddressFields();

        if (cep.length !== 8) {
            return;
        }

        const mockData = {
            '88000000': {
                logradouro: 'Rua Simulação',
                bairro: 'Centro',
                localidade: 'Florianópolis',
                uf: 'SC'
            },
            '88010000': {
                logradouro: 'Rua Fictícia',
                bairro: 'Agronômica',
                localidade: 'Florianópolis',
                uf: 'SC'
            }
        };

        const result = mockData[cep];

        const isGeneralCep = cep === '88000000';

        if (result && !isGeneralCep) {
            enderecoInput.value = result.logradouro;
            bairroInput.value = result.bairro;
            cidadeInput.value = result.localidade;
            estadoInput.value = result.uf;
        } else {
            cepMessage.textContent = 'CEP inexistente ou genérico. Preencha o endereço manualmente.';
            enableAddressFields();
        }
    });

    // --- LÓGICA DE ENVIO DO FORMULÁRIO FICHA CADASTRAL (APENAS IMPRESSÃO) ---
    fichaForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.carroSelecionado = carroSelect.value;
        data.valorEntrada = entradaInput.value;
        const simulacaoHTML = resultsDiv.innerHTML;

        // A LÓGICA DE ENVIO DE E-MAIL FOI REMOVIDA.
        
        alert('Ficha salva para impressão/PDF.');
        generatePrintableDocument(data, simulacaoHTML);
        fichaForm.reset();
        fichaForm.classList.add('hidden');
        showFichaBtn.textContent = 'PREENCHER FICHA';
    });


    // --- LÓGICA DE ENVIO DO FORMULÁRIO "VAMOS NOS CONECTAR" (ENVIA E-MAIL) ---
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        const emailBodyPlainText = `
=============================================
NOVO CONTATO SOLICITADO (Vamos nos conectar)
=============================================

DADOS DO CLIENTE
---------------------------------------------
${formatPlainText('Nome Completo', data.nomeCompleto)}
${formatPlainText('Email', data.email)}

MENSAGEM DEIXADA
---------------------------------------------
${data.mensagem || 'O cliente não deixou uma mensagem específica.'}
---------------------------------------------
`;

        const templateParams = {
            nomeCliente: data.nomeCompleto,
            // CRÍTICO: Placeholders para satisfazer o template complexo:
            telefoneCliente: 'N/A - Formulário de Contato', 
            carroProposto: 'Formulário de Contato Simples', 
            to_email: 'lucianotrindade.ti@gmail.com',
            text_message: emailBodyPlainText 
        };

        emailjs.send(serviceId, templateId, templateParams)
            .then(() => {
                alert('Sua mensagem de contato foi enviada com sucesso!');
                contactForm.reset();
                contactSuccessMessage.classList.remove('hidden');
                setTimeout(() => contactSuccessMessage.classList.add('hidden'), 5000);
            })
            .catch((error) => {
                console.error('Erro ao enviar e-mail de contato:', error);
                alert('Ocorreu um erro ao enviar a mensagem. Verifique o console do navegador (F12).');
            });
    });

    // --- LÓGICA DE NAVEGAÇÃO DE FLUXO ---
    connectTriggerBtn.addEventListener('click', () => {
        // 1. Esconde as seções do simulador e o botão gatilho
        document.querySelector('.simulador-header').classList.add('hidden');
        document.querySelector('.car-selection').classList.add('hidden');
        document.querySelector('.financing-input').classList.add('hidden');
        document.querySelector('.financing-results').classList.add('hidden');
        fichaSection.classList.add('hidden'); 
        connectTriggerSection.classList.add('hidden');

        // 2. Mostra o formulário de contato simples
        connectSection.style.display = 'block';

        // 3. Rola a tela para o topo do formulário
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    backToSimuladorBtn.addEventListener('click', () => {
        // 1. Esconde o formulário de contato simples
        connectSection.style.display = 'none';
        
        // 2. Mostra as seções do simulador novamente
        document.querySelector('.simulador-header').classList.remove('hidden');
        document.querySelector('.car-selection').classList.remove('hidden');
        document.querySelector('.financing-input').classList.remove('hidden');
        document.querySelector('.financing-results').classList.remove('hidden');
        connectTriggerSection.classList.remove('hidden');

        // 3. Rola a tela para o topo da página
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });


    // Função para gerar o documento (sem alterações)
    function generatePrintableDocument(data, simulacaoHTML) {
        mainContent.classList.add('hidden');
        fichaImpressaoDiv.classList.remove('hidden');

        // ... (Ficha HTML para impressão) ...
        const fichaHTML = `
            <h2>Ficha de Proposta</h2>
            <p><strong>Carro Selecionado:</strong> ${data.carroSelecionado || 'N/A'}</p>
            <p><strong>Valor da Entrada:</strong> ${formatPrice(parseFloat(data.valorEntrada))}</p>
            
            <hr>
            <h2>Dados Pessoais</h2>
            <p><strong>Nome Completo:</strong> ${data.nomeCompleto || 'N/A'}</p>
            <p><strong>CPF:</strong> ${formatPlainText('CPF', data.cpf).replace(/<[^>]*>/g, '').replace('CPF: ', '')}</p>
            <p><strong>Data de Nascimento:</strong> ${formatPlainText('Data de Nascimento', data.dataNascimento).replace(/<[^>]*>/g, '').replace('Data de Nascimento: ', '')}</p>
            <p><strong>Email:</strong> ${formatPlainText('Email', data.email).replace(/<[^>]*>/g, '').replace('Email: ', '')}</p>
            <p><strong>Telefone:</strong> ${data.telefone || 'N/A'}</p>

            <hr>
            <h2>Endereço</h2>
            <p><strong>CEP:</strong> ${formatPlainText('CEP', data.cep).replace(/<[^>]*>/g, '').replace('CEP: ', '')}</p>
            <p><strong>Endereço:</strong> ${data.endereco ? `${data.endereco}, ${data.numero}` : 'Não informado'} - ${data.complemento || ''} </p>
            <p><strong>Bairro:</strong> ${formatPlainText('Bairro', data.bairro).replace(/<[^>]*>/g, '').replace('Bairro: ', '')}</p>
            <p><strong>Cidade/Estado:</strong> ${data.cidade || 'Não informado'}/${data.estado || 'NI'}</p>
            
            <hr>
            <h2>Dados Profissionais</h2>
            <p><strong>Profissão:</strong> ${formatPlainText('Profissão', data.profissao).replace(/<[^>]*>/g, '').replace('Profissão: ', '')}</p>
            <p><strong>Renda Bruta:</strong> ${formatPrice(parseFloat(data.rendaBruta))}</p>
            <p><strong>Patrimônio:</strong> ${formatPrice(parseFloat(data.patrimonio))}</p>

            <hr>
            <h2>Simulação de Financiamento</h2>
            ${simulacaoHTML}

            <div class="print-button-container">
                <button id="printBtn" class="cta-button full-width">IMPRIMIR FICHA</button>
            </div>
        `;
        
        fichaImpressaoDiv.innerHTML = fichaHTML;

        document.getElementById('printBtn').addEventListener('click', () => {
            window.print();
        });
    }
});