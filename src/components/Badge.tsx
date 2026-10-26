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

// A stamp: square corners, hairline in the status colour, mono capitals.
export default function Badge({ label, color, background, icon, style }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: background, borderColor: color }, style]}>
      {icon ? <MaterialCommunityIcons name={icon} size={12} color={color} /> : null}
      <Text style={[type.micro, tabular, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
});
