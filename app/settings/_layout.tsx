import { Stack } from 'expo-router';
import { NDEIP_COLORS } from '@/constants/Colors';

export default function SettingsLayout() {
    return (
        <Stack screenOptions={{
            headerStyle: { backgroundColor: NDEIP_COLORS.gray[950] },
            headerTintColor: NDEIP_COLORS.gray[100],
            headerTitleStyle: { fontWeight: '700' as const, fontSize: 17 },
            headerShadowVisible: false,
        }}>
            <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile' }} />
            <Stack.Screen name="privacy" options={{ title: 'Privacy' }} />
            <Stack.Screen name="account" options={{ title: 'Account' }} />
            <Stack.Screen name="chats-settings" options={{ title: 'Chats' }} />
            <Stack.Screen name="lists" options={{ title: 'Lists' }} />
            <Stack.Screen name="starred" options={{ title: 'Starred Messages' }} />
            <Stack.Screen name="chat-history" options={{ title: 'Chat History' }} />
            <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
            <Stack.Screen name="storage-data" options={{ title: 'Storage and Data' }} />
            <Stack.Screen name="help-feedback" options={{ title: 'Help' }} />
            <Stack.Screen name="linked-devices" options={{ title: 'Linked Devices' }} />
        </Stack>
    );
}
