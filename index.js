const core = require('@actions/core');
const exec = require('@actions/exec');
const { Octokit } = require("@octokit/core");
const { Storage } = require('@google-cloud/storage');
const fetch = require('node-fetch');

/**
 * Self Invoking function that runs core logic of the plugin.
 */
async function run() {
  try {
    const gcs_credentials = core.getInput('gcs_credentials');
    const owner = core.getInput('owner');
    const repoName = core.getInput('repoName');
    const fs = require('fs');

    fs.writeFileSync('gcs-credentials.json', gcs_credentials);

    const storage = new Storage({
      keyFilename: 'gcs-credentials.json'
    });
    const bucketName = 'sca_github_action';
    const fileName = 'dependency-graph.json';

    const dependencyGraph  = fetchSBOM(octokit, owner, repoName);

    // Save the dependency graph to a file (adjust this part as needed)
    fs.writeFileSync(fileName, JSON.stringify(dependencyGraph, null, 2));
    await storage.bucket(bucketName).upload(fileName);

    installOSVScanner();

    // Scan the SBOM and produce a VAX file.
    await exec.exec('osv-scanner --sbom=dependency-graph.json > vulnerabilities.json');

    await storage.bucket(bucketName).upload(vulnerabilities.json);
    core.setOutput('uploaded-file', fileName);
  } catch (error) {
    core.setFailed(error.message);
  }
}

/**
 * Fetch SBOM of the Repo.
 * @param {string} owner
 * @param {string} repoName
 * @return {?Object} sbom
 */
async function fetchSBOM(owner, repoName) {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
    request: {
      fetch: fetch,
    }
  });
  const response  = await octokit.request("GET /repos/" + owner + "/" + repoName + "/dependency-graph/sbom", {
    owner: owner,
    repo: repoName,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
  }});
  if(response == null) {
    throw "invalid response";
  }
  return response.data.sbom;
}

/**
 * Install OSV Scanner.
 */
async function installOSVScanner() {
  // Install go on the VM
  await exec.exec('rm -rf /usr/local/go && tar -C /usr/local -xzf go1.21.1.linux-amd64.tar.gz');
  await exec.exec('export PATH=$PATH:/usr/local/go/bin');
  await exec.exec('go version');

  // Install OSV Scanner on the VM
  await exec.exec('go install github.com/google/osv-scanner/cmd/osv-scanner@v1');
}

run();
