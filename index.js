const core = require('@actions/core');
const exec = require('@actions/exec');
const { Octokit } = require("@octokit/core");
const { Storage } = require('@google-cloud/storage');
const fetch = require('node-fetch');

async function run() {
  try {
    const gcs_credentials = core.getInput('gcs_credentials');
    const owner = core.getInput('owner');	  
    const repoName = core.getInput('repoName');
    const fs = require('fs');
    fs.writeFileSync('gcs-credentials.json', gcs_credentials)	  
    console.log(gcs_credentials)  
    // Set up GCS credentials
    const storage = new Storage({
      keyFilename: 'gcs-credentials.json'
    });

    const octokit = new Octokit({ 
      auth: process.env.GITHUB_TOKEN,
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

    // Fetch SBOM for the the requesting package 
    const response  = await octokit.request("GET /repos/" + owner + "/" + repoName + "/dependency-graph/sbom", {
           owner: owner,
           repo: repoName, 
           headers: {
               'X-GitHub-Api-Version': '2022-11-28'
           }
    })
	
    const dependencyGraph = response.data.sbom;

    console.log(dependencyGraph)	  
    // Save the dependency graph to a file (adjust this part as needed)
    fs.writeFileSync(fileName, JSON.stringify(dependencyGraph, null, 2));

    // Upload the file to GCS
    await storage.bucket(bucketName).upload(fileName);

    // Install go on the VM 	
    await exec.exec('rm -rf /usr/local/go && tar -C /usr/local -xzf go1.21.1.linux-amd64.tar.gz');
    await exec.exec('export PATH=$PATH:/usr/local/go/bin')	
    await exec.exec('go version')

    // Install OSV Scanner on the VM 	
    await exec.exec('go install github.com/google/osv-scanner/cmd/osv-scanner@v1')	

    // Scan the SBOM and produce a VAX file. 	
    await exec.exec('osv-scanner --sbom=dependency-graph.json > vulnerabilities.json');

    // Store the file in a GCP bucket.	
    await storage.bucket(bucketName).upload(vulnerabilities.json);
    // Optional: Delete the local file if needed
    // fs.unlinkSync(fileName);

    core.setOutput('uploaded-file', fileName);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
