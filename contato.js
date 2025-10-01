document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');

    // Função auxiliar para formatação em TEXTO PURO
    const formatPlainText = (label, value) => {
        const val = value ? String(value).trim() : '';
        const displayValue = val || 'Não informado';
        return `${label}: ${displayValue}\n`;
    };

    // Configurações e lógica de envio de e-mail com EmailJS
    // OBS: O TEMPLATE ID AQUI DEVE SER O MESMO QUE FUNCIONA NA FICHA CADASTRAL!
    const serviceId = 'service_w9680wn'; 
    const templateId = 'template_uh4fd6q'; 
    const publicKey = 'ECjTNMoHjUJ25-3dq'; 

    // Inicializa o EmailJS 
    emailjs.init(publicKey);

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Coletar todos os dados do formulário
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // 2. Montar o corpo completo do e-mail em TEXTO PURO (limpo de tags)
        const emailBodyPlainText = `
=============================================
NOVO CONTATO SOLICITADO
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

        // 3. Preparar os parâmetros do e-mail
        const templateParams = {
            nomeCliente: data.nomeCompleto,
            // O campo 'telefoneCliente' foi removido
            to_email: 'lucianotrindade.ti@gmail.com', // E-mail de destino
            text_message: emailBodyPlainText,
            // VARIÁVEL DE PLACEHOLDER: Mantemos esta linha para satisfazer a exigência do seu Template de E-mail
            carroProposto: 'Formulário de Contato'
        };

        // 4. Enviar o e-mail usando o EmailJS
        emailjs.send(serviceId, templateId, templateParams)
            .then(() => {
                alert('Sua mensagem foi enviada com sucesso! Entraremos em contato.');
                contactForm.reset();
                successMessage.classList.remove('hidden');
                setTimeout(() => successMessage.classList.add('hidden'), 5000);
            })
            .catch((error) => {
                console.error('Erro ao enviar e-mail:', error);
                alert('Ocorreu um erro ao enviar a mensagem. Verifique o console do navegador para detalhes.');
            });
    });
});