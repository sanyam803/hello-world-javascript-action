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
    const path = require('path');
    
    fs.writeFileSync('gcs-credentials.json', gcs_credentials);
    fetchSBOM(owner, repoName, path);
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
async function fetchSBOM(owner, repoName, path) {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
    request: {
      fetch: fetch,
    }
  });
  await exec.exec('terraform init');
  const response  = await octokit.rest.repos.getContent({
    owner,
    repoName,
    path,
  });
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
