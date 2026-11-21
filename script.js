async function getMembersExpenses() {
    try {
        //  'fetch' returns a promise that resolves to the
        //  Response object representing the response of a request

        const response = await fetch("https://data.winnipeg.ca/resource/mgde-4fua.json")

        //  Check if the response status is ok
        if (!response.ok) {
            throw new Error(`HTTP Error! status: ${response.status}`)
        }

        //  the json() method parses the response body as JSON
        return response.json()
    } catch (error) {
        //  Error handling: Logs the error message
        console.error("Failed to fetch members expenses:", error.message)
    }
}

const displayData = (membersExpenses) => {
    const tbody = document.getElementById("list");
    tbody.innerHTML = "";

    //  Loop through each member and extract specific details
    membersExpenses.forEach((member) => {
        //  Destructure the member object to extract relevant information
        const { council_member, ward_office, journal_date, expense_type, amount } = member;

        console.log(`Member: ${council_member}, ${ward_office}, ${journal_date}, ${expense_type}, ${amount}`);

        const rowValues = [
            council_member ?? "",
            ward_office ?? "",
            journal_date ?? "",
            expense_type ?? "",
            amount ?? ""
        ];

        const newTr = document.createElement("tr");

        for (const value of rowValues) {
            const newTd = document.createElement("td");
            newTd.textContent = value;
            newTr.appendChild(newTd);
        }

        tbody.appendChild(newTr);
    });
};

async function listMembersExpenses() {
    const membersExpenses = await getMembersExpenses();

    if (!membersExpenses) return;

    displayData(membersExpenses);
}

//  Add the event listener to run when the page is loaded
document.addEventListener("DOMContentLoaded", () => {
    listMembersExpenses();
});