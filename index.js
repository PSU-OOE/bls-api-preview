const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });
const xlsx = require('xlsx');

exports.handler = async (event) => {
  const environment = event.queryStringParameters.environment;
  const program_code = event.queryStringParameters.program_code;

  // Fetch the excel file from the appropriate S3 bucket.
  const file = await s3.getObject({ Bucket: 'worldcampus-bls-api/' + environment, Key: 'bls-data.xlsx' }).promise();

  // Read all data from the excel file.
  const workbook = xlsx.read(file.Body);

  // Get the individual sheets for each data source.
  const all_job_outlooks = xlsx.utils.sheet_to_json(workbook.Sheets['Employment']);
  const all_job_titles = xlsx.utils.sheet_to_json(workbook.Sheets['Job Titles']);

  // Remove all data except the program we're looking for.
  const filtered_job_outlooks = all_job_outlooks.filter(row => row.prospect_code === program_code);
  const filtered_job_titles = all_job_titles.filter(row => row.prospect_code === program_code);

  // Reduce the job titles data structure to something more usable.
  const reduced_job_titles = filtered_job_titles.reduce((accumulator, current) => accumulator.concat([current['job_titles']]), []);

  // Filter out any unnecessary outlooks information.
  filtered_job_outlooks.forEach(outlook => {
    for (const property in outlook) {
      if (property !== 'occ_title' && property !== 'tot_emp' && property !== 'employment_change') {
        delete outlook[property];
      }
    }
  });

  return {
    statusCode: 200,
    body: {
      job_outlooks: filtered_job_outlooks,
      job_titles: reduced_job_titles,
    }
  };

};
