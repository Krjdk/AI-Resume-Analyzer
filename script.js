const modeToggle = document.getElementById('modeToggle');
const uploadLink = document.getElementById('uploadLink');
const resumeInput = document.getElementById('resumeInput');
const uploadArea = document.getElementById('uploadArea');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const atsScoreEl = document.getElementById('atsScore');
const atsBar = document.getElementById('atsBar');

modeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

uploadLink.addEventListener('click', e => {
  e.preventDefault();
  resumeInput.click();
});
uploadArea.addEventListener('dragover', e => e.preventDefault());
uploadArea.addEventListener('drop', e => {
  e.preventDefault();
  resumeInput.files = e.dataTransfer.files;
  handleFile();
});
resumeInput.addEventListener('change', handleFile);

async function handleFile() {
  const file = resumeInput.files[0];
  if (!file) return;

  loading.classList.remove('hidden');
  results.classList.add('hidden');

  const text = await extractText(file);

  const analysis = await analyzeResumeWithAI(text);

  displayResults(analysis);
  loading.classList.add('hidden');
  results.classList.remove('hidden');
}

async function extractText(file) {
  return `Sample extracted text from ${file.name}`;
}

async function analyzeResumeWithAI(resumeText) {
  const apiKey = "AIzaSyC5EpLrK2zn4Q2lxT1cQmxA38gliYSqQqw"; 
  const apiUrl = "https://api.openai.com/v1/chat/completions";

  const prompt = `
You are an ATS resume analyzer.

Analyze the following resume for:
1. ATS compatibility score (0–100)
2. Skill match percentage
3. Missing keywords
4. Weak sections
5. Improvement suggestions
6. Recommended skills to add

Format the output in clean sections.

Resume Text:
${resumeText}
  `;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4-turbo", 
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content || "Error: No response";
    return aiText;
  } catch (err) {
    console.error(err);
    return "Error analyzing resume.";
  }
}

function displayResults(aiText) {
  const scoreMatch = aiText.match(/(\d{1,3})/);
  const score = scoreMatch ? parseInt(scoreMatch[0]) : Math.floor(Math.random() * 41) + 60;

  atsScoreEl.textContent = score;
  atsBar.style.width = `${score}%`;

  document.getElementById('strengthsList').innerHTML = `<li>${aiText.replace(/\n/g, "<br>")}</li>`;
  document.getElementById('weaknessesList').innerHTML = `<li>AI-detected issues will appear here</li>`;
  document.getElementById('missingSkillsList').innerHTML = `<li>AI-suggested keywords will appear here</li>`;
  document.getElementById('suggestionsList').innerHTML = `<li>AI improvement recommendations</li>`;
}

document.getElementById('downloadReport').addEventListener('click', () => {
  const blob = new Blob(
    ["AI Resume Analysis Report\nScore: " + atsScoreEl.textContent],
    { type: "text/plain" }
  );
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = "AI_Resume_Report.txt";
  link.click();
});
