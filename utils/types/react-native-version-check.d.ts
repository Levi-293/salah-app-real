declare module 'react-native-version-check' {
  interface VersionCheckOptions {
    currentVersion?: string;
    latestVersion?: string;
    provider?: 'appStore' | 'playStore';
    country?: string;
    packageName?: string;
    fetchOptions?: any;
  }

  interface VersionCheckResult {
    isNeeded: boolean;
    currentVersion: string;
    latestVersion: string;
    storeUrl?: string;
  }

  function getLatestVersion(options?: VersionCheckOptions): Promise<string>;
  function needUpdate(options?: VersionCheckOptions): Promise<VersionCheckResult>;

  export { getLatestVersion, needUpdate };
  export default { getLatestVersion, needUpdate };
}
