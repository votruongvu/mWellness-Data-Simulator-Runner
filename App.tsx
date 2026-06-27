/**
 * MWR root component (MR-A — Foundation + Auth Shell).
 *
 * Composition: SafeAreaProvider -> SessionProvider -> NavigationContainer ->
 * RootNavigator. The SessionProvider (bucket 003) owns auth/session truth; the
 * navigator (bucket 002) routes from session status.
 */

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {SessionProvider} from './src/auth/SessionContext';
import {RootNavigator} from './src/navigation/RootNavigator';
import {colors} from './src/shared/theme';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SessionProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SessionProvider>
    </SafeAreaProvider>
  );
}

export default App;
