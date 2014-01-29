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
});
