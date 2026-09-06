// Category is free text, so it is matched loosely against known equipment
// words and falls back to a generic cog. Icons only — categories deliberately
// get no colour of their own, because red/amber/green already mean urgency and
// a second colour dimension would compete with it.

type IconName = React.ComponentProps<
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
  { match: ['painel', 'eletric', 'elétric', 'quadro'], icon: 'flash-outline' },
  { match: ['veic', 'carro', 'van', 'vehicle', 'truck'], icon: 'truck-outline' },
];

export function categoryIcon(category: string | null | undefined): IconName {
  if (!category) return 'cog-outline';
  const text = category.toLowerCase();
  const rule = RULES.find((candidate) => candidate.match.some((word) => text.includes(word)));
  return rule?.icon ?? 'cog-outline';
}
