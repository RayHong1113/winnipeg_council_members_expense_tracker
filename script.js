/*
    Winnipeg Council Members Expense Tracker
    November 26, 2026
    Ray Hong
 */

/**
 * Updates the status message banner and toggles error styling.
 *
 * @param {string} message - The status or error text to display
 * @param {boolean} isError - True to apply error styling; False for normal status
 */
const setStatus = (message, isError = false) => {
    const statusMessage = document.getElementById("statusMessage");
    statusMessage.textContent = message;
    statusMessage.classList.toggle("error", isError);
};

/**
 * Builds the SoQL query URL and fetches council member expense records
 * from the City of Winnipeg SODA2 Open Data API.
 *
 * @param {string} searchTerm - Keyword to filter by council member or ward office
 * @param {string} sortBy - SoQL ORDER BY clause
 * @param {string} limit - Maximum number of records to retrieve
 * @return {Promise<Array<Object>|null>} Parsed array of expense objects, or null if the request fails
 */
async function getMembersExpenses(searchTerm = "", sortBy = "journal_date DESC", limit = "100") {
    try {
        let apiUrl = "https://data.winnipeg.ca/resource/mgde-4fua.json?";

        // Add case-insensitive WHERE filter when the user enters a search term
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            apiUrl += `$where=lower(council_member) LIKE '%${lowerSearch}%' OR lower(ward_office) LIKE '%${lowerSearch}%'&`;
        }

        // Append sorting and row limit parameters
        apiUrl += `$order=${sortBy}` +
                  `&$limit=${limit}`;

        // Encode spaces and special characters before making the request
        const encodedURL = encodeURI(apiUrl);

        // Send GET request to the City of Winnipeg Open Data API
        const response = await fetch(encodedURL);

        // Verify that the HTTP status is in the 200-299 range
        if (!response.ok) {
            throw new Error(`HTTP Error! status: ${response.status}`);
        }

        // Parse and return the response body as JSON
        return await response.json();
    } catch (error) {
        // Log the error and return null so the caller can show a user-friendly message
        console.error("Failed to fetch members expenses:", error.message);
        return null;
    }
}

/**
 * Creates table row and cell elements using DOM methods and renders
 * the fetched expense records into the table.
 *
 * @param {Array<Object>} membersExpenses - Array of expense record objects from the API
 */
const displayData = (membersExpenses) => {
    const tbody = document.getElementById("list");
    tbody.innerHTML = "";

    // Display a message when the query returns zero matching records
    if (membersExpenses.length === 0) {
        setStatus("No rows found. Try different search criteria.");
        return;
    }

    setStatus(`Showing ${membersExpenses.length} result${membersExpenses.length === 1 ? "" : "s"}.`);

    // Loop through each expense record and extract relevant fields
    membersExpenses.forEach((member, index) => {
        // Destructure the member object to extract required properties
        const { council_member, ward_office, journal_date, expense_type, amount } = member;

        // Format the raw date and currency values for display
        const formattedDate = journal_date
            ? new Date(journal_date).toLocaleDateString()
            : "";
        const formattedAmount = amount ? `$${Number(amount).toFixed(2)}` : "";

        console.log(`Member: ${council_member}, ${ward_office}, ${formattedDate}, ${expense_type}, ${formattedAmount}`);

        const rowValues = [
            council_member ?? "",
            ward_office ?? "",
            formattedDate,
            expense_type ?? "",
            formattedAmount
        ];

        // Build the row and apply alternating row styling on even rows
        const newTr = document.createElement("tr");

        if (index % 2 === 1) {
            newTr.classList.add("even-row");
        }

        // Build the td cells for each column value
        for (const value of rowValues) {
            const newTd = document.createElement("td");
            newTd.textContent = value;
            newTr.appendChild(newTd);
        }

        // Append the new tr to the tbody
        tbody.appendChild(newTr);
    });
};

/**
 * Reads the current form inputs, fetches matching expense data,
 * and updates the status message and results table.
 */
async function listMembersExpenses() {
    const searchInput = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");
    const limitSelect = document.getElementById("limitSelect");
    const tbody = document.getElementById("list");

    const searchTerm = searchInput.value.trim();
    const sortBy = sortSelect.value;
    const limit = limitSelect.value;

    setStatus("Loading expenses...");

    const membersExpenses = await getMembersExpenses(searchTerm, sortBy, limit);

    // Handle failed API requests gracefully
    if (!membersExpenses) {
        tbody.innerHTML = "";
        setStatus("Failed to fetch expense data. Please try again later.", true);
        return;
    }

    displayData(membersExpenses);
}

// Add the event listener for the document load
document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");
    const limitSelect = document.getElementById("limitSelect");
    const clearBtn = document.getElementById("clearBtn");
    const tbody = document.getElementById("list");

    // Add event listener for the search form submit
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        listMembersExpenses();
    });

    // Add event listener for the clear button to reset inputs and clear the table
    clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        sortSelect.value = "journal_date DESC";
        limitSelect.value = "100";
        tbody.innerHTML = "";
        setStatus("");
    });
});
