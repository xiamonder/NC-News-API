const { getFileContents } = require("../../../file-utils/getFileContents");

exports.fetchAPI = () => {
  return getFileContents("endpoints.json").then((fileContents) => {
    return fileContents;
  });
};
