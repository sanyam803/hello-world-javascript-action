const core = require('@actions/core');
const exec = require('@actions/exec');
const { Octokit } = require("@octokit/core");
const { Storage } = require('@google-cloud/storage');
const fetch = require('node-fetch');
import fetch from "node-fetch";

async function run() {
  try {
    // Set up GCS credentials
    // const storage = new Storage({
    //   keyFilename: 'gcs-crdentials.json'
    // });

    console.log("Log Testing");
    core.info("Log Testing");
    
    const octokit = new Octokit({ 
      auth: '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'
    });
    const {
       data: { login },
    } = await octokit.rest.users.getAuthenticated();
    console.log("Hello, %s", login);
    core.info("Hello, %s", login);
    
    console.log("successfully generated octokit client");
    
    // Set the GCS bucket and file name
    // const bucketName = 'sca_github_action';
    // const fileName = 'dependency-graph.json';

    // // Fetch the dependency graph using the GitHub API
    // const githubToken = process.env.GITHUB_TOKEN; // GitHub Token is automatically provided in Actions

    // const response  = await octokit.request('GET /repos/sanyam803/Neural-Image-Synthesis/dependency-graph/sbom', {
    //        owner: 'sanyam803',
    //        repo: 'Neural-Image-Synthesis',
    //        headers: {
    //            'X-GitHub-Api-Version': '2022-11-28'
    //        }
    // })

    // const response = await fetch('https://api.github.com/repos/sanyam803/Neural-Image-Synthesis/dependency-graph', {
    //   headers: {
    //     Authorization: `Bearer ${githubToken}`,
    //   },
    // });

    // console.log(response);

    // if (!response.ok) {
    //   throw new Error(`Failed to fetch dependency graph: ${response.statusText}`);
    // }

    // const dependencyGraph = response.sbom;

    // // Save the dependency graph to a file (adjust this part as needed)
    // const fs = require('fs');
    // fs.writeFileSync(fileName, JSON.stringify(dependencyGraph, null, 2));

    // // Upload the file to GCS
    // await storage.bucket(bucketName).upload(fileName);

    // // Optional: Delete the local file if needed
    // // fs.unlinkSync(fileName);

    // core.setOutput('uploaded-file', fileName);
  } catch (error) {
    core.setFailed(error);
  }
}

run();
