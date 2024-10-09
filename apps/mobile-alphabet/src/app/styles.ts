import { StyleSheet } from 'react-native';

export const colors = {
    primary: '#5f43b2',
    secondary: ' #3a3153',
    text: '#ffff',
    accent: '#3a3153',
    button: ' #FF9800',
};

const styles = StyleSheet.create({
    background: {
        backgroundColor: 'white',
        height: 1000,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export const detailStyles = StyleSheet.create({
    background: {
        backgroundColor: 'white',
        height: 1000,
        flex: 1,
        justifyContent: 'center',
    },
});

export const alphabetDetailStyle = StyleSheet.create({
    layout: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    flexLayout: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    letter: {
        fontSize: 80,
        fontWeight: 'bold',
        textAlign: 'center',
        color: colors.primary,
    },
    word: {
        fontSize: 35,
        textAlign: 'center',
        color: colors.primary,
    },
    appAudio: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navigationButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 30,
    },
});

export default styles;
