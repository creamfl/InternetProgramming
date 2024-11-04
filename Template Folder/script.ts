// Define types for data. Adjust based on the specific structure of the API data
type DataItem = {
  id: number;
  name: string;
  category: string;
  // Add more fields as needed
};

// Global variables to store data and track sorting state
let data: DataItem[] = [];
let sortField: keyof DataItem = "id";
let sortDirection: "asc" | "desc" = "asc";

// Fetch data from API
const fetchData = async (): Promise<void> => {
  try {
    const response = await fetch("API_URL_HERE"); // Replace with actual API URL
    const result = await response.json();
    data = result.data; // Adjust if necessary to match API structure
    renderData(data); // Initial render
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// Render data rows in the data container
const renderData = (dataItems: DataItem[]): void => {
  const container = document.getElementById("data-container") as HTMLElement;
  container.innerHTML = ""; // Clear previous content

  // Sort data items
  const sortedData = sortData(dataItems);

  // Render each data item as a row
  sortedData.forEach((item) => {
    const row = document.createElement("div");
    row.classList.add("data-row");
    row.innerHTML = `
          <div class="data-cell">${item.id}</div>
          <div class="data-cell">${item.name}</div>
          <div class="data-cell">${item.category}</div>
      `;
    container.appendChild(row);
  });
};

// Sort data items based on current sort field and direction
const sortData = (dataItems: DataItem[]): DataItem[] => {
  return dataItems.sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
};

// Update sorting state and re-render data
const updateSort = (field: keyof DataItem) => {
  if (sortField === field) {
    sortDirection = sortDirection === "asc" ? "desc" : "asc";
  } else {
    sortField = field;
    sortDirection = "asc";
  }
  renderData(data); // Re-render data with updated sorting
};

// Event listeners for sorting
document.querySelectorAll(".data-header").forEach((header) => {
  header.addEventListener("click", () => {
    const field = (header as HTMLElement).dataset.field as keyof DataItem;
    updateSort(field);
  });
});

// Initialize app by fetching data
fetchData();
