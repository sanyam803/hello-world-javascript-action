/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 180:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 12:
/***/ ((module) => {

module.exports = eval("require")("@actions/exec");


/***/ }),

/***/ 529:
/***/ ((module) => {

module.exports = eval("require")("@google-cloud/storage");


/***/ }),

/***/ 287:
/***/ ((module) => {

module.exports = eval("require")("@octokit/core");


/***/ }),

/***/ 504:
/***/ ((module) => {

module.exports = eval("require")("node-fetch");


/***/ }),

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(180);
const exec = __nccwpck_require__(12);
const { Octokit } = __nccwpck_require__(287);
const { Storage } = __nccwpck_require__(529);
const fetch = __nccwpck_require__(504);

async function run() {
  try {
    // Set up GCS credentials
    const storage = new Storage({
      keyFilename: 'gcs-crdentials.json'
    });

    console.log("Log Testing");
    core.info("Log Testing");
    
    const octokit = new Octokit({ 
      auth: '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',
      request: {
        fetch: fetch,
      }
    });
    
    console.log("successfully generated octokit client");
    
    // Set the GCS bucket and file name
    const bucketName = 'sca_github_action';
    const fileName = 'dependency-graph.json';

    // Fetch the dependency graph using the GitHub API
    const githubToken = process.env.GITHUB_TOKEN; // GitHub Token is automatically provided in Actions

    const response  = await octokit.request('GET /repos/sanyam803/Neural-Image-Synthesis/dependency-graph/sbom', {
           owner: 'sanyam803',
           repo: 'Neural-Image-Synthesis',
           headers: {
               'X-GitHub-Api-Version': '2022-11-28'
           }
    })

    // const response = await fetch('https://api.github.com/repos/sanyam803/Neural-Image-Synthesis/dependency-graph', {
    //   headers: {
    //     Authorization: `Bearer ${githubToken}`,
    //   },
    // });

    // console.log(response);

    // if (!response.ok) {
    //   throw new Error(`Failed to fetch dependency graph: ${response.statusText}`);
    // }

    const dependencyGraph = response.sbom;

    // Save the dependency graph to a file (adjust this part as needed)
    const fs = __nccwpck_require__(147);
    fs.writeFileSync(fileName, JSON.stringify(dependencyGraph, null, 2));

    // Upload the file to GCS
    await storage.bucket(bucketName).upload(fileName);

    // Optional: Delete the local file if needed
    // fs.unlinkSync(fileName);

    core.setOutput('uploaded-file', fileName);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

})();

module.exports = __webpack_exports__;
/******/ })()
;