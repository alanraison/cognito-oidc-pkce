
const awsConfig = {
  clientId: '7b0lmsj148jkbo0b9tnbd34bee',
  issuer: 'https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_6sXoUUJbo',
  redirectUri: `${window.location.origin}/implicit/callback`,
  scopes: ['openid','email'],
  pkce: true,
}