import { ApartmentAttributes } from './models';
import { stringify as csvStringify } from 'csv-stringify';
import puppeteer from 'puppeteer';
import * as fs from 'fs';

(async () => {

  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  
  await page.goto("https://sfbay.craigslist.org/search/sfc/apa?search_distance=4&postal=94103&min_price=1300&max_price=2500&min_bedrooms=1&min_bathrooms=1&availabilityMode=0&sale_date=all+dates", {timeout: 5000})
  await page.waitForSelector('.result-row')

  const getListings = async (searchResults: puppeteer.Page) => {
    await searchResults.waitForSelector('#search-results li.result-row > a')
    return await searchResults.$$eval('#search-results li.result-row', (listings: any) => {
      return [...listings].map(listing => {
        const price = 
          listing.querySelector(`.result-info .result-meta .result-price`) ?
            Number((listing.querySelector(`.result-info .result-meta .result-price`).textContent).replaceAll(/[\D]/g, '')) : 0;
        const housing =
          listing.querySelector(`.result-info .result-meta .housing`) ?
            (listing.querySelector(`.result-info .result-meta .housing`).textContent).replaceAll(/[ \n)]/g, '') : '';
        const hood =
          listing.querySelector(`.result-info .result-meta .result-hood`) ?
            (listing.querySelector(`.result-info .result-meta .result-hood`).textContent).replaceAll(/[\(\)]/g, '').trim() : '';
        const miles =
          listing.querySelector(`.result-info .result-meta .result-tags .maptag`) ?
            (listing.querySelector(`.result-info .result-meta .result-tags .maptag`).textContent).replaceAll(/mi|\s/g, '') : '0';
        const title =
          listing.querySelector(`.result-info .result-heading .result-title`) ?
            listing.querySelector(`.result-info .result-heading .result-title`).textContent : '';
        const link =
          listing.querySelector(`.result-info .result-heading .result-title`) ?
            listing.querySelector(`.result-info .result-heading .result-title`).getAttribute('href') : '';
        const date =
          listing.querySelector(`.result-info .result-date`) ?
            listing.querySelector(`.result-info .result-date`).getAttribute('datetime') : '';
        
        // assumption that listings with the same housing, hood, and miles to be the same
        const id = (housing+hood+miles).replaceAll(/\W/g, '');
        
        const pictures = []
        if (listing.querySelector(`a.result-image.gallery`).getAttribute('data-ids')) {
          const getPictures = (listing.querySelector(`a.result-image.gallery`).getAttribute('data-ids')).split(',')
          const createLink = getPictures.map((picture: string) => {
            return `https://images.craigslist.org/${picture.substring(2)}_300x300.jpg`
          })
          pictures.push(...createLink)
        }

        const apartment: ApartmentAttributes = {
          id,
          date,
          title,
          link,
          price,
          housing,
          hood,
          miles,
          pictures
        }

        return apartment

      })
    })
  }

  // grab all apartments from each page
  // stop at 25 attempts (3000 total results / 120 results per page)
  const apartments = [];
  let nextPage = true;
  let count = 25;
  while (nextPage && count > 0){
    apartments.push(...(await getListings(page)))
    try{
      await page.click('#searchform > div > div > span.buttons > a.button.next');
      count -= 1;
    }catch(err){
      nextPage = false;
    }
  }

  // remove duplicate objects (apartments) by 'id', this chooses the object at the bottom of the list
  const uniqueApartments = [... new Map(apartments.map(apartment => [apartment['id'], apartment])).values()];

  csvStringify(uniqueApartments, {header: true }, (err, out) => {
    fs.writeFile('output.csv', out, (error) => {
      if (error) console.log('Error writing file')
    })
  })

  await browser.close();

})();