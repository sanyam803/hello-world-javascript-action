# GitHub Action for SCA Analysis.

This action scans the target respository and extracts the dependency file for the same and eventually comes up with a list of depenendency both direct and transitive. Further, this list of dependencies is saved to a GCP bucket. Also this SBOM(dependency list) is used to generate the list of vunerabilities present in the package. This VAX file is finally available to the client in their GCP bucket. 

## Inputs

### `gcs_credentials`

**Required** Service Account Credential for the GCP Account.

### `repo-token`

**Required** GitHub Token for accessing contents of the repository.

### `owner`

**Required** Repository Owner Name.

### `repoName`

**Required** Name of the Repo to be scanned.



