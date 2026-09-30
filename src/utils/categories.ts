// Category is stored as plain text, because the equipment a school, a condo and
// a workshop own barely overlap and no fixed list would fit all of them. The
// form offers the common ones as presets and still accepts anything typed, so
// this matching has to keep working for both.
//
// Icons only, because categories deliberately get no colour of their own: red,
// amber and green already mean urgency, and a second colour dimension would
// compete with that.

export type IconName = React.ComponentProps<
  typeof import('@expo/vector-icons/MaterialCommunityIcons').default
>['name'];

const RULES: { match: string[]; icon: IconName }[] = [
  { match: ['extintor', 'extinguisher', 'fogo', 'fire'], icon: 'fire-extinguisher' },
  { match: ['ar-condicionado', 'ar condicionado', 'split', 'air condition'], icon: 'air-conditioner' },
  { match: ['gerador', 'generator', 'motor', 'engine'], icon: 'engine' },
  { match: ['bomba', 'pump', 'hidr'], icon: 'water-pump' },
  { match: ['elevador', 'elevator', 'lift'], icon: 'elevator-passenger' },
  { match: ['bebedouro', 'water cooler', 'purificador'], icon: 'water' },
  { match: ['computador', 'notebook', 'laptop', 'pc'], icon: 'laptop' },
  { match: ['impressora', 'printer'], icon: 'printer' },
  { match: ['laborat', 'lab', 'microsc'], icon: 'flask-outline' },
  { match: ['camera', 'câmera', 'cftv'], icon: 'cctv' },
  { match: ['portao', 'portão', 'gate'], icon: 'gate' },
  { match: ['alarme', 'alarm', 'sensor'], icon: 'bell-alert-outline' },
  { match: ['painel', 'eletric', 'elétric', 'electric', 'quadro'], icon: 'flash-outline' },
  { match: ['veic', 'carro', 'van', 'vehicle', 'truck'], icon: 'truck-outline' },
];

export function categoryIcon(category: string | null | undefined): IconName {
  if (!category) return 'cog-outline';
  const text = category.toLowerCase();
  const rule = RULES.find((candidate) => candidate.match.some((word) => text.includes(word)));
  return rule?.icon ?? 'cog-outline';
}

export type CategoryPresetKey =
  | 'extinguisher'
  | 'airConditioner'
  | 'generator'
  | 'pump'
  | 'elevator'
  | 'waterCooler'
  | 'electricalPanel'
  | 'camera';

// The presets offered in the form. Each one's translated label is written so it
// matches a rule above, which is what guarantees a preset always lands on its
// own icon instead of the generic cog.
export const CATEGORY_PRESETS: { key: CategoryPresetKey; icon: IconName }[] = [
  { key: 'extinguisher', icon: 'fire-extinguisher' },
  { key: 'airConditioner', icon: 'air-conditioner' },
  { key: 'generator', icon: 'engine' },
  { key: 'pump', icon: 'water-pump' },
  { key: 'elevator', icon: 'elevator-passenger' },
  { key: 'waterCooler', icon: 'water' },
  { key: 'electricalPanel', icon: 'flash-outline' },
  { key: 'camera', icon: 'cctv' },
];
