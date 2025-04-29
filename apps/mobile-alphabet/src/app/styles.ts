import { Dimensions, StyleSheet } from 'react-native';
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
        height: 'auto',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: theme.fonts.primary,
    },
});

export const homeScreen = StyleSheet.create({
    background: {
        height: '100%',
        fontFamily: theme.fonts.primary,
    },
    button: {
        backgroundColor: theme.colors.accent,
        padding: 12,
        paddingTop: 6,
        width: '80%',
        borderRadius: 24,
        alignSelf: 'center',
        marginBottom: 16,
        elevation: 8,
    },
    appTitle: {
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: theme.fontSizes.large,
        margin: 20,
        fontWeight: '700',
    },
    homeImage: {
        width: 130,
        height: 130,
        alignSelf: 'center',
        resizeMode: 'contain',
    },
    tagline: {
        color: theme.colors.text,
        margin: 38,
        fontSize: theme.fontSizes.small,
        marginTop: 0,
        textAlign: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: theme.colors.text,
        fontSize: theme.fontSizes.small,
    },
});

export const creditsScreen = StyleSheet.create({
    page: {
        margin: 6,
        textAlign: 'center',
    },
    text: {
        fontSize: theme.fontSizes.small,
        color: theme.colors.text,
    },
});

export const loadingComponent = StyleSheet.create({
    loader: {
        color: theme.colors.text,
        textAlign: 'center',
    },
    image: {
        height: 80,
        width: 80,
        alignSelf: 'center',
        resizeMode: 'contain',
    },
    text: {
        color: theme.colors.text,
        textAlign: 'center',
        fontSize: theme.fontSizes.medium,
    },
    center: {
        transform: [
            {
                translateY: Dimensions.get('screen').height * 0.1,
            },
        ],
    },
});

export const errorComponent = StyleSheet.create({
    text: {
        color: theme.colors.text,
        fontSize: theme.fontSizes.small,
    },
});

export const menuScreen = StyleSheet.create({
    alphabet: {
        fontSize: 40,
        fontFamily: theme.fonts.primary,
        textAlign: 'center',
        color: colors.text,
        borderBottomColor: 'white',
        borderBottomWidth: 1,
        paddingBottom: 10,
    },
});

export const alphabetButton = StyleSheet.create({
    alphabetName: {
        color: theme.colors.textDark,
        fontSize: theme.fontSizes.medium,
        fontFamily: theme.fonts.primary,
        textAlign: 'center',
        fontWeight: 'normal',
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
        color: theme.colors.accent,
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
    notFound: {
        color: 'white',
        fontSize: 20,
        textAlign: 'center',
        padding: 10,
    },
});

export const alphabetCard = StyleSheet.create({
    card: {
        width: 380,
        backgroundColor: '#fff',
        borderRadius: 22,
        alignSelf: 'center',
        borderStyle: 'solid',
        borderWidth: 3,
        borderColor: 'black',
    },
    image: {
        width: 380,
        height: 160,
        resizeMode: 'cover',
        alignSelf: 'center',
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
    hint: {
        color: colors.text,
        textAlign: 'center',
        padding: 4,
    },
});

export default styles;
