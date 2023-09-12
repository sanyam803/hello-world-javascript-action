const core = require('@actions/core');
const exec = require('@actions/exec');
const { Octokit } = require("@octokit/core");
const { Storage } = require('@google-cloud/storage');
const fetch = require('node-fetch');

async function run() {
  try {
    const gcs_credentials = core.getInput('gcs_credentials');
    const fs = require('fs');
    fs.writeFileSync('gcs-credentials.json', gcs_credentials)	  
    console.log(gcs_credentials)  
    // Set up GCS credentials
    const storage = new Storage({
      keyFilename: 'gcs-credentials.json'
    });

    console.log("Log Testing");
    core.info("Log Testing");
	  
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

    //console.log(response);

    // if (!response.ok) {
    //   throw new Error(`Failed to fetch dependency graph: ${response.statusText}`);
    // }

    const dependencyGraph = response.data.sbom;

    console.log(dependencyGraph)	  
    // Save the dependency graph to a file (adjust this part as needed)
    // const fs = require('fs');
    fs.writeFileSync(fileName, JSON.stringify(dependencyGraph, null, 2));

    // Upload the file to GCS
    await storage.bucket(bucketName).upload(fileName);

    await exec.exec('rm -rf /usr/local/go && tar -C /usr/local -xzf go1.21.1.linux-amd64.tar.gz');
    await exec.exec('export PATH=$PATH:/usr/local/go/bin')	
    await exec.exec('go version')
    await exec.exec('go install github.com/google/osv-scanner/cmd/osv-scanner@v1')	  
    await exec.exec('osv-scanner --sbom=dependency-graph.json > vulnerabilities.json');
    await storage.bucket(bucketName).upload(vulnerabilities.json);
    // Optional: Delete the local file if needed
    // fs.unlinkSync(fileName);

    core.setOutput('uploaded-file', fileName);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
