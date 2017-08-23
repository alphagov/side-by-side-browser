var allowlist = require('../../allowlist');

describe('allowlist', function () {
  it('should export an init function', function () {
    (typeof allowlist.init).should.equal('function');
  });

  it('should export a check function', function () {
    (typeof allowlist.check).should.equal('function');
  });

  it('should initialise with a default filename', function (ok) {
    allowlist.init(undefined, function() {
        allowlist.check('foo.example.com').should.not.be.ok;
        allowlist.check('www.ukba.homeoffice.gov.uk').should.be.ok;
        ok();
    });
  });

  it('should initialise with a fixture filename', function (ok) {
    allowlist.init('test/fixtures/hosts.json', function() {
        allowlist.check('www.ukba.homeoffice.gov.uk').should.not.be.ok;
        allowlist.check('foo.example.com').should.be.ok;
        allowlist.check('bar.example.com').should.be.ok;
        allowlist.check('aka.example.com').should.not.be.ok;
        allowlist.check('aka-foo.example.com').should.not.be.ok;
        ok();
    });
  });
});
