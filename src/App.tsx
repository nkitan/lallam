/**
 * Main App Component
 * Sets up navigation and global providers
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StatusBar, StyleSheet, useColorScheme} from 'react-native';

import ChatScreen from './screens/ChatScreen';
import ConversationListScreen from './screens/ConversationListScreen';
import {useTheme} from './theme/useTheme';
import {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppContent: React.FC = () => {
  const {colors} = useTheme();
  const colorScheme = useColorScheme();
  
  return (
    <>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background} 
      />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="ConversationList"
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontWeight: 'bold',
              color: colors.text,
            },
            headerShadowVisible: true,
          }}>
          <Stack.Screen
            name="ConversationList"
            component={ConversationListScreen}
            options={{
              title: 'LlamaChat',
              headerLargeTitle: false,
            }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={({route}) => ({
              title: 'New Chat',
              headerBackTitleVisible: false,
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
