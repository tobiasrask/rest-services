import { RestServices, Resource } from "./../src/index"
import assert from "assert";

describe('Resource', () => {

  describe('Test resource CSRF', () => {
    it('Test CSRF token automatic handling', (done) => {

      class TestResource extends Resource { }

      let params = {};
      let resource = new TestResource(params);

      let req = { session: {} };
      let tokenProbe = 'test123';
      resource.setSessionToken(req, 'test', tokenProbe);

      if (resource.getSessionToken(req, 'test') != tokenProbe)
        return done(new Error("Resource didn't return expected test token"));

      if (!resource.isValidSessionToken(req, 'test', tokenProbe))
        return done(new Error("Test token didn't validate"));

      done();
    })
  });

  describe('Test resource CSRF', () => {
    it('Test CSRF token automation', (done) => {

      class TestResource extends Resource { }

      let params = {};
      let req = { session: {} };
      let resource = new TestResource(params);

      // Get automation based token, it should be UUID
      let token = resource.getCurrentToken(req)

      if (!token)
        return done(new Error("Resource didn't return random token"));

      if (token.length != 36)
        return done(new Error("Resource token not UUID"));

      done();
    })
  });
});