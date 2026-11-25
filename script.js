const setStatus = (message, isError = false) => {
    const statusMessage = document.getElementById("statusMessage");
    statusMessage.textContent = message;
    statusMessage.classList.toggle("error", isError);
};

async function getMembersExpenses(searchTerm = "", sortBy = "journal_date DESC", limit = "100") {
    try {
        let apiUrl = "https://data.winnipeg.ca/resource/mgde-4fua.json?";

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            apiUrl += `$where=lower(council_member) LIKE '%${lowerSearch}%' OR lower(ward_office) LIKE '%${lowerSearch}%'&`;
        }

        apiUrl += `$order=${sortBy}` +
                  `&$limit=${limit}`;

        const encodedURL = encodeURI(apiUrl);

        //  'fetch' returns a promise that resolves to the
        //  Response object representing the response of a request
        const response = await fetch(encodedURL);

        //  Check if the response status is ok
        if (!response.ok) {
            throw new Error(`HTTP Error! status: ${response.status}`);
        }

        //  the json() method parses the response body as JSON
        return await response.json();
    } catch (error) {
        //  Error handling: Logs the error message
        console.error("Failed to fetch members expenses:", error.message);
        return null;
    }
}

const displayData = (membersExpenses) => {
    const tbody = document.getElementById("list");
    tbody.innerHTML = "";

    if (membersExpenses.length === 0) {
        setStatus("No rows found. Try different search criteria.");
        return;
    }

    setStatus(`Showing ${membersExpenses.length} result${membersExpenses.length === 1 ? "" : "s"}.`);

    //  Loop through each member and extract specific details
    membersExpenses.forEach((member, index) => {
        //  Destructure the member object to extract relevant information
        const { council_member, ward_office, journal_date, expense_type, amount } = member;

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

        const newTr = document.createElement("tr");

        if (index % 2 === 1) {
            newTr.classList.add("even-row");
        }

        for (const value of rowValues) {
            const newTd = document.createElement("td");
            newTd.textContent = value;
            newTr.appendChild(newTd);
        }

        tbody.appendChild(newTr);
    });
};

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

    if (!membersExpenses) {
        tbody.innerHTML = "";
        setStatus("Failed to fetch expense data. Please try again later.", true);
        return;
    }

    displayData(membersExpenses);
}

//  Add the event listener to run when the page is loaded
document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");
    const limitSelect = document.getElementById("limitSelect");
    const clearBtn = document.getElementById("clearBtn");
    const tbody = document.getElementById("list");

    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        listMembersExpenses();
    });

    clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        sortSelect.value = "journal_date DESC";
        limitSelect.value = "100";
        tbody.innerHTML = "";
        setStatus("");
    });
});
