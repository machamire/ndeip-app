import { Stack } from 'expo-router';

export default function VillagesLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="help" />
            <Stack.Screen name="channel-templates" />
            <Stack.Screen name="create-channel" />
        </Stack>
    );
}
