/* globals SDK_VERSION */
define(function(require) {
  var OktaAuth = require('OktaAuth');
  var Q = require('q');
  var util = require('../util/util');
  var _ = require('lodash');

  describe('General Methods', function () {

    describe('idToken.decode', function () {

      function setup() {
        return Q.resolve(new OktaAuth({
          url: 'http://example.okta.com'
        }));
      }

      it('correctly decodes an idToken', function (done) {
        return setup()
        .then(function (oa) {
          var testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
                          'eyAibXNnX2VuIjogIkhlbGxvIiwKICAibXNnX2pwIjogIuOBk-OCk-OBq-' +
                          'OBoeOBryIsCiAgIm1zZ19jbiI6ICLkvaDlpb0iLAogICJtc2dfa3IiOiAi' +
                          '7JWI64WV7ZWY7IS47JqUIiwKICAibXNnX3J1IjogItCX0LTRgNCw0LLRgd' +
                          'GC0LLRg9C50YLQtSEiLAogICJtc2dfZGUiOiAiR3LDvMOfIEdvdHQiIH0.' +
                          'TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';
          var decodedToken = oa.idToken.decode(testToken);
          expect(decodedToken).toDeepEqual({
            header: {
              'alg': 'HS256',
              'typ': 'JWT'
            },
            payload: {
              'msg_en': 'Hello',
              'msg_jp': 'こんにちは',
              'msg_cn': '你好',
              'msg_kr': '안녕하세요',
              'msg_ru': 'Здравствуйте!',
              'msg_de': 'Grüß Gott'
            },
            signature: 'TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ'
          });
          done();
        });
      });

      it('throws an error for a malformed idToken', function (done) {
        return setup()
        .then(function (oa) {
          return oa.idToken.decode('malformedIdToken');
        })
        .then(function (res) {
          // Should never hit this
          expect(res).toBeNull();
          done();
        })
        .fail(function (err) {
          expect(err.name).toEqual('AuthSdkError');
          expect(err.errorSummary).toEqual('Malformed idToken');
          done();
        });
      });
    });

    // Run if browser supports crypto
    var describeType = OktaAuth.prototype.features.isTokenVerifySupported() ? describe : xdescribe;
    describeType('idToken.verify', function () {

      /*
      {
        "sub": "00u1pcla5qYIREDLWCQV",
        "name": "Len Boyette",
        "given_name": "Len",
        "family_name": "Boyette",
        "updated_at": 1446153401,
        "email": "lboyette@okta.com",
        "email_verified": true,
        "ver": 1,
        "iss": "https://lboyette.trexcloud.com",
        "login": "admin@okta.com",
        "aud": "NPSfOkH5eZrTy8PMDlvx",
        "iat": 1449696330,
        "exp": 1449699930,
        "amr": [
          "kba",
          "mfa",
          "pwd"
        ],
        "jti": "TRZT7RCiSymTs5W7Ryh3",
        "auth_time": 1449696330
      }
      */
      var standardIdToken = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwMHUxcGNsYTVxWUlSRU' +
                            'RMV0NRViIsIm5hbWUiOiJMZW4gQm95ZXR0ZSIsImdpdmVuX25hb' +
                            'WUiOiJMZW4iLCJmYW1pbHlfbmFtZSI6IkJveWV0dGUiLCJ1cGRh' +
                            'dGVkX2F0IjoxNDQ2MTUzNDAxLCJlbWFpbCI6Imxib3lldHRlQG9' +
                            'rdGEuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInZlciI6MS' +
                            'wiaXNzIjoiaHR0cHM6Ly9sYm95ZXR0ZS50cmV4Y2xvdWQuY29tI' +
                            'iwibG9naW4iOiJhZG1pbkBva3RhLmNvbSIsImF1ZCI6Ik5QU2ZP' +
                            'a0g1ZVpyVHk4UE1EbHZ4IiwiaWF0IjoxNDQ5Njk2MzMwLCJleHA' +
                            'iOjE0NDk2OTk5MzAsImFtciI6WyJrYmEiLCJtZmEiLCJwd2QiXS' +
                            'wianRpIjoiVFJaVDdSQ2lTeW1UczVXN1J5aDMiLCJhdXRoX3Rpb' +
                            'WUiOjE0NDk2OTYzMzB9.YWCNE3ZvT-8ceKnAbTkmSxYE-jIPpfh' +
                            '2s8f_hTagUUxrfdKgyWzBb9iN3GOPaQ2K6jqOFx90RI2GBzAWec' +
                            'pel3sAxG-wvLqiy0d8g0CUb7XTHdhXOLRrXvlpbULxdNnMbBcc6' +
                            'uOLDalBjrumOiDMLzti-Bx6uQQ0EjUwuC-Dhv7I3wMsVxyEKejv' +
                            'jMLbfWJ6iu4-UUx1r8_ZZUjDDXSB3OFXJQ3nPwRVFXZuRNhGScL' +
                            'nftXz7mypRGxrapIQusym1K8hk9uy8_KYL2H2QNbyIqK9Vh9JhY' +
                            '1rtkQNpv3ZerCUXEVGRiEXDqR_OHu4vUi1-FkONZZe2ov8dQ1mX' +
                            'iHHdw';

      function setupVerifyIdTokenTest(opts) {
        util.itMakesCorrectRequestResponse({
          title: opts.title,
          setup: {
            calls: [
              {
                request: {
                  method: 'get',
                  uri: '/.well-known/openid-configuration'
                },
                response: 'well-known'
              },
              {
                request: {
                  method: 'get',
                  uri: '/oauth2/v1/keys'
                },
                response: 'keys'
              }
            ]
          },
          execute: function (test) {
            if (opts.execute) {
              return opts.execute(test, opts);
            }

            // By default, we want to be in the future because the tokens
            // would be expired otherwise
            util.warpToDistantFuture();
            return test.oa.idToken.verify(opts.idToken, opts.verifyOpts)
              .then(function(res) {
                util.returnToPresent();
                return res;
              });
          },
          expectations: opts.expectations
        });
      }

      setupVerifyIdTokenTest({
        title: 'verifies a valid idToken',
        idToken: standardIdToken,
        expectations: function (test, res) {
          expect(res).toEqual(true);
        }
      });

      setupVerifyIdTokenTest({
        title: 'rejects an invalid idToken',
        idToken: 'fyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwMHUxcGNsYTVxWUlSRU' +
                  'RMV0NRViIsIm5hbWUiOiJMZW4gQm95ZXR0ZSIsImdpdmVuX25hb' +
                  'WUiOiJMZW4iLCJmYW1pbHlfbmFtZSI6IkJveWV0dGUiLCJ1cGRh' +
                  'dGVkX2F0IjoxNDQ2MTUzNDAxLCJlbWFpbCI6Imxib3lldHRlQG9' +
                  'rdGEuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInZlciI6MS' +
                  'wiaXNzIjoiaHR0cHM6Ly9sYm95ZXR0ZS50cmV4Y2xvdWQuY29tI' +
                  'iwibG9naW4iOiJhZG1pbkBva3RhLmNvbSIsImF1ZCI6Ik5QU2ZP' +
                  'a0g1ZVpyVHk4UE1EbHZ4IiwiaWF0IjoxNDQ5Njk2MzMwLCJleHA' +
                  'iOjE0NDk2OTk5MzAsImFtciI6WyJrYmEiLCJtZmEiLCJwd2QiXS' +
                  'wianRpIjoiVFJaVDdSQ2lTeW1UczVXN1J5aDMiLCJhdXRoX3Rpb' +
                  'WUiOjE0NDk2OTYzMzB9.YWCNE3ZvT-8ceKnAbTkmSxYE-jIPpfh' +
                  '2s8f_hTagUUxrfdKgyWzBb9iN3GOPaQ2K6jqOFx90RI2GBzAWec' +
                  'pel3sAxG-wvLqiy0d8g0CUb7XTHdhXOLRrXvlpbULxdNnMbBcc6' +
                  'uOLDalBjrumOiDMLzti-Bx6uQQ0EjUwuC-Dhv7I3wMsVxyEKejv' +
                  'jMLbfWJ6iu4-UUx1r8_ZZUjDDXSB3OFXJQ3nPwRVFXZuRNhGScL' +
                  'nftXz7mypRGxrapIQusym1K8hk9uy8_KYL2H2QNbyIqK9Vh9JhY' +
                  '1rtkQNpv3ZerCUXEVGRiEXDqR_OHu4vUi1-FkONZZe2ov8dQ1mX' +
                  'iHHdw',
        expectations: function (test, res) {
          expect(res).toEqual(false);
        }
      });

      setupVerifyIdTokenTest({
        title: 'rejects an invalid idToken due to expiration',
        idToken: standardIdToken,
        execute: function(test, opts) {
          util.warpToDistantPast();
          return test.oa.idToken.verify(opts.idToken, opts.verifyOpts)
            .then(function(res) {
              util.returnToPresent();
              return res;
            });
        },
        expectations: function (test, res) {
          expect(res).toEqual(false);
        }
      });

      setupVerifyIdTokenTest({
        title: 'verifies an idToken that would be invalid, except ' +
                'we\'re using the expirationTime option',
        idToken: standardIdToken,
        verifyOpts: {
          expirationTime: 9999999999
        },
        execute: function(test, opts) {
          util.warpToDistantPast();
          return test.oa.idToken.verify(opts.idToken, opts.verifyOpts)
            .then(function(res) {
              util.returnToPresent();
              return res;
            });
        },
        expectations: function (test, res) {
          expect(res).toEqual(true);
        }
      });

      setupVerifyIdTokenTest({
        title: 'verifies a valid idToken using single audience option',
        idToken: standardIdToken,
        verifyOpts: {
          audience: 'NPSfOkH5eZrTy8PMDlvx'
        },
        expectations: function (test, res) {
          expect(res).toEqual(true);
        }
      });

      setupVerifyIdTokenTest({
        title: 'rejects an invalid idToken using single audience option',
        idToken: standardIdToken,
        verifyOpts: {
          audience: 'invalid'
        },
        expectations: function (test, res) {
          expect(res).toEqual(false);
        }
      });

      setupVerifyIdTokenTest({
        title: 'verifies a valid idToken using multiple audience option (all valid)',
        idToken: standardIdToken,
        verifyOpts: {
          audience: ['NPSfOkH5eZrTy8PMDlvx', 'NPSfOkH5eZrTy8PMDlvx']
        },
        expectations: function (test, res) {
          expect(res).toEqual(true);
        }
      });

      setupVerifyIdTokenTest({
        title: 'verifies a valid idToken using multiple audience option (valid and invalid)',
        idToken: standardIdToken,
        verifyOpts: {
          audience: ['NPSfOkH5eZrTy8PMDlvx', 'invalid2']
        },
        expectations: function (test, res) {
          expect(res).toEqual(true);
        }
      });

      setupVerifyIdTokenTest({
        title: 'rejects an invalid idToken using multiple audience option (all invalid)',
        idToken: standardIdToken,
        verifyOpts: {
          audience: ['invalid1', 'invalid2']
        },
        expectations: function (test, res) {
          expect(res).toEqual(false);
        }
      });

      setupVerifyIdTokenTest({
        title: 'verifies a valid idToken using issuer option',
        idToken: standardIdToken,
        verifyOpts: {
          issuer: 'https://lboyette.trexcloud.com'
        },
        expectations: function (test, res) {
          expect(res).toEqual(true);
        }
      });

      setupVerifyIdTokenTest({
        title: 'rejects an invalid idToken using issuer option',
        idToken: standardIdToken,
        verifyOpts: {
          issuer: 'invalid'
        },
        expectations: function (test, res) {
          expect(res).toEqual(false);
        }
      });
    });

    describe('trans.cancel', function () {
      util.itMakesCorrectRequestResponse({
        title: 'returns empty state if called',
        setup: {
          status: 'password-expired',
          request: {
            uri: '/api/v1/authn/cancel',
            data: {
              stateToken: '00s1pd3bZuOv-meJE13hz1B7SZl5EGc14Ii_CTBIYd'
            }
          },
          response: 'cancel'
        },
        execute: function (test) {
          return test.trans.cancel()
            .then(function(trans) {
              expect(trans.status).toBeUndefined();
              return trans;
            });
        }
      });
    });

    describe('options.transformErrorXHR', function () {
      util.itErrorsCorrectly({
        title: 'transforms the error response',
        setup: {
          transformErrorXHR: function(res) {
            expect(res).toBeDefined();
            res.responseJSON.errorSummary = 'transformed!!!';
            return res;
          },
          request: {
            uri: '/api/v1/authn',
            data: {}
          },
          response: 'primary-auth-error'
        },
        execute: function (test) {
          return test.oa.signIn({})
            .fail(function(err) {
              expect(err.errorCode).toEqual('E0000004');
              expect(err.errorSummary).toEqual('Authentication failed');
              expect(err.errorLink).toEqual('E0000004');
              expect(err.errorId).toEqual('oae89lazz1zRcOcZFpclPsVHA');
              expect(err.errorCauses).toEqual([]);
              expect(err.xhr.responseJSON.errorSummary).toEqual('transformed!!!');
              throw err;
            });
        }
      });
    });

    describe('session.close', function () {
      util.itMakesCorrectRequestResponse({
        title: 'allows deleting a session',
        setup: {
          calls: [
            {
              request: {
                uri: '/api/v1/sessions/me'
              },
              response: 'empty'
            }
          ]
        },
        execute: function (test) {
          return test.oa.session.close();
        },
        expectations: function () {
          // Assertions of the correct uri and response handling
          // are implicitly expected when the test runs
        }
      });
    });

    describe('session.get', function () {
      util.itMakesCorrectRequestResponse({
        title: 'return ACTIVE session with refresh method on success',
        setup: {
          calls: [
            {
              request: {
                uri: '/api/v1/sessions/me'
              },
              response: 'session'
            }
          ]
        },
        execute: function (test) {
          return test.oa.session.get();
        },
        expectations: function (test, res) {
          expect(res.refresh).toBeDefined();
          expect(res.user).toBeDefined();
          expect(_.omit(res, 'refresh', 'user')).toEqual({
            'id': '000SFn2Do5LSEeE7ETg1JewvQ',
            'userId': '00uih5GNExguYaK6I0g3',
            'login': 'administrator1@clouditude.net',
            'expiresAt': '2016-01-27T03:59:35.000Z',
            'status': 'ACTIVE',
            'lastPasswordVerification': '2016-01-27T01:15:39.000Z',
            'lastFactorVerification': null,
            'amr': ['pwd'],
            'idp': {
              'id': '00oigpTeBgc5cgQh50g3',
              'type': 'OKTA'
            },
            'mfaActive': false
          });
        }
      });

      util.itMakesCorrectRequestResponse({
        title: 'returns INACTIVE on failure',
        setup: {
          request: {
            uri: '/api/v1/sessions/me'
          },
          response: 'error-session-not-found'
        },
        execute: function (test) {
          return test.oa.session.get();
        },
        expectations: function (test, res) {
          expect(res).toHaveAllKeys(['status']);
          expect(res.status).toEqual('INACTIVE');
        }
      });
    });

    describe('custom headers', function () {
      util.itMakesCorrectRequestResponse({
        title: 'adds custom headers',
        setup: {
          headers: {
            'X-Custom-Header': 'custom'
          },
          request: {
            uri: '/api/v1/sessions/me',
            headers: {
              'X-Custom-Header': 'custom',
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-Okta-SDK': 'okta-auth-js-' + SDK_VERSION
            }
          },
          response: 'session'
        },
        execute: function (test) {
          return test.oa.session.get();
        },
        expectations: function () {
          // We validate the headers for each request in our ajaxMock
        }
      });

      util.itMakesCorrectRequestResponse({
        title: 'override headers',
        setup: {
          headers: {
            'X-Okta-SDK': 'another-sdk-version'
          },
          request: {
            uri: '/api/v1/sessions/me',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-Okta-SDK': 'another-sdk-version'
            }
          },
          response: 'session'
        },
        execute: function (test) {
          return test.oa.session.get();
        },
        expectations: function () {
          // We validate the headers for each request in our ajaxMock
        }
      });
    });
  });
});
