import {TurboModule, TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  registerLog(callback: (log: string) => void): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'NativeLoggerModule',
);
