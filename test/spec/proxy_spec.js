proxy = require('../../proxy');

describe('proxy', function () {
  it('should export a Proxy function', function () {
    (typeof proxy.Proxy).should.equal('function');
  });
  it('should export a Transform function', function () {
    (typeof proxy.Transform).should.equal('function');
  });
});