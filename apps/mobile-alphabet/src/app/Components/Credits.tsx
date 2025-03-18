import { creditsScreen } from 'app/styles';
import { Text, View } from 'react-native';
import Background from './Background';
import config from './config.json';

export function CreditsScreen() {
    const contributions = config.credits;

    return (
        <Background>
            <View style={[creditsScreen.page]}>
                <Text style={[creditsScreen.text]}>{contributions}</Text>
            </View>
        </Background>
    );
}

export default CreditsScreen;
