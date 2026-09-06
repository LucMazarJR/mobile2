import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, spacing, tabular, type } from '@/theme';

type BadgeProps = {
  label: string;
  color: string;
  background: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  style?: StyleProp<ViewStyle>;
};

// Fully rounded on purpose: it reads as an inspection sticker rather than a
// generic box.
export default function Badge({ label, color, background, icon, style }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: background }, style]}>
      {icon ? <MaterialCommunityIcons name={icon} size={12} color={color} /> : null}
      <Text style={[type.micro, tabular, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
});
