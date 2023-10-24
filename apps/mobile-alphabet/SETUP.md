# Serve the Mobile Alphabet on Ubuntu 22.04

This is a guide to setting up the environment to open and serve the Mobile Alphabet project on the Android Emulator.

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

#### You will need to add the following environment variables. E.g., if you are using .bashrc, append the following lines:

`export JAVA_HOME=/usr/lib/jvm/default-java`

`export ANDROID_HOME=~/Android/Sdk`

`export PATH=$PATH:$ANDROID_HOME/emulator`

`export PATH=$PATH:$ANDROID_HOME/platform-tools`

Don't forget to source your profile changes or log-in freshly for the changes to take effect

## Install React Native CLI (React Native 0.72.5)

> > yard add -g react-native-cli

https://reactnative.dev/docs/environment-setup

## Open Repo and start emulator

> > cd coscrad

> > nx start mobile-alphabet
