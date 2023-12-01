const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

// http.get('http://localhost:3000/', (res) => {
//   const { statusCode } = res;
//   const contentType = res.headers['content-type'];

//   let error;
//   // Any 2xx status code signals a successful response but
//   // here we're only checking for 200.
//   if (statusCode !== 200) {
//     error = new Error('Request Failed.\n' +
//                       `Status Code: ${statusCode}`);
//   } else if (!/^application\/json/.test(contentType)) {
//     error = new Error('Invalid content-type.\n' +
//                       `Expected application/json but received ${contentType}`);
//   }
//   if (error) {
//     console.error(error.message);
//     // Consume response data to free up memory
//     res.resume();
//     return;
//   }

//   res.setEncoding('utf8');
//   let rawData = '';
//   res.on('data', (chunk) => {
//     rawData += chunk
//   })
//   res.on('end', () => {
//     try {
//       rawData = JSON.parse(rawData)
//       console.log('res: ', rawData)
//     } catch (error) {
//       console.log(error)
//     }
//   })

// }).on('error', (e) => {
//   console.error(`Got error: ${e.message}`);
// });

const postData = JSON.stringify({
  msg: "Hello World",
});

const req = http.request(
  {
    port: 3000,
    path: "/upload",
    hostname: "127.0.0.1",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-length": Buffer.byteLength(postData),
    },
  },
  (res) => {
    // console.log(res)
    res.on("data", (chunk) => {
      console.log("res: ", chunk.toString());
    });
  }
);

req.on("error", (e) => {
  console.error(`problem with request: ${e.message}`);
});
// write data to body
req.write(postData);
req.end();
// req.destroy(new Error(1110));

// Create a local server to receive data from
const server = http.createServer((req, res) => {
  console.log("req: ", req.url);
  if (req.url === "/upload") {
    req.on("data", (chunk) => {
      console.log("req: ", chunk);
    });
    req.on("end", (chunk) => {
      console.log("req end ");
    });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        data: "hahahah!",
      })
    );
  } else if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    const htmlPath = path.resolve(__dirname, "../public/index.html");
    console.log(htmlPath);
    fs.createReadStream(htmlPath).pipe(res);
  }
});

server.listen(3000);
