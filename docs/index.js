
const jobTitles = new Array();
const jobOutlooks = new Array();
const programs = new Array();

function afterFetch(rawData) {
  const blsData = rawData;
  // console.log("BLS DATA (Unmodified)\n");
  // console.log(blsData);

  organizeData(blsData);

  generatePreview();
}

function organizeData(data) {

  // Populate program list
  for (jobTitleObject of data['job_titles']) {
    // .some() stops if query has been found, as opposed to .filter()
    if (!programs.some(program => program.prospectCode === jobTitleObject['prospect_code'])) {
      let newProgram = {
        'prospectCode': jobTitleObject['prospect_code'],
        'id': jobTitleObject['program_id'],
        'name': jobTitleObject['program_name'],
        'jobTitles': [],
        'jobOutlooks': []
      };
      programs.push(newProgram);
    }
  }

  // Populate program job titles
  for (jobTitleObject of data['job_titles']) {
    let newTitle = jobTitleObject['job_titles'];
    let targetProgramIndex = programs.findIndex(program => program.prospectCode === jobTitleObject['prospect_code']);
    if (targetProgramIndex > -1) {
      programs[targetProgramIndex]['jobTitles'].push(newTitle);
    } else {
      console.warn("Program not found for job title: " + JSON.stringify(jobTitleObject));
    }
  }

  // Populate program job outlooks
  for (jobOutlooksObject of data['job_outlooks']) {
    let newOutlook = jobOutlooksObject;
    let targetProgramIndex = programs.findIndex(program => program.prospectCode === jobOutlooksObject['prospect_code']);
    if (targetProgramIndex > -1) {
      programs[targetProgramIndex]['jobOutlooks'].push(newOutlook);
    } else {
      console.warn("Program not found for job outlook: " + JSON.stringify(jobOutlooksObject));
    }
  }
}

// Generate the HTML
function generatePreview() {
  const dataContainer = document.querySelector("#bls-data-container");
  const programTemplate = document.querySelector("#program-template");
  const outlookTemplate = document.querySelector("#outlook-template");

  // console.log("PROGRAMS DATA\n");
  // console.log(programs);

  // TODO: Add sorting or sort differently? Currently sorts by prospect code.
  for (program of programs) {
    let pClone = programTemplate.content.cloneNode(true);

    pClone.querySelector(".program-name").innerHTML = program.name;

    // Add job titles.
    let jobTitlesHTML = "";
    if (program.jobTitles.length !== 0) {
      jobTitlesHTML += "<ul>";
      for (jobTitle of program.jobTitles) {
        jobTitlesHTML += "<li>" + jobTitle + "</li>";
      }
      jobTitlesHTML += "</ul>";
    } else {
      jobTitlesHTML += "<p>No data</p>";
    }
    pClone.querySelector(".job-titles").innerHTML = jobTitlesHTML;

    // Add job outlooks.
    if (program.jobOutlooks.length !== 0) {
      for (jobOutlook of program.jobOutlooks) {
        let oClone = outlookTemplate.content.cloneNode(true);
        oClone.querySelector(".outlook__title").innerHTML = jobOutlook.occ_title;
        // TODO: Add classing for positive/negative employment change.
        oClone.querySelector(".outlook__employment-percentage").innerHTML = (jobOutlook.employment_change * 100) + "%";
        oClone.querySelector(".outlook__employment-total-number").innerHTML = jobOutlook.tot_emp;
        pClone.querySelector(".job-outlooks").appendChild(oClone);
      }
    } else {
      pClone.querySelector(".job-outlooks").innerHTML = "<p>No data</p>";
    }

    dataContainer.appendChild(pClone);
  }
}

fetch('https://c2ph2zsqstfi4ooh2qebcxyr7y0eacwh.lambda-url.us-east-1.on.aws?' + new URLSearchParams({
  environment: 'non-prod'
}))
  .then(response => response.json())
  .then(rawData => afterFetch(rawData));
