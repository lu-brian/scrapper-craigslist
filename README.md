## Description

This scrapper does the following:
1. Navigates to a Craigslist search result page and waits for results
2. The function 'getListings' returns an Array of listings from the page
3. We then iterate through all the search result pages and store the listings to 'apartments'
4. Finally, we de-duplicate the results in 'apartments' by creating a new object with 'apartments.id' as the key

## Known Issues
1. An assumption that the combined values of 'housing,' 'hood,' and 'miles' equals a unique listing. There are possibilities that two listings may have the same values and be a different listing.
2. No error handling for missing 'go-to page'
3. No error handling for empty listings resulting in 'null'
4. The type for the 'listings' variable is any 