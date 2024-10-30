import { StyleSheet } from 'react-native';
import theme from '../../theme.config.json';

export const colors = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    teritary: theme.colors.teritary,
    text: theme.colors.text,
    accent: theme.colors.accent,
    button: ' #FF9800',
};

const styles = StyleSheet.create({
    background: {
        backgroundColor: colors.teritary,
        height: 1000,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: theme.fonts.primary,
    },
});

export const alphabetButton = StyleSheet.create({
    alphabetName: {
        color: theme.colors.text,
        fontSize: theme.fontSizes.large,
        fontWeight: '100',
        fontFamily: theme.fonts.primary,
    },
    alphabet: {
        color: theme.colors.text,
        fontSize: theme.fontSizes.medium,
        fontFamily: theme.fonts.secondary,
    },
});

export const creditsButton = StyleSheet.create({
    background: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: theme.fontSizes.small,
        fontFamily: theme.fonts.secondary,
        color: theme.colors.text,
    },
});

export const detailStyles = StyleSheet.create({
    background: {
        backgroundColor: colors.primary,
        height: 1000,
        flex: 1,
        justifyContent: 'center',
        fontFamily: theme.fonts.primary,
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
