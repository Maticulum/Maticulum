var DataFromBase = (function() {
  var dataPass = "";

  var getDataPass = function() {
    return dataPass;    // Or pull this from cookie/localStorage
  };

  var setDataPass = function(_dataPass) {
    dataPass = _dataPass;     
    // Also set this in cookie/localStorage
  };

  return {
    getDataPass: getDataPass,
    setDataPass: setDataPass
  }

})();

export default DataFromBase;