import Constants from 'expo-constants';

const hostUri = Constants.expoConfig?.hostUri;

export const API_URL = hostUri
  ? `http://${hostUri.split(':')[0]}:3000`
  : 'http://localhost:3000';