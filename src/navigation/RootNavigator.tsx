/**
 * MR-A — Root navigator (native-stack).
 *
 * Chooses the route group from session status:
 *   booting        -> Splash (restores session, routes onward)
 *   unauthenticated -> Login
 *   expired        -> SessionExpired (E01)
 *   authenticated  -> Dashboard (+ Settings)
 *
 * BackendUnavailable (E02) is reachable from Login / Dashboard when the client
 * reports BACKEND_UNAVAILABLE. No run/plan/permission routes exist in MR-A.
 */

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {useSession} from '../auth/SessionContext';
import {colors} from '../shared/theme';
import {DashboardScreen} from '../screens/DashboardScreen';
import {LoginScreen} from '../screens/LoginScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {SplashScreen} from '../screens/SplashScreen';
import {TestCaseListScreen} from '../screens/TestCaseListScreen';
import {TestCaseDetailScreen} from '../screens/TestCaseDetailScreen';
import {VersionScenariosScreen} from '../screens/VersionScenariosScreen';
import {ExecutionPlanPreviewScreen} from '../screens/ExecutionPlanPreviewScreen';
import {DryRunResultScreen} from '../screens/DryRunResultScreen';
import {BackendUnavailableScreen} from '../screens/errors/BackendUnavailableScreen';
import {SessionExpiredScreen} from '../screens/errors/SessionExpiredScreen';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions = {
  headerStyle: {backgroundColor: colors.surface},
  headerTintColor: colors.text,
  contentStyle: {backgroundColor: colors.background},
} as const;

export function RootNavigator(): React.JSX.Element {
  const {status} = useSession();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {status === 'booting' ? (
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{headerShown: false}}
        />
      ) : status === 'authenticated' ? (
        <>
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{title: 'Runner Dashboard'}}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{title: 'Settings'}}
          />
          <Stack.Screen
            name="TestCaseList"
            component={TestCaseListScreen}
            options={{title: 'Test cases'}}
          />
          <Stack.Screen
            name="TestCaseDetail"
            component={TestCaseDetailScreen}
            options={{title: 'Test case'}}
          />
          <Stack.Screen
            name="VersionScenarios"
            component={VersionScenariosScreen}
            options={{title: 'Version'}}
          />
          <Stack.Screen
            name="ExecutionPlanPreview"
            component={ExecutionPlanPreviewScreen}
            options={{title: 'Execution plan'}}
          />
          <Stack.Screen
            name="DryRunResult"
            component={DryRunResultScreen}
            options={{title: 'Dry-run result'}}
          />
          <Stack.Screen
            name="BackendUnavailable"
            component={BackendUnavailableScreen}
            options={{title: 'Backend unavailable'}}
          />
        </>
      ) : status === 'expired' ? (
        <Stack.Screen
          name="SessionExpired"
          component={SessionExpiredScreen}
          options={{headerShown: false}}
        />
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="BackendUnavailable"
            component={BackendUnavailableScreen}
            options={{title: 'Backend unavailable'}}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
