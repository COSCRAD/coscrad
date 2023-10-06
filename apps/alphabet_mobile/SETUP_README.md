# Create a React Native project on Ubuntu 22.04

This is a guide to creating a React Native project and setting up the environment to support Android Studio's emulator.

## Prerequisites

You'll need to install the Android emulator.

### Install Android Studio

https://developer.android.com/studio

### Create a directory to hold the Android Studio file

> > mkdir opt

### Move Android Studio to the opt directory in home

> > cd Downloads/

> > mv android-studio /opt

## Configure environment variables

#### Open configuration file

> > nano ~/.bashrc

#### Add the variables

`export JAVA_HOME=/usr/lib/jvm/default-java`

`export ANDROID_HOME=~/Android/Sdk`

`export PATH=$PATH:$ANDROID_HOME/emulator`

`export PATH=$PATH:$ANDROID_HOME/platform-tools`

#### Save Changes

Press `CTRL` + `O`

Press `ENTER`

#### Update with current changes

> > source ~/.bashrc

## Install React Native CLI (React Native 0.72.5)

> > yard add -g react-native-cli

https://reactnative.dev/docs/environment-setup

> > cd coscrad/apps

> > npx react-native init MyApp --template react-native-template-typescript

https://reactnative.dev/docs/typescript

## Open Project and start emulator

> > cd coscrad/apps/MyApp

> > yarn start
