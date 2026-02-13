import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View, Image, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors, { NDEIP_COLORS } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Spacing, Radii, Shadows, Typography } from '@/constants/ndeipBrandSystem';

function TabIcon({ iconName, color, size = 22 }: { iconName: React.ComponentProps<typeof FontAwesome>['name']; color: string; size?: number }) {
  return <FontAwesome name={iconName} size={size} color={color} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: NDEIP_COLORS.emerald,
        tabBarInactiveTintColor: NDEIP_COLORS.gray[600],
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 90,
          borderTopWidth: 0,
          backgroundColor: 'rgba(20, 30, 27, 0.95)',
          borderWidth: 0,
          borderTopColor: NDEIP_COLORS.glass.border,
          paddingBottom: 18,
          paddingTop: 10,
          ...Shadows.lg,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="dark"
            style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}
          />
        ),
        tabBarIconStyle: {
          marginBottom: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500' as any,
          letterSpacing: 0.2,
          marginTop: 1,
          paddingBottom: 2,
        },
        headerStyle: {
          backgroundColor: NDEIP_COLORS.gray[950],
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontWeight: '700' as const,
          fontSize: Typography.sizes.title2,
          color: '#F0F4F3',
        },
        headerTintColor: '#F0F4F3',
      }}
    >
      {/* Tab 1: Chats (home base) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => <TabIcon iconName="commenting" color={color} size={22} />,
          headerTitle: () => (
            <Image
              source={require('../../assets/images/ndeip-logo.png')}
              resizeMode="contain"
              style={{ width: 90, height: 36 }}
            />
          ),
        }}
      />
      {/* Tab 2: Calls */}
      <Tabs.Screen
        name="calls"
        options={{
          title: 'Calls',
          tabBarIcon: ({ color }) => <TabIcon iconName="phone" color={color} size={20} />,
        }}
      />
      {/* Tab 3: Stories */}
      <Tabs.Screen
        name="status"
        options={{
          title: 'Stories',
          tabBarIcon: ({ color }) => <TabIcon iconName="sun-o" color={color} size={21} />,
        }}
      />
      {/* Tab 4: Villages */}
      <Tabs.Screen
        name="villages"
        options={{
          title: 'Villages',
          tabBarIcon: ({ color }) => <TabIcon iconName="globe" color={color} size={22} />,
        }}
      />
      {/* Tab 5: Settings */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabIcon iconName="sliders" color={color} size={22} />,
        }}
      />
      {/* Hide legacy screen */}
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}
