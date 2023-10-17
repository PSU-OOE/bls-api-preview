# bls-api-aws
This repository provides an ETL process for a lambda function.

## Updating the lambda
1. Sign into `login.aws.psu.edu`
2. Open the `worldcampus-bls-api` lambda function
3. Navigate to the `Code` tab
4. Click `Upload from` -> `.zip file`
5. Upload the latest `bls-aws-artifact.zip` file
6. Navigate to the `Test` tab
7. Optionally edit the Event JSON and click the `Test` button, confirm expectations
8. If testing passes, navigate to the `Versions` tab
9. Click `Publish new version` to make the new code live
