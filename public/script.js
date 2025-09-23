// Sample job data (replace with backend fetch if needed)
const jobs = [
	{
		id: 1,
		title: 'Software Engineer',
		company: 'Google',
		category: 'IT',
		location: 'San Francisco, CA',
		salary: 150000
	},
	{
		id: 2,
		title: 'UI/UX Designer',
		company: 'Apple',
		category: 'Design',
		location: 'Cupertino, CA',
		salary: 130000
	},
	{
		id: 3,
		title: 'Business Analyst',
		company: 'Accenture',
		category: 'Business',
		location: 'New York, NY',
		salary: 110000
	},
	{
		id: 4,
		title: 'Cloud Solutions Architect',
		company: 'Microsoft',
		category: 'IT',
		location: 'Redmond, WA',
		salary: 160000
	},
	{
		id: 5,
		title: 'Operations Manager',
		company: 'Amazon',
		category: 'Management',
		location: 'Seattle, WA',
		salary: 140000
	}
];

// Render filter controls
function renderFilters() {
	const container = document.querySelector('.job-listings .container');
	const filterDiv = document.createElement('div');
	filterDiv.className = 'job-filters';
	filterDiv.innerHTML = `
		<select id="filterCategory">
			<option value="">All Categories</option>
			<option value="IT">IT</option>
			<option value="Design">Design</option>
			<option value="Business">Business</option>
			<option value="Management">Management</option>
		</select>
		<select id="filterLocation">
			<option value="">All Locations</option>
			<option value="San Francisco, CA">San Francisco, CA</option>
			<option value="Cupertino, CA">Cupertino, CA</option>
			<option value="New York, NY">New York, NY</option>
			<option value="Redmond, WA">Redmond, WA</option>
			<option value="Seattle, WA">Seattle, WA</option>
		</select>
		<select id="filterSalary">
			<option value="">All Salaries</option>
			<option value="100000">$100,000+</option>
			<option value="120000">$120,000+</option>
			<option value="140000">$140,000+</option>
			<option value="160000">$160,000+</option>
		</select>
		<button id="filterBtn" class="btn btn-success">Filter</button>
	`;
	container.insertBefore(filterDiv, container.children[1]);
}

// Render jobs
function renderJobs(jobsToRender) {
	const jobsContainer = document.getElementById('jobsContainer');
	jobsContainer.innerHTML = '';
	if (!jobsToRender.length) {
		jobsContainer.innerHTML = '<p style="text-align:center;">No jobs found.</p>';
		return;
	}
	jobsToRender.forEach(job => {
		const card = document.createElement('div');
		card.className = 'job-card fade-in';
		card.innerHTML = `
			<div class="job-header">
				<div class="job-title">${job.title}</div>
				<div class="job-company">${job.company}</div>
			</div>
			<div class="job-details">
				<div class="job-detail"><i class="fas fa-briefcase"></i> ${job.category}</div>
				<div class="job-detail"><i class="fas fa-map-marker-alt"></i> ${job.location}</div>
				<div class="job-detail"><i class="fas fa-dollar-sign"></i> $${job.salary.toLocaleString()}</div>
			</div>
			<div class="job-apply">
				<a href="job.html?company=${encodeURIComponent(job.company)}&role=${encodeURIComponent(job.title)}" class="btn btn-success">Apply</a>
			</div>
		`;
		jobsContainer.appendChild(card);
	});
}

// Filter jobs
function filterJobs() {
	const cat = document.getElementById('filterCategory').value;
	const loc = document.getElementById('filterLocation').value;
	const sal = document.getElementById('filterSalary').value;
	let filtered = jobs;
	if (cat) filtered = filtered.filter(j => j.category === cat);
	if (loc) filtered = filtered.filter(j => j.location === loc);
	if (sal) filtered = filtered.filter(j => j.salary >= parseInt(sal));
	renderJobs(filtered);
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
	renderFilters();
	renderJobs(jobs);
	document.getElementById('filterBtn').addEventListener('click', filterJobs);
});
