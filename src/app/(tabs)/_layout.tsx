import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TabButton from '@/components/TabButton';
import { useI18n } from '@/i18n';
import { fonts, usePalette } from '@/theme';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

function icon(name: IconName) {
  return function TabIcon({ color }: { color: ColorValue }) {
    return <MaterialCommunityIcons name={name} size={24} color={color} />;
  };
}

export default function TabsLayout() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: palette.surfaceSunken },
        headerShadowVisible: false,
        headerTitleAlign: 'left',
        headerTitleStyle: {
          color: palette.ink,
          fontFamily: fonts.display,
          fontSize: 26,
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
        tabBarActiveTintColor: palette.ink,
        tabBarInactiveTintColor: palette.inkMuted,
        tabBarLabelStyle: {
          fontFamily: fonts.monoStrong,
          fontSize: 10,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
        },
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.ink,
          borderTopWidth: 1.5,
          height: 62 + insets.bottom,
          paddingBottom: insets.bottom,
          elevation: 0,
        },
        tabBarButton: (props) => <TabButton {...props} />,
        sceneStyle: { backgroundColor: palette.surfaceSunken },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: t.tabs.equipment, tabBarIcon: icon('clipboard-list-outline') }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: t.tabs.scan,
          headerShown: false,
          tabBarIcon: icon('qrcode-scan'),
          tabBarButton: (props) => <TabButton {...props} highlight />,
        }}
      />
      <Tabs.Screen
        name="sectors"
        options={{ title: t.sectors.title, tabBarIcon: icon('shape-outline') }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: t.tabs.settings, tabBarIcon: icon('cog-outline') }}
      />
    </Tabs>
  );
}
