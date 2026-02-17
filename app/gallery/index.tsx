import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import QuantumGallery from '@/components/media/QuantumGallery';

export default function GalleryScreen() {
    const router = useRouter();

    const handleMediaSelect = (media: any) => {
        // Navigate to editor with selected media
        router.push({
            pathname: '/editor',
            params: { uri: media.uri, width: media.width, height: media.height },
        } as any);
    };

    return (
        <View style={styles.container}>
            <QuantumGallery
                navigation={{ navigate: (screen: string, params: any) => router.push({ pathname: `/${screen.toLowerCase()}`, params } as any), goBack: () => router.back() } as any}
                onMediaSelect={handleMediaSelect}
                onMediaShare={() => { }}
                onMediaDelete={() => { }}
                multiSelect={false}
                maxSelection={1}
                allowEditing={true}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
