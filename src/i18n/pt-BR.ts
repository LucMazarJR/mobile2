// Source of truth for every user-visible string.
//
// Voice rules:
//  1. Talk about the work, not the system. No "sync", "Supabase", "database",
//     "record", "row", ".env", "device", "server" anywhere in here.
//  2. The concept is "saved here + automatic cloud copy". Never "sync".
//  3. On failure the app takes the blame and states the next action.
//  4. Buttons are verbs naming what will happen.

export const ptBR = {
  common: {
    cancel: 'Cancelar',
    save: 'Salvar',
    delete: 'Apagar',
    edit: 'Editar',
    retry: 'Tentar de novo',
    close: 'Fechar',
    none: '-',
  },

  nav: {
    home: 'Equipamentos',
    newEquipment: 'Novo equipamento',
    editEquipment: 'Editar equipamento',
    equipment: 'Ficha do equipamento',
    newMaintenance: 'Nova manutenção',
    editMaintenance: 'Editar manutenção',
    about: 'Sobre o app',
  },

  home: {
    searchPlaceholder: 'Buscar por nome, tipo ou local',
    filterAll: 'Todos',
    filterOverdue: 'Atrasados',
    filterDueSoon: 'Vence logo',
    filterOnTrack: 'Em dia',
    newEquipment: 'Novo equipamento',
    emptyTitle: 'Comece cadastrando um equipamento',
    emptyBody:
      'Um extintor, um ar-condicionado, um gerador: o que você precisa lembrar de revisar.',
    emptyAction: 'Cadastrar equipamento',
    noResultsTitle: 'Nada por aqui',
    noResultsBody: 'Nenhum equipamento encontrado com esse filtro ou essa busca.',
  },

  card: {
    noLocation: 'Sem local definido',
    neverServiced: 'Nunca recebeu manutenção',
    last: (date: string) => `Última: ${date}`,
    savedHereOnly: 'Salvo só aqui',
  },

  equipmentForm: {
    intro: 'Salva na hora, mesmo sem internet. A cópia na nuvem sobe sozinha depois.',
    name: 'Nome do equipamento',
    namePlaceholder: 'Ex.: Extintor do corredor B',
    nameError: 'Dê um nome para conseguir achar depois.',
    category: 'Tipo',
    categoryPlaceholder: 'Ex.: Extintor, Ar-condicionado, Gerador',
    location: 'Onde fica',
    locationPlaceholder: 'Ex.: Bloco A, 2º andar',
    interval: 'Revisar a cada quantos dias',
    intervalHint: 'É assim que o app avisa quando a revisão está chegando.',
    intervalError: 'Informe quantos dias, por exemplo 30.',
    saveNew: 'Salvar equipamento',
    saveEdit: 'Salvar alterações',
  },

  detail: {
    category: 'Tipo',
    location: 'Onde fica',
    interval: 'Revisão',
    everyNDays: (days: number) => `A cada ${days} dias`,
    lastMaintenance: 'Última manutenção',
    nextMaintenance: 'Próxima revisão',
    totalDone: 'Manutenções feitas',
    tagCode: 'Código da etiqueta',
    logMaintenance: 'Registrar manutenção',
    history: 'Histórico de manutenção',
    historyEmptyTitle: 'Nenhuma manutenção registrada',
    historyEmptyBody:
      'Toda manutenção que você registrar fica guardada aqui, da mais recente para a mais antiga.',
    deleteEquipment: 'Apagar equipamento',
    notFoundTitle: 'Este equipamento não está mais aqui',
    notFoundBody: 'Ele pode ter sido apagado.',
    deleteTitle: (name: string) => `Apagar ${name}?`,
    deleteBody:
      'Todo o histórico de manutenção dele vai junto, aqui e na cópia da nuvem. Não dá para desfazer.',
  },

  maintenance: {
    preventive: 'Preventiva',
    preventiveHint: 'Revisão de rotina',
    corrective: 'Corretiva',
    correctiveHint: 'Conserto de um problema',
    whatWasDone: 'O que foi feito',
    when: 'Quando foi feita',
    today: 'Hoje',
    yesterday: 'Ontem',
    datePlaceholder: 'dia/mês/ano',
    dateError: 'Data inválida. Use dia/mês/ano.',
    dateFutureError: 'Não dá para anotar uma manutenção com data futura.',
    description: 'O que foi feito no equipamento',
    descriptionPlaceholder: 'Ex.: Troca de filtro e limpeza do sistema',
    technician: 'Quem fez',
    technicianPlaceholder: 'Nome de quem executou',
    noTechnician: 'Sem responsável anotado',
    saveNew: 'Salvar manutenção',
    saveEdit: 'Salvar alterações',
    deleteTitle: 'Apagar esta manutenção?',
    deleteBody: 'Ela sai do histórico aqui e na cópia da nuvem. Não dá para desfazer.',
  },

  status: {
    overdueChip: (days: number) => `Atrasado ${days}d`,
    overdueFull: (days: number) => `${days} ${days === 1 ? 'dia' : 'dias'} de atraso`,
    dueTodayChip: 'Vence hoje',
    dueTodayFull: 'Precisa de revisão hoje',
    dueSoonChip: (days: number) => `Vence em ${days}d`,
    dueSoonFull: (days: number) => `Vence em ${days} ${days === 1 ? 'dia' : 'dias'}`,
    onTrackChip: 'Em dia',
    onTrackFull: (days: number) => `Próxima revisão em ${days} dias`,
  },

  backup: {
    allSaved: 'Tudo com cópia na nuvem',
    allSavedAt: (time: string) => `Última cópia às ${time}`,
    sending: 'Enviando cópia...',
    pendingTitle: (equipment: number, maintenance: number) => {
      const parts: string[] = [];
      if (equipment > 0) {
        parts.push(`${equipment} ${equipment === 1 ? 'equipamento' : 'equipamentos'}`);
      }
      if (maintenance > 0) {
        parts.push(`${maintenance} ${maintenance === 1 ? 'manutenção' : 'manutenções'}`);
      }
      return `${parts.join(' e ')} sem cópia`;
    },
    sendNow: 'Enviar agora',
    offlineTitle: 'Sem internet agora',
    offlineBody: 'A cópia sobe sozinha quando conectar.',
    failedTitle: 'Não deu para enviar a cópia agora',
    failedBody: 'Nada foi perdido. Vamos tentar de novo sozinho.',
    disabledTitle: 'Cópia na nuvem desligada',
    disabledBody: 'Tudo continua salvo aqui no celular.',
    learnMore: 'Saiba mais',
  },

  about: {
    howItWorksTitle: 'Como seus dados ficam guardados',
    howItWorksBody:
      'Tudo que você registra é salvo na hora aqui no celular, mesmo sem internet. Quando houver conexão, uma cópia sobe para a nuvem automaticamente, assim nada se perde se o aparelho for trocado.',
    statusTitle: 'Cópia na nuvem',
    sendNow: 'Enviar agora',
    fetchFromCloud: 'Buscar da nuvem',
    fetched: (count: number) =>
      count === 0
        ? 'Nada novo para trazer.'
        : `${count} ${count === 1 ? 'item trazido' : 'itens trazidos'} da nuvem.`,
    languageTitle: 'Idioma',
    technicalTitle: 'Detalhes técnicos',
    technicalShow: 'Mostrar',
    technicalHide: 'Esconder',
    techCloud: 'Servidor',
    techCloudOff: 'não configurado',
    techLocalDb: 'Banco local',
    techVersion: 'Versão',
    techPending: 'Aguardando envio',
    techLastError: 'Último erro',
    techNoError: 'nenhum',
  },

  errors: {
    saveTitle: 'Não deu para salvar',
    saveBody: 'Tente de novo. Se continuar, feche e abra o app.',
    deleteTitle: 'Não deu para apagar',
    deleteBody: 'Tente de novo. Se continuar, feche e abra o app.',
  },
};

export type Dictionary = typeof ptBR;
