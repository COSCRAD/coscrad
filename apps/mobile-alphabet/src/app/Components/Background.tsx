import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import theme from './../../../theme.config.json';

const FROM_COLOR = theme.colors.primary;
const TO_COLOR = theme.colors.secondary;

const Background = ({ children }) => {
    return (
        <View style={{ flex: 1 }}>
            <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
                <Defs>
                    <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0" stopColor={FROM_COLOR} />
                        <Stop offset="1" stopColor={TO_COLOR} />
                    </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#grad)" />
            </Svg>
            {children}
        </View>
    );
};

export default Background;
