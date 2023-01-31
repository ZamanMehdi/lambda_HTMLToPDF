const chromium = require("chrome-aws-lambda");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const uploadToS3 = require("./uploadToS3");

const GeneratePDF = (data, fileName) => {
  return new Promise(async (resolve, reject) => {
    try {
      //Reading the HTML template
      const templateHtml = fs.readFileSync(
        path.join(process.cwd(), "example.html"),
        "utf8"
      );

      //Implementing math functions for HANDLEBARS to use them in HTML
      handlebars.registerHelper(
        "math",
        function (lvalue, operator, rvalue, options) {
          lvalue = parseFloat(lvalue);
          rvalue = parseFloat(rvalue);

          return {
            "+": lvalue + rvalue,
            "-": lvalue - rvalue,
            "*": (lvalue * rvalue).toFixed(2),
            "/": lvalue / rvalue,
            "%": lvalue % rvalue,
          }[operator];
        }
      );

      //Compiling the HTML template with HANDLEBARS
      const template = handlebars.compile(templateHtml);

      //Populating our JSON data using HANDLEBARS template
      const finalHtml = encodeURIComponent(template(data));

      //Configuration for our PDF file
      const options = {
        headerTemplate: "<p></p>",
        footerTemplate: "<p></p>",
        displayHeaderFooter: false,
        margin: {
          top: "40px",
          bottom: "100px",
        },
        printBackground: true,
        path: `${fileName}`,
        width: 1000,
      };

      //Launching the Puppeteer
      const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        headless: true,
        ignoreHTTPSErrors: true,
        executablePath: await chromium.executablePath,
        defaultViewport: await chromium.defaultViewport,
      });

      //Making a new blank page
      const page = await browser.newPage();

      //Sending our HTML template to the newly created page
      await page.goto(`data:text/html;charset=UTF-8,${finalHtml}`, {
        waitUntil: "networkidle0", //Wait till external dependencies could be loaded
      });

      //PDF generation
      await page.pdf(options);

      //Close browser
      await browser.close();

      console.log("PDF is Succesfully created!");
      resolve();
    } catch (error) {
      console.log("Error occurred:", error);
      reject(error);
    }
  });
};

exports.handler = async (event, context, callback) => {
  try {
    const file_name = `/tmp/${event.fileName}`;
    // body
    const data = event.data;

    // Generates the pdf.
    await GeneratePDF(data, file_name);

    // get file buffer
    const buffer = fs.readFileSync(file_name);

    // S3 upload params.
    let uploadParams = {
      Bucket: "bucketName", // s3 bucket
      Body: buffer, // file buffer
      Key: event.fileName + ".pdf", // s3 object key
    };

    // Upload file to s3.
    await uploadToS3(uploadParams);

    callback(null, true);
  } catch (error) {
    callback(error);
  }
};
