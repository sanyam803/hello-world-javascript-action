const core = require('@actions/core');
const exec = require('@actions/exec');
const { Octokit } = require("@octokit/core");
const { Storage } = require('@google-cloud/storage');
const fetch = require('node-fetch');

/**
 * Self Invoking function that runs core logic of the plugin.
 */
async function invokePlugin() {
  try {
    const gcs_credentials = core.getInput('gcs_credentials');
    const owner = core.getInput('owner');
    const repoName = core.getInput('repoName');
    const fs = require('fs');
    
    fs.writeFileSync('gcs-credentials.json', gcs_credentials);
    fetchSBOM(owner, repoName);
  } catch (error) {
    core.setFailed(error.message);
  }
}

/**
 * Fetch SBOM of the Repository.
 * @param {string} owner : repo owner.
 * @param {string} repoName : name of repo.
 * @return {!Object} sbom : SBOM of the repo generated using GitHub API.
 */
async function fetchSBOM(owner, repoName) {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
    request: {
      fetch: fetch,
    }
  });
  await exec.exec('terraform init');
  const response  = await octokit.request("GET /repos/" + owner + "/" + 
    repoName", {
    owner: owner,
    repo: repoName,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
  }});
  if(response == null) {
    throw "Failed to Fetch SBOM";
  }
  console.log(response);
  console.log(response.data);
  return response.data;
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
  await exec.exec('sudo yum install -y yum-utils');
}

invokePlugin();
