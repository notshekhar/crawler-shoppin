let websites = []

// Fetch websites when page loads
async function fetchWebsites() {
    try {
        const response = await axios.get("/websites")
        websites = response?.data?.data || []
        updateWebsiteList()
    } catch (error) {
        console.error("Error fetching websites:", error)
        alert(error?.response?.data?.message || "Error fetching websites")
    }
}

// Add new website via API
async function addWebsite(url) {
    try {
        await axios.post("/websites", { url })
        await fetchWebsites() // refresh the list
    } catch (error) {
        console.error("Error adding website:", error)
        alert(error?.response?.data?.message || "Error adding website")
    }
}

document
    .getElementById("addWebsiteForm")
    .addEventListener("submit", async function (e) {
        e.preventDefault()
        const urlInput = document.getElementById("websiteUrl")
        const url = urlInput.value

        if (url) {
            await addWebsite(url)
            urlInput.value = ""
        }
    })

function updateWebsiteList() {
    const tableBody = document.getElementById("websiteTableBody")
    console.log(websites[0])
    const websitesHtml = websites
        .map(
            (site) => `
            <tr>
                <td>${site.id}</td>
                <td>${site.url}</td>
            </tr>
        `
        )
        .join("")
    tableBody.innerHTML = websitesHtml
}

// Initial fetch
fetchWebsites()
