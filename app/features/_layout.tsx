import { Stack } from 'expo-router';
import { NDEIP_COLORS } from '@/constants/Colors';

export default function FeaturesLayout() {
    return (
        <Stack screenOptions={{
            headerStyle: { backgroundColor: NDEIP_COLORS.gray[950] },
            headerTintColor: NDEIP_COLORS.gray[100],
            headerTitleStyle: { fontWeight: '700' as const, fontSize: 17 },
            headerShadowVisible: false,
        }}>
            <Stack.Screen name="dnd-settings" options={{ title: 'Availability & DND' }} />
            <Stack.Screen name="top3" options={{ title: 'Top 5 Favorites' }} />
        </Stack>
    );
}
