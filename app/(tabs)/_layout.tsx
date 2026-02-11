import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View, Image } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

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

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#0D1613' : '#FFFFFF',
          borderTopColor: colorScheme === 'dark' ? 'rgba(42,122,94,0.12)' : colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
        },
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#0D1613' : '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 22,
          color: colors.text,
          letterSpacing: -0.3,
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
      {/* Tab 2: Stories (formerly Status) */}
      <Tabs.Screen
        name="status"
        options={{
          title: 'Stories',
          tabBarIcon: ({ color }) => <TabIcon name="stories" color={color} />,
        }}
      />
      {/* Tab 3: Chats (center) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => <TabIcon name="chats" color={color} />,
          headerTitle: () => (
            <Image
              source={require('../../assets/images/ndeip-logo.png')}
              style={{ width: 90, height: 36, resizeMode: 'contain' }}
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
      {/* Hide old 'two' tab */}
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}
