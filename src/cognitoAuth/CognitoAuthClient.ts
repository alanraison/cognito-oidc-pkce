export interface ICognitoConfig {
  redirectUri: string;
  clientId: string;
  domain: string;
  scopes: Array<string>;
}

interface LoginWithRedirectOptions {
  provider?: string;
  providerId?: string;
}

function generateRandomString(length: number = 43): string {
  const charset =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_~.';
  let random = '';
  const randomValues = Array.from(
    crypto.getRandomValues(new Uint8Array(length))
  );
  randomValues.forEach(v => (random += charset[v % charset.length]));
  return random;
}

async function calculateCodeChallenge(codeVerifier: string): Promise<string> {
  const data = new TextEncoder().encode(codeVerifier);
  const sha256 = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(sha256));
  return btoa(String.fromCharCode.apply(null, hashArray))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export default class CognitoAuthClient {
  private state: string = '';
  private codeVerifier: string = '';
  private code: string = '';
  constructor(private options: ICognitoConfig) {
  }

  async loginWithRedirect(options?: LoginWithRedirectOptions) {
    const authorizeUrl = `${this.options.domain}/authorize?`
    this.state = generateRandomString();
    this.codeVerifier = generateRandomString();

    const opts = {
      response_type: 'code',
      client_id: this.options.clientId,
      redirect_uri: this.options.redirectUri,
      scope: this.options.scopes.join(' '),
      state: this.state,
      code_challenge_method: 'S256',
      code_challenge: await calculateCodeChallenge(this.codeVerifier),
      identity_provider: options?.provider,
      idp_identifier: options?.providerId,
    };

    const params = Object.entries(opts)
      .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val||'')}`)
      .join('&');

    window.location.assign(authorizeUrl + params);
  }

  async handleAuthorizeCallback(
    url: string = window.location.href,
  ) {
    const { state, code, error, error_description } = url.split('?')
      .slice(1)[0]
      .split('&')
      .map(q => q.split('='))
      .reduce(
        (o, [ key, val ]) => ({ ...o, [key]: val}), 
        {} as { [key: string]: string }
      );

    if (error) {
      return new Error(error + (error_description ? `: ${error_description}` : ''));
    }
    if (state !== this.state) {
      return new Error('Returned state does not match');
    }
    
    return await this.getTokenFromCode();
  }

  logout() {

  }

  isAuthenticated() {
    return true;
  }

  getUser() {
    return {name:'alan'}
  }

  private async getTokenFromCode(code: string) {
    await fetch(this.options.domain)
  }
}

export class AuthState {
  constructor(
    readonly authenticated: boolean,
    readonly pending: boolean,
    readonly auth?: {
      user: any,
      idToken: string,
      accessToken: string,
      refreshToken: string,
    },
  ) {}
}