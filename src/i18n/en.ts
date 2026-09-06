import type { Dictionary } from '@/i18n/pt-BR';

// Typed as Dictionary so TypeScript flags any key that goes missing here when
// a new string is added to the Portuguese source.
export const en: Dictionary = {
  common: {
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    retry: 'Try again',
    close: 'Close',
    none: '-',
  },

  nav: {
    home: 'Equipment',
    newEquipment: 'New equipment',
    editEquipment: 'Edit equipment',
    equipment: 'Equipment details',
    newMaintenance: 'New service',
    editMaintenance: 'Edit service',
    about: 'About this app',
  },

  home: {
    searchPlaceholder: 'Search by name, type or place',
    filterAll: 'All',
    filterOverdue: 'Overdue',
    filterDueSoon: 'Due soon',
    filterOnTrack: 'On track',
    newEquipment: 'New equipment',
    emptyTitle: 'Start by adding equipment',
    emptyBody: 'A fire extinguisher, an air conditioner, a generator: whatever you must remember to service.',
    emptyAction: 'Add equipment',
    noResultsTitle: 'Nothing here',
    noResultsBody: 'No equipment matches this filter or search.',
  },

  card: {
    noLocation: 'No place set',
    neverServiced: 'Never serviced',
    last: (date: string) => `Last: ${date}`,
    savedHereOnly: 'Saved here only',
  },

  equipmentForm: {
    intro: 'Saved right away, even with no internet. The cloud copy uploads on its own later.',
    name: 'Equipment name',
    namePlaceholder: 'e.g. Fire extinguisher, hallway B',
    nameError: 'Give it a name so you can find it later.',
    category: 'Type',
    categoryPlaceholder: 'e.g. Extinguisher, Air conditioner, Generator',
    location: 'Where it is',
    locationPlaceholder: 'e.g. Building A, 2nd floor',
    interval: 'Service every how many days',
    intervalHint: 'This is how the app knows when a service is coming up.',
    intervalError: 'Enter a number of days, for example 30.',
    saveNew: 'Save equipment',
    saveEdit: 'Save changes',
  },

  detail: {
    category: 'Type',
    location: 'Where it is',
    interval: 'Service',
    everyNDays: (days: number) => `Every ${days} days`,
    lastMaintenance: 'Last service',
    nextMaintenance: 'Next service',
    totalDone: 'Services done',
    tagCode: 'Tag code',
    logMaintenance: 'Log a service',
    history: 'Service history',
    historyEmptyTitle: 'No service logged yet',
    historyEmptyBody: 'Every service you log is kept here, newest first.',
    deleteEquipment: 'Delete equipment',
    notFoundTitle: 'This equipment is no longer here',
    notFoundBody: 'It may have been deleted.',
    deleteTitle: (name: string) => `Delete ${name}?`,
    deleteBody:
      'Its whole service history goes with it, here and in the cloud copy. This cannot be undone.',
  },

  maintenance: {
    preventive: 'Preventive',
    preventiveHint: 'Routine service',
    corrective: 'Corrective',
    correctiveHint: 'Fixing a problem',
    whatWasDone: 'What was done',
    when: 'When it was done',
    today: 'Today',
    yesterday: 'Yesterday',
    datePlaceholder: 'day/month/year',
    dateError: 'Invalid date. Use day/month/year.',
    dateFutureError: 'A service cannot be logged with a future date.',
    description: 'What was done to the equipment',
    descriptionPlaceholder: 'e.g. Filter replaced and system cleaned',
    technician: 'Who did it',
    technicianPlaceholder: 'Name of whoever carried it out',
    noTechnician: 'No one noted down',
    saveNew: 'Save service',
    saveEdit: 'Save changes',
    deleteTitle: 'Delete this service?',
    deleteBody: 'It leaves the history here and in the cloud copy. This cannot be undone.',
  },

  status: {
    overdueChip: (days: number) => `${days}d overdue`,
    overdueFull: (days: number) => `${days} ${days === 1 ? 'day' : 'days'} overdue`,
    dueTodayChip: 'Due today',
    dueTodayFull: 'Needs service today',
    dueSoonChip: (days: number) => `Due in ${days}d`,
    dueSoonFull: (days: number) => `Due in ${days} ${days === 1 ? 'day' : 'days'}`,
    onTrackChip: 'On track',
    onTrackFull: (days: number) => `Next service in ${days} days`,
  },

  backup: {
    allSaved: 'Everything copied to the cloud',
    allSavedAt: (time: string) => `Last copy at ${time}`,
    sending: 'Uploading copy...',
    pendingTitle: (equipment: number, maintenance: number) => {
      const parts: string[] = [];
      if (equipment > 0) {
        parts.push(`${equipment} ${equipment === 1 ? 'equipment item' : 'equipment items'}`);
      }
      if (maintenance > 0) {
        parts.push(`${maintenance} ${maintenance === 1 ? 'service' : 'services'}`);
      }
      return `${parts.join(' and ')} not copied yet`;
    },
    sendNow: 'Upload now',
    offlineTitle: 'No internet right now',
    offlineBody: 'The copy uploads on its own once you reconnect.',
    failedTitle: 'The copy could not be uploaded',
    failedBody: 'Nothing was lost. We will try again on our own.',
    disabledTitle: 'Cloud copy is off',
    disabledBody: 'Everything is still saved here on the phone.',
    learnMore: 'Learn more',
  },

  about: {
    howItWorksTitle: 'How your data is kept',
    howItWorksBody:
      'Everything you enter is saved right here on the phone, even with no internet. Once you are connected, a copy uploads to the cloud automatically, so nothing is lost if the phone is replaced.',
    statusTitle: 'Cloud copy',
    sendNow: 'Upload now',
    fetchFromCloud: 'Fetch from cloud',
    fetched: (count: number) =>
      count === 0
        ? 'Nothing new to bring over.'
        : `${count} ${count === 1 ? 'item' : 'items'} brought from the cloud.`,
    languageTitle: 'Language',
    technicalTitle: 'Technical details',
    technicalShow: 'Show',
    technicalHide: 'Hide',
    techCloud: 'Server',
    techCloudOff: 'not configured',
    techLocalDb: 'Local database',
    techVersion: 'Version',
    techPending: 'Waiting to upload',
    techLastError: 'Last error',
    techNoError: 'none',
  },

  errors: {
    saveTitle: 'Could not save',
    saveBody: 'Try again. If it keeps happening, close and reopen the app.',
    deleteTitle: 'Could not delete',
    deleteBody: 'Try again. If it keeps happening, close and reopen the app.',
  },
};
