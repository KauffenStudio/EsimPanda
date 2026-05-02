export const TERMS_EFFECTIVE_DATE_PT = '2 de maio de 2026';

export function TermsPT() {
  return (
    <article className="space-y-6 leading-relaxed">
      <header className="border-b border-border dark:border-border-dark pb-6 mb-2">
        <h1 className="text-3xl font-bold mb-2">Termos e Condições</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Última atualização: {TERMS_EFFECTIVE_DATE_PT}
        </p>
      </header>

      <p>
        Estes Termos e Condições (&quot;Termos&quot;) regulam o seu acesso e utilização do eSIM Panda — o site
        em <span className="underline">esimpanda.co</span> e quaisquer serviços relacionados (o
        &quot;Serviço&quot;), operado pela Kauffen Studio (&quot;nós&quot;), empresário em nome individual estabelecido
        em Portugal. Ao criar uma conta ou efetuar uma encomenda, declara aceitar estes Termos.
      </p>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">1. O Serviço</h2>
        <p>
          O eSIM Panda comercializa planos digitais de dados eSIM para viagens internacionais. Após a
          compra, fornecemos um perfil eSIM através do nosso parceiro de rede e entregamos os dados de
          ativação (código QR ou códigos de ativação manual) por email e na sua conta no Serviço. O
          acesso à internet utilizando o seu eSIM é prestado pelos operadores móveis subjacentes em
          cada país de destino.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">2. Elegibilidade</h2>
        <p>
          Tem de ter pelo menos 18 anos de idade, ou a maioridade no seu país, para utilizar o Serviço
          e adquirir planos eSIM. Ao utilizar o Serviço, declara cumprir este requisito.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">3. A sua conta</h2>
        <p>
          Pode utilizar o Serviço como convidado em compras pontuais ou criar uma conta. É responsável
          pela confidencialidade das suas credenciais e por toda a atividade efetuada na sua conta.
          Notifique-nos de imediato para{' '}
          <a href="mailto:geral@kauffen.com" className="text-accent hover:underline">
            geral@kauffen.com
          </a>{' '}
          caso suspeite de acesso não autorizado.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">4. Preços e pagamento</h2>
        <p>
          Todos os preços são apresentados na página do produto, na moeda indicada no checkout. Os
          preços incluem os impostos aplicáveis, salvo indicação em contrário. O pagamento é processado
          pela Stripe; nunca vemos nem armazenamos os dados completos do seu cartão. Após confirmação
          do pagamento, iniciamos imediatamente o aprovisionamento do seu eSIM.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">5. Encomenda, entrega e ativação</h2>
        <p>
          A entrega do eSIM é eletrónica. Após o pagamento bem-sucedido, receberá os seus dados de
          ativação por email e na sua conta, normalmente em poucos minutos. O período de validade do
          plano inicia-se quando ativar o eSIM num dispositivo compatível, salvo indicação em
          contrário na página do produto. É da sua responsabilidade confirmar previamente que o seu
          dispositivo suporta eSIM e que o destino está coberto.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">6. Política de reembolso e cancelamento</h2>
        <p>
          Uma vez que os planos eSIM são produtos digitais cuja execução se inicia logo após o
          aprovisionamento, e nos termos do artigo 17.º do Decreto-Lei n.º 24/2014 (que transpõe a
          Diretiva 2011/83/UE relativa aos direitos dos consumidores), o direito de livre resolução de
          14 dias não se aplica após a entrega do eSIM, desde que tenha consentido expressamente, no
          checkout, na execução imediata do serviço (renunciando ao prazo de reflexão).
        </p>
        <p className="mt-3">Em concreto:</p>
        <ul className="list-disc pl-6 mt-2 space-y-2">
          <li>
            <strong>Antes da entrega</strong> (ainda não gerámos o seu eSIM): pode cancelar por
            qualquer motivo e receber o reembolso integral.
          </li>
          <li>
            <strong>Após a entrega, antes da ativação:</strong> o reembolso fica ao nosso critério e
            poderá ser concedido após dedução de uma pequena taxa administrativa, sujeito às políticas
            do nosso parceiro de rede.
          </li>
          <li>
            <strong>Após a ativação:</strong> o serviço digital foi consumido e não é reembolsável.
          </li>
          <li>
            <strong>Falha do serviço:</strong> se o seu eSIM não funcionar por motivo imputável a nós
            ou ao nosso parceiro de rede, contacte-nos. Investigaremos e, quando apropriado, emitiremos
            um reembolso parcial ou total ou substituiremos o plano.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">7. Disponibilidade e limitações do Serviço</h2>
        <p>
          A cobertura móvel, as velocidades e a intensidade do sinal dependem do operador local e das
          condições do local, terreno e dispositivo. Não garantimos um serviço ininterrupto e não somos
          responsáveis pelo desempenho das redes subjacentes. Alguns destinos podem restringir
          determinados tipos de tráfego (por exemplo, VoIP, partilha de internet) e, sempre que
          possível, indicaremos as restrições conhecidas na página do produto.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">8. Utilização aceitável</h2>
        <p>O cliente compromete-se a não utilizar o Serviço para:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Praticar fraude, branqueamento de capitais ou qualquer atividade ilegal</li>
          <li>Revender planos eSIM sem a nossa autorização escrita</li>
          <li>Interferir com a integridade ou segurança do Serviço</li>
          <li>Enviar spam, malware ou abusar de outra forma da rede</li>
          <li>Violar a legislação do país de destino aplicável às comunicações móveis</li>
        </ul>
        <p className="mt-3">
          Podemos suspender ou cancelar contas e encomendas quando razoavelmente suspeitemos da
          violação destas regras, sendo o reembolso da parte não utilizada e não ativada concedido a
          nosso critério.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">9. Propriedade intelectual</h2>
        <p>
          O Serviço, incluindo a sua marca, logótipos, design e software, é propriedade da Kauffen
          Studio ou dos seus licenciantes. Concedemos-lhe uma licença limitada, não exclusiva e não
          transferível para utilizar o Serviço para fins pessoais. Não pode copiar, modificar nem
          redistribuir qualquer parte do Serviço sem o nosso consentimento prévio escrito.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">10. Garantias e limitação de responsabilidade</h2>
        <p>
          O Serviço é prestado &quot;tal como está&quot; e &quot;conforme disponível&quot;. Na medida máxima permitida
          pela lei, excluímos todas as garantias implícitas. Nada nestes Termos limita ou exclui a
          responsabilidade que não possa ser limitada ou excluída ao abrigo da lei aplicável (incluindo
          responsabilidade por morte, danos pessoais causados por negligência, dolo ou direitos de
          consumidor irrenunciáveis).
        </p>
        <p className="mt-3">
          Sem prejuízo do anterior, a nossa responsabilidade total agregada por qualquer reclamação
          relacionada com o Serviço fica limitada ao valor que nos pagou nos doze (12) meses anteriores
          ao facto que originou a reclamação.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">11. Cessação</h2>
        <p>
          Pode deixar de utilizar o Serviço e encerrar a sua conta a qualquer momento. Podemos
          suspender ou cessar o seu acesso em caso de incumprimento destes Termos. As disposições que
          pela sua natureza devam subsistir após a cessação — incluindo as regras de reembolso para
          serviços já prestados, propriedade intelectual e limitações de responsabilidade — manter-se-ão
          em vigor.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">12. Lei aplicável e resolução de litígios</h2>
        <p>
          Estes Termos regem-se pela lei portuguesa. Enquanto consumidor, beneficia também das
          proteções imperativas em vigor no seu país de residência. Para litígios de consumo, pode
          recorrer à plataforma europeia de Resolução de Litígios em Linha em{' '}
          <a href="https://ec.europa.eu/consumers/odr" className="underline">
            ec.europa.eu/consumers/odr
          </a>{' '}
          ou contactar um centro de arbitragem de consumo português, como o CNIACC (
          <a href="https://www.cniacc.pt" className="underline">www.cniacc.pt</a>).
        </p>
        <p className="mt-3">
          Para qualquer outro litígio, são competentes os tribunais portugueses, com competência não
          exclusiva, sem prejuízo das normas imperativas de proteção do consumidor que lhe confiram
          direitos adicionais.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">13. Alterações a estes Termos</h2>
        <p>
          Podemos atualizar periodicamente estes Termos. A data de &quot;Última atualização&quot; no topo desta
          página reflete a alteração mais recente. Em caso de alterações materiais que afetem os seus
          direitos, notificá-lo-emos por email ou através de aviso no Serviço antes de essas
          alterações produzirem efeitos. A continuação da utilização do Serviço após a alteração
          significa a aceitação dos Termos atualizados.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6 mb-3">14. Contacto</h2>
        <p>
          Para qualquer questão sobre estes Termos, contacte-nos para:{' '}
          <a href="mailto:geral@kauffen.com" className="text-accent hover:underline">
            geral@kauffen.com
          </a>
          .
        </p>
      </section>
    </article>
  );
}
