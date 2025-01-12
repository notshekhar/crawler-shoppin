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
    const websitesHtml = websites
        .map(
            (site) => `
            <tr>
                <td>${site.id}</td>
                <td><a href="/detail.html?id=${site.id}">${site.url}</a></td>
                <td><button onclick="crawlWebsite(${site.id})">Start Crawl</button></td>
            </tr>
        `
        )
        .join("")
    tableBody.innerHTML = websitesHtml
}

// Initial fetch
fetchWebsites()

function crawlWebsite(id) {
    axios
        .get(`/websites/crawl/${id}`)
        .then((response) => {
            console.log("Crawl started:", response.data)
        })
        .catch((error) => {
            console.error("Error:", error)
        })
}

function initDetailPage() {
    const params = new URLSearchParams(window.location.search)
    const websiteId = params.get("id")

    async function fetchProductUrls() {
        try {
            const res = await axios.get(`/websites/${websiteId}`)
            const productList = document.getElementById("productList")
            productList.innerHTML = res.data.data
                .map(
                    (item) => `
                    <li style="border:1px solid #ccc; padding:8px; margin:4px 0; list-style:none;">
                        <div><strong>ID:</strong> ${item.id}</div>
                        <div><strong>URL:</strong> ${item.url}</div>
                        <div><strong>Website ID:</strong> ${item.website_id}</div>
                    </li>
                `
                )
                .join("")
        } catch (error) {
            console.error(error)
        }
    }

    document.getElementById("crawlBtn").addEventListener("click", () => {
        axios
            .get(`/websites/crawl/${websiteId}`)
            .then((res) => console.log("Crawl started:", res.data))
            .catch((err) => console.error(err))
    })

    fetchProductUrls()
}
