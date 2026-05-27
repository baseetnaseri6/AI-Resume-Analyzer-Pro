if(localStorage.getItem("loggedIn") !== "true"){
  window.location.href = "index.html";
}

/* ELEMENTS */
const themeBtn = document.getElementById("themeBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");

const uploadForm = document.getElementById("uploadForm");
const resumeFile = document.getElementById("resumeFile");
const loadingBox = document.getElementById("loadingBox");
const resultText = document.getElementById("resultText");

const totalUploads = document.getElementById("totalUploads");
const scoreNumber = document.getElementById("scoreNumber");
const atsNumber = document.getElementById("atsNumber");
const levelText = document.getElementById("levelText");
const levelMessage = document.getElementById("levelMessage");
const salaryRange = document.getElementById("salaryRange");
const profileLevel = document.getElementById("profileLevel");

const copyBtn = document.getElementById("copyBtn");
const exportBtn = document.getElementById("exportBtn");
const clearBtn = document.getElementById("clearBtn");

const jobMatchForm = document.getElementById("jobMatchForm");
const jobResumeFile = document.getElementById("jobResumeFile");
const jobDescription = document.getElementById("jobDescription");
const jobMatchResult = document.getElementById("jobMatchResult");

const rewriteForm = document.getElementById("rewriteForm");
const rewriteFile = document.getElementById("rewriteFile");
const rewriteResult = document.getElementById("rewriteResult");

const interviewForm = document.getElementById("interviewForm");
const interviewFile = document.getElementById("interviewFile");
const interviewResult = document.getElementById("interviewResult");

const roadmapForm = document.getElementById("roadmapForm");
const roadmapFile = document.getElementById("roadmapFile");
const targetRole = document.getElementById("targetRole");
const roadmapResult = document.getElementById("roadmapResult");

const historyList = document.getElementById("historyList");

let uploadCount = Number(localStorage.getItem("uploadCount")) || 0;

userName.textContent = localStorage.getItem("full_name") || "Demo User";
totalUploads.textContent = uploadCount;

/* HELPERS */
function getLevel(score){
  if(score >= 90){
    return ["Expert", "Excellent! Your CV is strong and ready for high-quality applications."];
  }

  if(score >= 80){
    return ["Advanced", "Great! Your CV is strong, but you can improve ATS keywords and measurable achievements."];
  }

  if(score >= 65){
    return ["Intermediate", "Good start. Add stronger projects, results, and job-specific keywords."];
  }

  return ["Beginner", "Your CV needs better structure, stronger skills, projects, and clear experience."];
}

function showSection(sectionId){
  document.querySelectorAll(".page-section").forEach(section => {
    section.classList.remove("active-section");
  });

  document.getElementById(sectionId).classList.add("active-section");

  document.querySelectorAll(".menu li").forEach(item => {
    item.classList.remove("active");
  });

  document.querySelector(`.menu li[data-section="${sectionId}"]`).classList.add("active");
}

function saveHistory(title, score, content){
  const history = JSON.parse(localStorage.getItem("resumeHistory")) || [];

  history.unshift({
    title,
    score,
    date:new Date().toLocaleString(),
    content:content.slice(0, 260)
  });

  localStorage.setItem("resumeHistory", JSON.stringify(history.slice(0, 10)));
  renderHistory();
}

function renderHistory(){
  const history = JSON.parse(localStorage.getItem("resumeHistory")) || [];

  if(history.length === 0){
    historyList.innerHTML = `<p class="muted">No history yet.</p>`;
    return;
  }

  historyList.innerHTML = history.map(item => `
    <div class="history-item">
      <h4>${item.title}</h4>
      <p><strong>Score:</strong> ${item.score || "--"} | <strong>Date:</strong> ${item.date}</p>
      <p>${item.content}...</p>
    </div>
  `).join("");
}

function setLoading(element, message){
  element.textContent = message;
}

async function postFile(url, file, extraData = {}){
  const formData = new FormData();
  formData.append("file", file);

  Object.keys(extraData).forEach(key => {
    formData.append(key, extraData[key]);
  });

  const response = await fetch(url, {
    method:"POST",
    body:formData
  });

  return await response.json();
}

/* NAVIGATION */
document.querySelectorAll(".menu li").forEach(item => {
  item.addEventListener("click", () => {
    showSection(item.dataset.section);
  });
});

/* THEME */
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");

  themeBtn.innerHTML = document.body.classList.contains("light-mode")
    ? `<i class="bi bi-sun-fill"></i>`
    : `<i class="bi bi-moon-stars-fill"></i>`;
});

/* LOGOUT */
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("loggedIn");
  window.location.href = "index.html";
});

/* CHARTS */
const scoreChart = new ApexCharts(document.querySelector("#resumeScoreChart"), {
  chart:{ type:"radialBar", height:270 },
  series:[0],
  labels:["Resume Score"],
  colors:["#ff7a18"],
  plotOptions:{
    radialBar:{
      hollow:{ size:"62%" },
      dataLabels:{
        name:{ color:"#f8fafc", fontSize:"14px", fontWeight:800 },
        value:{
          color:"#ff7a18",
          fontSize:"38px",
          fontWeight:900,
          formatter:(val)=> Math.round(val)+"%"
        }
      }
    }
  }
});
scoreChart.render();

const skillsChart = new ApexCharts(document.querySelector("#skillsChart"), {
  chart:{ type:"bar", height:270, toolbar:{ show:false } },
  series:[
    {
      name:"Score",
      data:[0,0,0,0]
    }
  ],
  colors:["#ff7a18"],
  plotOptions:{
    bar:{
      borderRadius:4,
      columnWidth:"50%"
    }
  },
  xaxis:{
    categories:["Resume","ATS","Keywords","Job Fit"],
    labels:{ style:{ colors:"#f8fafc" } }
  },
  yaxis:{
    labels:{ style:{ colors:"#f8fafc" } }
  },
  grid:{
    borderColor:"rgba(255,255,255,.15)"
  }
});
skillsChart.render();

renderHistory();

/* RESUME ANALYZER */
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = resumeFile.files[0];

  if(!file){
    alert("Please upload a PDF resume.");
    return;
  }

  loadingBox.classList.remove("d-none");
  resultText.textContent = "Analyzing resume with Ollama AI...";
  showSection("upload");

  try{
    const data = await postFile(
      "http://localhost:8000/analyze-resume",
      file
    );

    if(!data.success){
      alert(data.error || "Analysis failed.");
      loadingBox.classList.add("d-none");
      return;
    }

    const score = data.score || 85;
    const ats = data.ats_score || 78;
    const [level, message] = getLevel(score);

    uploadCount++;
    localStorage.setItem("uploadCount", uploadCount);

    totalUploads.textContent = uploadCount;
    scoreNumber.textContent = score + "%";
    atsNumber.textContent = ats + "%";
    levelText.textContent = level;
    levelMessage.textContent = message;
    salaryRange.textContent = data.salary_range || "Salary prediction unavailable";
    profileLevel.textContent = level + " Level";

    scoreChart.updateSeries([score]);

    skillsChart.updateSeries([
      {
        name:"Score",
        data:[score, ats, Math.max(60, ats - 5), Math.max(65, score - 8)]
      }
    ]);

    const report =
`CAREER LEVEL: ${level}
RESUME SCORE: ${score}%
ATS SCORE: ${ats}%
SALARY PREDICTION: ${data.salary_range}

${data.analysis}`;

    resultText.textContent = report;

    saveHistory("Resume Analysis - " + data.filename, score + "%", report);

  }catch(error){
    alert("Backend not connected. Run: uvicorn main:app --reload");
  }

  loadingBox.classList.add("d-none");
});

/* JOB MATCHER */
jobMatchForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = jobResumeFile.files[0];

  if(!file){
    alert("Upload your CV first.");
    return;
  }

  jobMatchResult.textContent = "Matching your CV with job description...";

  const formData = new FormData();
  formData.append("resume_file", file);
  formData.append("job_description", jobDescription.value);

  try{
    const response = await fetch("http://localhost:8000/match-job", {
      method:"POST",
      body:formData
    });

    const data = await response.json();

    const result =
`JOB MATCH SCORE: ${data.match_score}%

${data.result}`;

    jobMatchResult.textContent = result;
    saveHistory("Job Match Report", data.match_score + "%", result);

  }catch(error){
    alert("Backend not connected.");
  }
});

/* CV REWRITER */
rewriteForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = rewriteFile.files[0];

  if(!file){
    alert("Upload your CV first.");
    return;
  }

  rewriteResult.textContent = "Rewriting your CV professionally...";

  try{
    const data = await postFile(
      "http://localhost:8000/rewrite-cv",
      file
    );

    rewriteResult.textContent = data.rewritten_cv || "No result.";
    saveHistory("CV Rewrite", "--", data.rewritten_cv || "");

  }catch(error){
    alert("Backend not connected.");
  }
});

/* INTERVIEW QUESTIONS */
interviewForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = interviewFile.files[0];

  if(!file){
    alert("Upload your CV first.");
    return;
  }

  interviewResult.textContent = "Generating interview questions...";

  try{
    const data = await postFile(
      "http://localhost:8000/interview-questions",
      file
    );

    interviewResult.textContent = data.questions || "No questions generated.";
    saveHistory("Interview Questions", "--", data.questions || "");

  }catch(error){
    alert("Backend not connected.");
  }
});

/* CAREER ROADMAP */
roadmapForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = roadmapFile.files[0];

  if(!file){
    alert("Upload your CV first.");
    return;
  }

  roadmapResult.textContent = "Generating career roadmap...";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("target_role", targetRole.value);

  try{
    const response = await fetch("http://localhost:8000/career-roadmap", {
      method:"POST",
      body:formData
    });

    const data = await response.json();

    roadmapResult.textContent = data.roadmap || "No roadmap generated.";
    saveHistory("Career Roadmap: " + targetRole.value, "--", data.roadmap || "");

  }catch(error){
    alert("Backend not connected.");
  }
});

/* COPY */
copyBtn.addEventListener("click", async () => {
  const text = resultText.textContent;

  if(!text || text.includes("Upload your resume")){
    alert("No report to copy yet.");
    return;
  }

  await navigator.clipboard.writeText(text);
  alert("Report copied.");
});

/* EXPORT PDF */
exportBtn.addEventListener("click", () => {
  const text = resultText.textContent;

  if(!text || text.includes("Upload your resume")){
    alert("No report to export yet.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("AI Resume Analysis Report", 14, 20);

  doc.setFontSize(11);
  const lines = doc.splitTextToSize(text, 180);
  doc.text(lines, 14, 35);

  doc.save("AI-Resume-Report.pdf");
});

/* CLEAR */
clearBtn.addEventListener("click", () => {
  resultText.textContent = "Upload your resume to see the full report.";
});