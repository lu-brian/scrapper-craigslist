import puppeteer from "puppeteer";
import { stringify as csvStringify } from 'csv-stringify';
import * as fs from 'fs';

(async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage()

    await page.goto("https://sfbay.craigslist.org/search/sfc/apa?search_distance=4&postal=94103&min_price=1300&max_price=2500&min_bedrooms=1&min_bathrooms=1&availabilityMode=0&sale_date=all+dates")
    await page.waitForSelector('.result-row')
    
    const apartments = {}
    const sortedapartments = []
    let next = true;

    while (next) {

        const items = await page.$$('#search-results li.result-row')

        for(const item of items) {
            let date, link, title, price, housing, hood, miles = 'Null'
            let pictures = []

            try{
                price = await page.evaluate(el => el.querySelector(`.result-info .result-meta .result-price`).textContent, item)
            } catch(err){}
            try{
                housing = await page.evaluate(el => el.querySelector(`.result-info .result-meta .housing`).textContent, item)
            } catch(err){}
            try{
                hood = await page.evaluate(el => el.querySelector(`.result-info .result-meta .result-hood`).textContent, item)
            } catch(err){}
            try{
                miles = await page.evaluate(el => el.querySelector(`.result-info .result-meta .result-tags .maptag`).textContent, item)
            } catch(err){}
            
            const id = (price+housing+hood+miles).replaceAll(/\W/g, '')

            if (apartments[`${id}`]) {
                continue
            } else {

                try{
                    const raw: string = await page.evaluate(el => el.querySelector(`a.result-image.gallery`).getAttribute('data-ids'), item)
                    const rawArr = raw.split(',')
                    
                    pictures = rawArr.map((el) => {
                        return `https://images.craigslist.org/${el.substring(2)}_300x300.jpg`
                    })
                }catch(err){}
                try{
                    title =  await page.evaluate(el => el.querySelector(`.result-info .result-heading .result-title`).textContent, item)
                } catch(err){}
                try{
                    link =  await page.evaluate(el => el.querySelector(`.result-info .result-heading .result-title`).getAttribute('href'), item)
                } catch(err){}
                try{
                    date =  await page.evaluate(el => el.querySelector(`.result-info .result-date`).getAttribute('datetime'), item)
                } catch(err){}

                const apartment = {
                    date,
                    link,
                    title,
                    price,
                    'housing': housing.replaceAll(/[\W(\n)]/g, ''),
                    hood,
                    'miles': miles.replaceAll(/mi/g, ''),
                    pictures
                }

                apartments[`${id}`] = apartment
    
            }
        }
        // next = false
        try {
            await page.click('#searchform > div > div > span.buttons > a.button.next');
            await page.waitForSelector('#search-results li.result-row > a');
          } catch (error) {
            next = false;
          }
    }

    await browser.close();

    for (const key in apartments) {
        sortedapartments.push(apartments[`${key}`])
    }
     
    console.log(sortedapartments)
    console.log(Object.keys(apartments).length)

    // Export
    csvStringify(sortedapartments, { header: true }, (error1, output) => {
        fs.writeFile('output.csv', output, (error2) => {
            if (error2) throw error2;
        });
    });
})();