import { colors } from 'app/styles';
import { Text, View } from 'react-native';
import Background from './Background';

export function CreditsScreen() {
    return (
        <Background>
            <View>
                <Text style={{ color: colors.text }}>Credits screen works!</Text>
            </View>
        </Background>
    );
}

export default CreditsScreen;
