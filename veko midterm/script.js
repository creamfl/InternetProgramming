// State variables for sorting and filtering
let sortColumn = "";
let sortAscending = true;
let authorsData = []; // Stores fetched data

// Helper function to calculate age
function calculateAge(birthDate, deathDate = null) {
  const birth = new Date(birthDate);
  const end = deathDate ? new Date(deathDate) : new Date();
  return end.getFullYear() - birth.getFullYear();
}

// Fetch authors from the API and populate filters
async function fetchAuthors() {
  try {
    const response = await fetch("https://raw.githubusercontent.com/sweko/uacs-internet-programming-exams/main/dry-run-mid-term-2024/data/authors.json");
    authorsData = await response.json();
    populateNationalityFilter(authorsData);
    displayAuthors(authorsData);
  } catch (error) {
    console.error("Error fetching authors:", error);
  }
}

// Populate nationality dropdown based on available nationalities in data
function populateNationalityFilter(authors) {
  const nationalities = [...new Set(authors.map(author => author.nationality))].sort();
  const nationalityFilter = document.getElementById("nationality-filter");
  nationalities.forEach(nationality => {
    const option = document.createElement("option");
    option.value = nationality;
    option.textContent = nationality;
    nationalityFilter.appendChild(option);
  });
}

// Function to create the bibliography summary
function summarizeBibliography(bibliography) {
  const summary = {};
  bibliography.forEach(book => {
    const { type } = book;
    summary[type] = (summary[type] || 0) + 1;
  });
  return Object.entries(summary)
    .map(([type, count]) => `${count} ${type}${count > 1 ? "s" : ""}`)
    .join(", ");
}

// Filter authors based on input criteria
function filterAuthors() {
  const nameFilter = document.getElementById("name-filter").value.toLowerCase();
  const nationalityFilter = document.getElementById("nationality-filter").value;
  const aliveFilter = document.getElementById("alive-filter").checked;

  return authorsData.filter(author => {
    const matchesName = author.name.toLowerCase().includes(nameFilter);
    const matchesNationality = nationalityFilter === "" || author.nationality === nationalityFilter;
    const matchesAlive = !aliveFilter || !author.death_date;
    return matchesName && matchesNationality && matchesAlive;
  });
}

// Sort authors based on the selected column
function sortAuthors(authors) {
  return authors.sort((a, b) => {
    let valueA, valueB;
    switch (sortColumn) {
      case "id":
        valueA = a.id;
        valueB = b.id;
        break;
      case "name":
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case "alive":
        valueA = a.death_date ? 1 : 0;
        valueB = b.death_date ? 1 : 0;
        break;
      case "age":
        valueA = calculateAge(a.birth_date, a.death_date);
        valueB = calculateAge(b.birth_date, b.death_date);
        break;
      case "nationality":
        valueA = a.nationality.toLowerCase();
        valueB = b.nationality.toLowerCase();
        break;
      case "bibliography":
        valueA = a.bibliography.length;
        valueB = b.bibliography.length;
        break;
      case "yearsActive":
        valueA = new Date(a.birth_date).getFullYear();
        valueB = new Date(b.birth_date).getFullYear();
        if (valueA === valueB) {
          const endA = a.death_date ? new Date(a.death_date).getFullYear() : new Date().getFullYear();
          const endB = b.death_date ? new Date(b.death_date).getFullYear() : new Date().getFullYear();
          return sortAscending ? endA - endB : endB - endA;
        }
        break;
      default:
        return 0;
    }
    return sortAscending ? (valueA < valueB ? -1 : 1) : (valueA > valueB ? -1 : 1);
  });
}

// Display authors in the DOM
function displayAuthors() {
  const container = document.getElementById("author-container");
  container.innerHTML = ""; // Clear existing content

  const filteredAuthors = filterAuthors();
  const sortedAuthors = sortAuthors(filteredAuthors);

  sortedAuthors.forEach(author => {
    const isAlive = !author.death_date;
    const age = calculateAge(author.birth_date, author.death_date);

    const authorRow = document.createElement("div");
    authorRow.className = "author-row";

    authorRow.innerHTML = `
      <div class="author-data">${author.id}</div>
      <div class="author-data">${author.name}</div>
      <div class="author-data"><input type="checkbox" ${isAlive ? "checked" : ""} disabled></div>
      <div class="author-data">${age}</div>
      <div class="author-data">${author.nationality}</div>
      <div class="author-data">${author.bibliography.length}</div>
      <div class="author-data">${summarizeBibliography(author.bibliography)}</div>
    `;

    container.appendChild(authorRow);
  });

  updateSortIndicators();
}

// Update the sort indicators (arrows) on headers
function updateSortIndicators() {
  const headers = document.querySelectorAll(".author-header span");
  headers.forEach(header => {
    const column = header.id.replace("sort-", "");
    header.textContent = column === sortColumn ? (sortAscending ? "↑" : "↓") : "sort";
  });
}

// Event listeners for sorting
document.getElementById("sort-id").addEventListener("click", () => setSort("id"));
document.getElementById("sort-name").addEventListener("click", () => setSort("name"));
document.getElementById("sort-alive").addEventListener("click", () => setSort("alive"));
document.getElementById("sort-age").addEventListener("click", () => setSort("age"));
document.getElementById("sort-nationality").addEventListener("click", () => setSort("nationality"));
document.getElementById("sort-bibliography").addEventListener("click", () => setSort("bibliography"));
document.getElementById("sort-yearsActive").addEventListener("click", () => setSort("yearsActive"));

// Event listeners for filtering
document.getElementById("name-filter").addEventListener("input", displayAuthors);
document.getElementById("nationality-filter").addEventListener("change", displayAuthors);
document.getElementById("alive-filter").addEventListener("change", displayAuthors);

// Set sorting column and toggle direction
function setSort(column) {
  sortAscending = (sortColumn === column) ? !sortAscending : true;
  sortColumn = column;
  displayAuthors();
}

// Initial fetch and display of authors
fetchAuthors();
