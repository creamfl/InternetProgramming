type Book = {
  name: string;
  year: number;
  type: "Novel" | "Novella" | "Non-Fiction" | "Collection" | "Graphic Novel";
};

type Author = {
  id: number;
  name: string;
  birth_date: string;
  death_date?: string;
  nationality: string;
  bibliography: Book[];
};

let authorsData: Author[] = []; // Store all authors for filtering and sorting
let sortField: keyof Author | "years_active" | "bibliography" = "id";
let sortDirection: "asc" | "desc" = "asc";

// Fetch authors and initialize
const fetchAuthors = async (): Promise<void> => {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/sweko/uacs-internet-programming-exams/main/dry-run-mid-term-2024/data/authors.json"
    );
    authorsData = await response.json();
    populateNationalities(authorsData);
    renderAuthors(authorsData); // Render the initial list
  } catch (error) {
    console.error("Failed to load authors:", error);
  }
};

// Helper function to toggle sort direction
const toggleSortDirection = () => {
  sortDirection = sortDirection === "asc" ? "desc" : "asc";
};

// Sorting function
const sortAuthors = (authors: Author[]): Author[] => {
  return authors.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case "id":
      case "name":
      case "nationality":
        aValue = a[sortField];
        bValue = b[sortField];
        break;
      case "birth_date":
        aValue = new Date(a.birth_date).getTime();
        bValue = new Date(b.birth_date).getTime();
        break;
      case "bibliography":
        aValue = a.bibliography.length;
        bValue = b.bibliography.length;
        break;
      case "years_active":
        aValue = parseInt(getYearsActive(a.bibliography).split(" - ")[0]);
        bValue = parseInt(getYearsActive(b.bibliography).split(" - ")[0]);
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
};

// Helper functions
const calculateAge = (birthDate: string, deathDate?: string): number => {
  const birth = new Date(birthDate);
  const end = deathDate ? new Date(deathDate) : new Date();
  const age = end.getFullYear() - birth.getFullYear();
  return end.getMonth() < birth.getMonth() ||
    (end.getMonth() === birth.getMonth() && end.getDate() < birth.getDate())
    ? age - 1
    : age;
};

const getYearsActive = (bibliography: Book[], deathDate?: string): string => {
  const years = bibliography.map((book) => book.year);
  const startYear = Math.min(...years);
  const endYear = deathDate
    ? new Date(deathDate).getFullYear()
    : Math.max(...years) >= new Date().getFullYear() - 2
    ? "present"
    : Math.max(...years);
  return `${startYear} - ${endYear}`;
};

const summarizeBibliography = (bibliography: Book[]): string => {
  const counts = bibliography.reduce(
    (acc: { [key: string]: number }, book: Book) => {
      acc[book.type] = (acc[book.type] || 0) + 1;
      return acc;
    },
    {}
  );

  return Object.entries(counts)
    .map(([type, count]) => `${count} ${type}${count > 1 ? "s" : ""}`)
    .join(", ");
};

// Populate nationalities for the filter dropdown
const populateNationalities = (authors: Author[]): void => {
  const nationalities = Array.from(
    new Set(authors.map((author) => author.nationality))
  ).sort();
  const dropdown = document.getElementById(
    "filter-nationality"
  ) as HTMLSelectElement;
  dropdown.innerHTML = '<option value="">All Nationalities</option>'; // Reset options

  nationalities.forEach((nationality) => {
    const option = document.createElement("option");
    option.value = nationality;
    option.textContent = nationality;
    dropdown.appendChild(option);
  });
};

// Filtering function
const filterAuthors = (): Author[] => {
  const nameFilter = (
    document.getElementById("filter-name") as HTMLInputElement
  ).value.toLowerCase();
  const nationalityFilter = (
    document.getElementById("filter-nationality") as HTMLSelectElement
  ).value;
  const aliveFilter = (
    document.getElementById("filter-alive") as HTMLInputElement
  ).checked;
  const yearActiveFilter = parseInt(
    (document.getElementById("filter-year-active") as HTMLInputElement).value
  );

  return authorsData.filter((author) => {
    const matchesName = author.name.toLowerCase().includes(nameFilter);
    const matchesNationality =
      !nationalityFilter || author.nationality === nationalityFilter;
    const matchesAlive = !aliveFilter || (aliveFilter && !author.death_date);
    const matchesYearActive =
      isNaN(yearActiveFilter) ||
      author.bibliography.some((book) => book.year === yearActiveFilter);

    return (
      matchesName && matchesNationality && matchesAlive && matchesYearActive
    );
  });
};

// Render authors with sorting and filtering applied
const renderAuthors = (authors: Author[]): void => {
  const container = document.getElementById("author-container") as HTMLElement;
  container.innerHTML = ""; // Clear existing content

  // Sort authors
  const sortedAuthors = sortAuthors(authors);

  sortedAuthors.forEach((author) => {
    const age = calculateAge(author.birth_date, author.death_date);
    const yearsActive = getYearsActive(author.bibliography, author.death_date);
    const bibliographySummary = summarizeBibliography(author.bibliography);

    const row = document.createElement("div");
    row.classList.add("author-row");
    row.innerHTML = `
      <div class="author-data">${author.id}</div>
      <div class="author-data">${author.name}</div>
      <div class="author-data">${
        new Date(author.birth_date).toISOString().split("T")[0]
      }</div>
      <div class="author-data"><input type="checkbox" disabled ${
        !author.death_date ? "checked" : ""
      }></div>
      <div class="author-data">${age}</div>
      <div class="author-data">${author.nationality}</div>
      <div class="author-data"><a href="#" class="bibliography-link">${bibliographySummary}</a></div>
      <div class="author-data">${yearsActive}</div>
    `;
    container.appendChild(row);
  });

  updateSortIndicators();
};

// Update sort indicators
const updateSortIndicators = () => {
  document.querySelectorAll(".author-header").forEach((header) => {
    const field = (header as HTMLElement).dataset.field;
    const span = header.querySelector("span");
    if (field === sortField) {
      span!.textContent = sortDirection === "asc" ? "↑" : "↓";
      header.classList.add("sorted");
    } else {
      span!.textContent = "↑↓";
      header.classList.remove("sorted");
    }
  });
};

// Render filtered authors
const renderFilteredAuthors = () => {
  const filteredAuthors = filterAuthors();
  renderAuthors(filteredAuthors);
};

// Add event listeners to filter inputs
document
  .getElementById("filter-name")!
  .addEventListener("input", renderFilteredAuthors);
document
  .getElementById("filter-nationality")!
  .addEventListener("change", renderFilteredAuthors);
document
  .getElementById("filter-alive")!
  .addEventListener("change", renderFilteredAuthors);
document
  .getElementById("filter-year-active")!
  .addEventListener("input", renderFilteredAuthors);

// Sorting event listeners
document.querySelectorAll(".author-header").forEach((header) => {
  header.addEventListener("click", () => {
    const field = (header as HTMLElement).dataset.field as
      | keyof Author
      | "years_active"
      | "bibliography";
    if (sortField === field) {
      toggleSortDirection(); // Toggle if same field is clicked
    } else {
      sortField = field;
      sortDirection = "asc"; // Default to ascending when new field is selected
    }
    renderFilteredAuthors(); // Apply filters and sorting together
  });
});

// Initialize
fetchAuthors();
