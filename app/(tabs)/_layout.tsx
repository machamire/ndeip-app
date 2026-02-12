import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View, Image, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Spacing, Radii, Shadows, Typography } from '@/constants/ndeipBrandSystem';

function TabIcon({ name, color, size = 22 }: { name: string; color: string; size?: number }) {
  const iconMap: Record<string, React.ComponentProps<typeof FontAwesome>['name']> = {
    villages: 'home',
    stories: 'circle-o',
    chats: 'comments',
    calls: 'phone',
    settings: 'cog',
  };
  return <FontAwesome name={iconMap[name] || 'circle'} size={size} color={color} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? NDEIP_COLORS.gray[600] : NDEIP_COLORS.gray[300],
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 20 : 16,
          left: 16,
          right: 16,
          height: Spacing.components.tabBarHeight,
          borderRadius: Radii.tabBar,
          borderTopWidth: 0,
          backgroundColor: isDark ? 'rgba(17, 25, 24, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: isDark ? NDEIP_COLORS.glass.border : NDEIP_COLORS.glass.borderLight,
          paddingBottom: 8,
          paddingTop: 8,
          ...Shadows.lg,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={isDark ? 80 : 60}
            tint={isDark ? 'dark' : 'light'}
            style={[StyleSheet.absoluteFill, { borderRadius: Radii.tabBar, overflow: 'hidden' }]}
          />
        ),
        tabBarLabelStyle: {
          fontSize: Typography.sizes.nano,
          fontWeight: Typography.weights.semibold as any,
          letterSpacing: Typography.tracking.wider,
          textTransform: 'uppercase',
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: isDark ? NDEIP_COLORS.gray[950] : NDEIP_COLORS.gray[50],
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontWeight: '700' as const,
          fontSize: Typography.sizes.title2,
          color: colors.text,
        },
        headerTintColor: colors.text,
      }}
    >
      {/* Tab 1: Villages */}
      <Tabs.Screen
        name="villages"
        options={{
          title: 'Villages',
          tabBarIcon: ({ color }) => <TabIcon name="villages" color={color} />,
        }}
      />
      {/* Tab 2: Stories */}
      <Tabs.Screen
        name="status"
        options={{
          title: 'Stories',
          tabBarIcon: ({ color }) => <TabIcon name="stories" color={color} />,
        }}
      />
      {/* Tab 3: Chats (center — home base) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => <TabIcon name="chats" color={color} size={24} />,
          headerTitle: () => (
            <Image
              source={require('../../assets/images/ndeip-logo.png')}
              resizeMode="contain"
              style={{ width: 90, height: 36 }}
            />
          ),
        }}
      />
      {/* Tab 4: Calls */}
      <Tabs.Screen
        name="calls"
        options={{
          title: 'Calls',
          tabBarIcon: ({ color }) => <TabIcon name="calls" color={color} />,
        }}
      />
      {/* Tab 5: Settings */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabIcon name="settings" color={color} />,
        }}
      />
      {/* Hide legacy screen */}
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}
