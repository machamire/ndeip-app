import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MediaEditor from '@/components/media/MediaEditor';

export default function EditorScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const media = {
        uri: params.uri as string || '',
        width: Number(params.width) || 1080,
        height: Number(params.height) || 1920,
        type: 'image',
    };

    const handleSave = (editedMedia: any) => {
        Alert.alert('Story Created', 'Your edited media has been posted to your story!');
        router.back();
    };

    const handleCancel = () => {
        // Will be called by MediaEditor before navigation
    };

    return (
        <View style={styles.container}>
            <MediaEditor
                route={{ params: { media } } as any}
                navigation={{ goBack: () => router.back(), navigate: () => { } } as any}
                media={media as any}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
