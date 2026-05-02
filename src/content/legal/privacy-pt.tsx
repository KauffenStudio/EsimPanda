export const PRIVACY_EFFECTIVE_DATE_PT = '2 de maio de 2026';

export function PrivacyPT() {
  return (
    <article className="space-y-6 leading-relaxed">
      <header className="border-b border-border dark:border-border-dark pb-6 mb-2">
        <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Última atualização: {PRIVACY_EFFECTIVE_DATE_PT}
        </p>
      </header>

      <p>
        Esta Política de Privacidade explica como a Kauffen Studio (&quot;nós&quot;) recolhe, utiliza e protege
        os seus dados pessoais quando utiliza o eSIM Panda — o site em{' '}
        <span className="underline">esimpanda.co</span> e quaisquer serviços relacionados (o &quot;Serviço&quot;).
        Estamos comprometidos em proteger a sua privacidade e em cumprir o Regulamento Geral sobre a
        Proteção de Dados (RGPD), a Lei n.º 58/2019 e demais legislação aplicável.
      </p>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">1. Quem somos</h2>
        <p>
          O responsável pelo tratamento dos seus dados pessoais é:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Kauffen Studio (empresário em nome individual)</li>
          <li>Estabelecido em Portugal</li>
          <li>Contacto: <a href="mailto:geral@kauffen.com" className="text-accent hover:underline">geral@kauffen.com</a></li>
        </ul>
        <p className="mt-3">
          Pode contactar-nos a qualquer momento através do email acima para qualquer questão ou pedido
          relacionado com privacidade.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">2. Dados que recolhemos</h2>
        <p>Recolhemos as seguintes categorias de dados pessoais:</p>
        <ul className="list-disc pl-6 mt-2 space-y-2">
          <li>
            <strong>Dados de conta:</strong> endereço de email, palavra-passe (em formato encriptado;
            nunca vemos a sua palavra-passe em texto simples) e, caso utilize o início de sessão com
            Google, o endereço da sua conta Google e informação básica de perfil.
          </li>
          <li>
            <strong>Dados de encomenda:</strong> os planos eSIM que adquire, países de destino, datas,
            preços e números de referência.
          </li>
          <li>
            <strong>Dados de pagamento:</strong> processados integralmente pela Stripe. Nunca armazenamos
            o número completo do seu cartão. Recebemos apenas um identificador (token), os últimos
            quatro dígitos e a marca do cartão para apresentar no histórico de encomendas.
          </li>
          <li>
            <strong>Dados técnicos do eSIM:</strong> ICCID, código de ativação e estatísticas de
            utilização fornecidas pelo nosso operador de rede Celitech, utilizados para fornecer o plano
            de dados que comprou.
          </li>
          <li>
            <strong>Comunicações:</strong> emails que nos envia e as nossas respostas (para apoio ao
            cliente e resolução de litígios).
          </li>
          <li>
            <strong>Dados técnicos:</strong> endereço IP, tipo de navegador, tipo de dispositivo,
            preferência de idioma e eventos básicos de interação necessários para operar, proteger e
            melhorar o Serviço.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">3. Como utilizamos os seus dados e fundamentos jurídicos</h2>
        <p>Utilizamos os seus dados pessoais apenas para as finalidades descritas abaixo:</p>
        <ul className="list-disc pl-6 mt-2 space-y-2">
          <li>
            <strong>Para prestar o Serviço</strong> (entregar o seu eSIM, processar pagamentos, gerir a
            sua conta). Fundamento: execução de um contrato (art. 6.º, n.º 1, alínea b) do RGPD).
          </li>
          <li>
            <strong>Para cumprir obrigações legais</strong> (emitir faturas, conservar registos
            contabilísticos, responder a pedidos legais). Fundamento: obrigação jurídica (art. 6.º,
            n.º 1, alínea c) do RGPD).
          </li>
          <li>
            <strong>Para proteger e melhorar o Serviço</strong> (prevenir fraude, detetar erros,
            analisar desempenho). Fundamento: interesse legítimo (art. 6.º, n.º 1, alínea f) do RGPD).
          </li>
          <li>
            <strong>Para enviar emails de serviço</strong> (confirmação de encomenda, entrega do eSIM,
            respostas de apoio, redefinição de palavra-passe). Fundamento: execução de um contrato.
          </li>
          <li>
            <strong>Para enviar mensagens de marketing</strong>, apenas se nos der o seu consentimento
            expresso. Fundamento: consentimento (art. 6.º, n.º 1, alínea a) do RGPD). Pode retirar o
            consentimento a qualquer momento.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">4. Subcontratantes com quem partilhamos dados</h2>
        <p>
          Recorremos a um pequeno conjunto de prestadores de serviços de confiança (subcontratantes)
          para operar o Serviço. Estes tratam os seus dados apenas com base nas nossas instruções e ao
          abrigo de acordos escritos que cumprem os requisitos do RGPD:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-2">
          <li>
            <strong>Supabase</strong> — autenticação e alojamento da base de dados (regiões UE e EUA).
          </li>
          <li>
            <strong>Stripe</strong> — processamento de pagamentos (EUA/UE).
          </li>
          <li>
            <strong>Celitech</strong> — fornecimento e conectividade de eSIM (EUA/UE).
          </li>
          <li>
            <strong>Resend</strong> — envio de emails transacionais (EUA/UE).
          </li>
          <li>
            <strong>Vercel</strong> — alojamento do site e da aplicação (edge global).
          </li>
          <li>
            <strong>Google</strong> — quando opta por iniciar sessão com a sua conta Google, a Google
            recebe um pedido de início de sessão limitado ao seu email e informação básica de perfil.
          </li>
        </ul>
        <p className="mt-3">
          Não vendemos os seus dados pessoais a ninguém, nem os partilhamos com terceiros para fins de
          marketing próprio.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">5. Transferências internacionais de dados</h2>
        <p>
          Alguns dos nossos subcontratantes estão localizados fora do Espaço Económico Europeu (EEE),
          em particular nos Estados Unidos. Quando os dados pessoais são transferidos para fora do EEE,
          baseamo-nos nas Cláusulas Contratuais Tipo (CCT) da Comissão Europeia ou, quando aplicável,
          em decisões de adequação. Cópias das salvaguardas relevantes estão disponíveis a pedido.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">6. Cookies e tecnologias semelhantes</h2>
        <p>
          Utilizamos apenas cookies e armazenamento local estritamente necessários ao funcionamento do
          Serviço — por exemplo, para o manter com sessão iniciada, recordar a sua preferência de
          idioma e manter o seu carrinho de compras. Não utilizamos cookies publicitários. Se vierem a
          ser introduzidos cookies analíticos opcionais, solicitaremos previamente o seu consentimento
          através de um aviso claro.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">7. Por quanto tempo conservamos os seus dados</h2>
        <ul className="list-disc pl-6 mt-2 space-y-2">
          <li>
            <strong>Dados de conta:</strong> conservados enquanto a sua conta estiver ativa. Se eliminar
            a conta, eliminamos ou anonimizamos os dados num prazo de 30 dias, salvo quando a
            conservação seja exigida por lei.
          </li>
          <li>
            <strong>Dados de encomendas e faturas:</strong> conservados durante 10 anos a contar do ano
            da transação, conforme exigido pela legislação fiscal portuguesa.
          </li>
          <li>
            <strong>Comunicações de apoio:</strong> conservadas até 3 anos após a última interação.
          </li>
          <li>
            <strong>Registos técnicos:</strong> conservados até 12 meses para fins de segurança e
            depuração.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">8. Os seus direitos</h2>
        <p>Ao abrigo do RGPD, tem direito a:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Aceder aos dados pessoais que detemos sobre si</li>
          <li>Solicitar a retificação de dados inexatos</li>
          <li>Solicitar o apagamento dos seus dados (direito ao esquecimento)</li>
          <li>Solicitar a limitação ou opor-se a determinados tratamentos</li>
          <li>Receber os seus dados em formato portável</li>
          <li>Retirar o consentimento a qualquer momento, quando o tratamento se baseie em consentimento</li>
          <li>
            Apresentar reclamação à autoridade de controlo portuguesa (Comissão Nacional de Proteção de
            Dados — CNPD, <a href="https://www.cnpd.pt" className="underline">www.cnpd.pt</a>) ou à
            autoridade do seu país de residência.
          </li>
        </ul>
        <p className="mt-3">
          Para exercer qualquer destes direitos, contacte-nos para{' '}
          <a href="mailto:geral@kauffen.com" className="text-accent hover:underline">
            geral@kauffen.com
          </a>
          . Responderemos no prazo máximo de 30 dias.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">9. Privacidade de menores</h2>
        <p>
          O Serviço não se destina a pessoas com idade inferior a 16 anos. Não recolhemos
          intencionalmente dados pessoais de crianças. Se considerar que uma criança nos forneceu dados
          pessoais, contacte-nos e procederemos à sua eliminação.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">10. Segurança</h2>
        <p>
          Adotamos medidas técnicas e organizativas razoáveis para proteger os seus dados — incluindo
          ligações encriptadas (HTTPS), palavras-passe em formato hash, acesso restrito e o recurso a
          subcontratantes reputados. Nenhum sistema é perfeitamente seguro; se tomarmos conhecimento de
          uma violação de dados pessoais que o afete, notificá-lo-emos a si e às autoridades
          competentes nos termos exigidos por lei.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">11. Alterações a esta política</h2>
        <p>
          Podemos atualizar periodicamente esta Política de Privacidade. A data de &quot;Última
          atualização&quot; no topo desta página reflete a alteração mais recente. Em caso de alterações
          materiais, notificá-lo-emos por email ou através de aviso na aplicação antes de essas
          alterações produzirem efeitos.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">12. Contacto</h2>
        <p>
          Para qualquer questão sobre privacidade ou para exercer os seus direitos, contacte-nos para:{' '}
          <a href="mailto:geral@kauffen.com" className="text-accent hover:underline">
            geral@kauffen.com
          </a>
          .
        </p>
      </section>
    </article>
  );
}
