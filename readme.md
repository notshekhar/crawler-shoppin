**1. Project Setup and Dependencies:**

The project likely uses Node.js and npm (or yarn) for package management. Key dependencies include:

-   **express:** Web framework for creating the API.
-   **axios:** HTTP client for making requests to websites.
-   **jsdom:** Parses HTML and creates a DOM (Document Object Model) in a Node.js environment.
-   **jsonld:** Library for working with JSON-LD (Linked Data), used for extracting structured data from websites.
-   **sequelize:** ORM (Object-Relational Mapper) for interacting with the SQLite database.
-   **morgan:** HTTP request logger middleware.
-   **cors:** Middleware for enabling Cross-Origin Resource Sharing.

**2. Database (`configs/db.config.ts` and `init-db.ts`):**

-   `db.config.ts`: Configures the Sequelize instance to connect to a SQLite database file named `database.sqlite`. Logging is disabled for cleaner output.
-   `init-db.ts`: Contains the `init_db()` function, which creates the necessary database tables (`websites`, `crawled_urls`, `product_description_urls`) if they don't exist. It also sets up a trigger to automatically update the `updated_at` timestamp in the `websites` table whenever a record is modified. The tables are structured to maintain relationships between websites and their crawled/product URLs.

**3. Controllers (`controllers/website.controller.ts`):**

This file defines the API endpoints for managing websites:

-   `getAllWebsites()`: Retrieves all websites from the database and returns them as JSON.
-   `addWebsite()`: Adds a new website to the database. It validates the URL format using a regular expression and checks for URL uniqueness. It also verifies that the website is reachable by making a GET request using `axios`. Uses transactions to ensure data consistency in the database.
-   `deleteWebsite()`: Deletes a website from the database based on its ID. Also uses transactions.
-   `startCrawling()`: Initiates the crawling process for a given website ID. It retrieves the website URL from the database and adds a crawl job to the `crawlWebsiteQueue`.

**4. Custom Queue (`libs/sqlite-queue.ts`):**

This file defines a custom queue implementation using SQLite as the storage backend. This is crucial for handling crawling tasks asynchronously and efficiently.

-   The `SqliteQueue` class allows adding jobs with data, processing jobs with a specified concurrency, and managing job status (pending, active, completed, failed).
-   It uses a SQLite table named `jobs` to store job information.
-   The `process()` method continuously polls for new jobs and processes them using a provided callback function.
-   It handles job retries (based on `maxAttempts`) and error logging.

**5. Queue Processing (`queue-process` folder):**

-   `crawl-website.ts`: Contains the `crawlWebsiteProcess` function, which is the worker function for the `crawlWebsiteQueue`. It retrieves the website content, extracts links, adds them to the database and `filterProductDescriptionQueue`, and recursively adds crawl jobs for internal links. It prevents crawling of external links.
-   `filter-product-urls.ts`: Contains the `filterProductUrlProcess` function, which is the worker for the `filterProductDescriptionQueue`. It attempts to identify product pages by looking for JSON-LD data with the `@type` "Product". If found, the URL is saved in the `product_description_urls` table. It also contains commented-out code that attempts to identify product pages based on the presence of "add to cart" or similar buttons.

**6. Middlewares (`middlewares/ErrorHandler.ts`):**

-   `ErrorHandler.ts`: Provides a global error handling middleware. It differentiates between custom HTTP errors (`CustomHttpError`) and generic errors, returning appropriate error responses to the client.

**7. Utilities (`utils/custom-http-error.ts`):**

-   `custom-http-error.ts`: Defines the `CustomHttpError` class, which extends the built-in `Error` class and adds `status` and `data` properties. This allows for more structured error responses.

**8. Queues Setup (`queues.ts`):**

-   `queues.ts`: Sets up the two queues (`crawlWebsiteQueue` and `filterProductDescriptionQueue`) and associates them with their respective worker functions (`crawlWebsiteProcess` and `filterProductUrlProcess`). The concurrency for each queue is also configured here.

**9. Server (`server.ts`):**

-   `server.ts`: Sets up the Express server, applies middleware (morgan, cors, express.json, express.urlencoded), defines API routes, and starts the server. It also initializes the database using `init_db()`.

**Detailed Flow of a Crawl:**

1. A user adds a website URL via the API.
2. The user initiates crawling for the website.
3. A job is added to `crawlWebsiteQueue`.
4. A worker from `crawlWebsiteQueue` picks up the job.
5. The worker fetches the website's HTML, extracts links, and:
    - Adds internal links to both `crawlWebsiteQueue` (for further crawling) and `filterProductDescriptionQueue` (for product identification).
    - Adds all unique links to the `crawled_urls` database table.
6. Workers from `filterProductDescriptionQueue` process the URLs:
    - They check for JSON-LD product data.
    - If product data is found, the URL is added to the `product_description_urls` database table.
7. This process continues recursively until all reachable links within the target domain have been processed.

### **Setup Instructions**

-   **Installation**: This command will install all dependencies listed in package.json.
    `npm install`
-   **Running the Application**: or if you have a script defined:
    `npm start`
    `npm run dev`

### **Key Functions/Modules**

-   **Crawling**:
    -   `crawlWebsiteProcess(job, done)` - Main function to process a crawling job from the queue.
    -   `crawlLinks(parentWebsite, websiteId, link)` - Crawls links found on a page, processes them, and queues further actions.
-   **Filtering Product URLs**:
    -   `filterProductUrlProcess(job, done)` - Filters URLs to identify product pages.
    -   `isProductUrl(url)` - Helper function to check if a URL matches common product URL patterns.

### **Scalability and Performance**

-   **Parallel Processing**: Multiple jobs can run concurrently due to the use of job queues with specified concurrency levels (crawlWebsiteProcess for 4 jobs, filterProductUrlProcess for 10).
-   **Asynchronous Operations**: Uses asynchronous methods for I/O operations like database queries and HTTP requests.

### **Future Work**

-   **Enhance URL Pattern Matching**: More sophisticated regex for identifying product pages.
-   **Adding LLM (Large Language Model) for detecting Product page**
-   **Adding some custom crawler for some famous website.**
-   **Error Handling in Queue Processes**: Implement retry logic for failed jobs.
