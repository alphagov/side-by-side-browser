hostname = require('../../hostname');

describe('hostname', function () {
  it('should export an aka function', function () {
    (typeof hostname.aka).should.equal('function');
  });

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

});
