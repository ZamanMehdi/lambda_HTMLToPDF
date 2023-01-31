const AWS = require("aws-sdk");
const s3 = new AWS.S3({ apiVersion: "2006-03-01", region: "us-east-1" });

/**
 * S3 promise based upload function
 * @param {Object} uploadParams
 */
module.exports = (uploadParams) => {
  return new Promise((resolve, reject) => {
    s3.upload(uploadParams, function (err, data) {
      if (err) {
        console.log(err);
        return reject(err);
      } else {
        return resolve(data);
      }
    });
  });
};
