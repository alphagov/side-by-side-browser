var whitelist = require('../../whitelist');

describe('whitelist', function () {
  it('should export an init function', function () {
    (typeof whitelist.init).should.equal('function');
  });

  it('should export a check function', function () {
    (typeof whitelist.check).should.equal('function');
  });

  it('should initialise with a default filename', function () {
    whitelist.init(undefined, function() {
        whitelist.check('foo.example.com').should.not.ok;
        whitelist.check('www.ukba.homeoffice.gov.uk').should.be.ok;
    });
  });

  it('should initialise with a fixture filename', function () {
    whitelist.init('test/fixtures/hosts.json', function() {
        whitelist.check('www.ukba.homeoffice.gov.uk').should.not.ok;
        whitelist.check('foo.example.com').should.be.ok;
        whitelist.check('bar.example.com').should.be.ok;
        whitelist.check('aka.example.com').should.not.be.ok;
        whitelist.check('aka-foo.example.com').should.not.be.ok;
    });
  });


  /*
  it('should aka www.example.com as aka.example.com', function () {
    hostname.aka('www.example.com').should.equal('aka.example.com');
  });

  it('should aka foo.example.com as aka-foo.example.com', function () {
    hostname.aka('www.example.com').should.equal('aka.example.com');
  });

  it('should export an upstream function', function () {
    (typeof hostname.upstream).should.equal('function');
  });

  it('should return an upstream of www.example.com for www.example.com.side-by-side.localhost', function () {
    hostname.upstream('www.example.com.side-by-side.localhost').should.equal('www.example.com');
  });

  it('should return a falsy upstream for www.example.com', function () {
    hostname.upstream('www.example.com').should.not.be.ok;
  });

  it('should return a falsy upstream for an undefined host', function () {
    hostname.upstream(undefined).should.not.be.ok;
  });
  */

});
