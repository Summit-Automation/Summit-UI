'use server';

import puppeteer, { Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { GISSearchCriteria, NewScrapedProperty } from '@/types/gis-properties';

// Helper function to create delays - reduces code repetition
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function searchAdditionalPages(page: any, browser: any, criteria: GISSearchCriteria, needed: number): Promise<NewScrapedProperty[]> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const additionalProperties: NewScrapedProperty[] = [];
  
  try {
    // Look for pagination buttons with valid CSS selectors
    let nextPageButton = null;
    
    // Try different pagination button patterns
    const paginationSelectors = [
      'a[href*="Page"]',
      'input[value*="Next"]',
      'input[value*="next"]',
      'a[title*="Next"]',
      'a[title*="next"]'
    ];
    
    for (const selector of paginationSelectors) {
      try {
        nextPageButton = await page.$(selector);
        if (nextPageButton) {
          console.log(`Found pagination button with selector: ${selector}`);
          break;
        }
      } catch {
        // Try next selector
      }
    }
    
    if (nextPageButton) {
      console.log('Found next page button, clicking...');
      await nextPageButton.click();
      await delay(3000);
      
      // Get more property links from this page
      const moreLinks = await page.evaluate(() => {
        const links: Array<{ address: string; href: string }> = [];
        const addressPatterns = ['a[href*="Property"]', 'a[href*="Detail"]', 'td a', 'tr a'];
        
        addressPatterns.forEach(pattern => {
          const elements = document.querySelectorAll(pattern);
          elements.forEach(element => {
            const text = element.textContent?.trim();
            const href = element.getAttribute('href');
            
            if (text && href && text.match(/\b(ST|RD|AVE|DR|LN|WAY|BLVD)\b/i)) {
              links.push({
                address: text,
                href: href.startsWith('http') ? href : `https://gis.vgsi.com${href.startsWith('/') ? '' : '/'}${href}`
              });
            }
          });
        });
        
        // Shuffle the links
        for (let i = links.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [links[i], links[j]] = [links[j], links[i]];
        }
        
        return links;
      });
      
      console.log(`Found ${moreLinks.length} additional property links on next page`);
      
      // Process the additional links (limit to what we need)
      const linksToProcess = moreLinks.slice(0, needed);
      
      for (const link of linksToProcess) {
        try {
          if (!browser) throw new Error('Browser not initialized');
          const propertyPage = await browser.newPage();
          await propertyPage.goto(link.href, { waitUntil: 'networkidle2', timeout: 10000 });
          
          const propertyData = await propertyPage.evaluate((address: string, searchCriteria: { min_acreage: number; max_acreage: number; township?: string }) => {
            // Same property extraction logic as main function
            const getText = (selector: string) => {
              const element = document.querySelector(selector);
              return element ? element.textContent?.trim() || '' : '';
            };
            
            const getTextByContentInNextCell = (text: string) => {
              // Escape quotes and special characters to prevent XPath injection
              const escapedText = text.replace(/"/g, '&quot;').replace(/'/g, '&apos;');
              const xpath = `//td[contains(text(), "${escapedText}")]/following-sibling::td[1]`;
              const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
              return result.singleNodeValue ? result.singleNodeValue.textContent?.trim() || '' : '';
            };
            
            // Extract the actual property address from the prominent display
            let actualAddress = address; // fallback to link address
            
            const locationText = getTextByContentInNextCell('Location') || '';
            if (locationText && locationText.match(/^\d+\s+[A-Z]/i)) {
              actualAddress = locationText;
            } else {
              // Look for prominent address display
              const headingElements = document.querySelectorAll('h1, h2, h3, .large, .title');
              for (const element of headingElements) {
                const text = element.textContent?.trim() || '';
                if (text && text.match(/^\d+\s+[A-Z]/i) && text.length < 50) {
                  actualAddress = text;
                  break;
                }
              }
            }
            
            // Extract owner name but avoid getting owner's address
            let ownerName = 'Unknown';
            const ownerFromSpan = getText('span[id*="Owner"]');
            const ownerFromCell = getTextByContentInNextCell('Owner');
            
            const ownerCandidates = [ownerFromSpan, ownerFromCell].filter(name => {
              if (!name || !name.trim() || name.length > 100) return false;
              
              const nameTrimmed = name.trim();
              
              // Improved address detection - look for common address patterns
              const isLikelyAddress = (
                nameTrimmed.includes(' ST ') || nameTrimmed.endsWith(' ST') ||
                nameTrimmed.includes(' AVE ') || nameTrimmed.endsWith(' AVE') ||
                nameTrimmed.includes(' DR ') || nameTrimmed.endsWith(' DR') ||
                nameTrimmed.includes(' RD ') || nameTrimmed.endsWith(' RD') ||
                nameTrimmed.includes(' LN ') || nameTrimmed.endsWith(' LN') ||
                nameTrimmed.includes(' WAY ') || nameTrimmed.endsWith(' WAY') ||
                nameTrimmed.includes(' BLVD ') || nameTrimmed.endsWith(' BLVD') ||
                nameTrimmed.includes('PA ') ||
                // Only reject if it's clearly a street address pattern (number + single letter + space + word)
                nameTrimmed.match(/^\d+\s+[A-Z]\s+[A-Z]/)
              );
              
              return !isLikelyAddress;
            });
            
            if (ownerCandidates.length > 0) {
              ownerName = ownerCandidates[0];
            }
            // Look for "Deeded Acres" pattern specifically
            const acreageText = getTextByContentInNextCell('Deeded Acres') ||
                               getText('span[id*="Acre"]') || 
                               getTextByContentInNextCell('Acre') ||
                               getTextByContentInNextCell('Land') ||
                               getTextByContentInNextCell('Lot Size') ||
                               getTextByContentInNextCell('Total Acres') ||
                               getText('span[id*="Land"]') ||
                               getText('span[id*="Lot"]') || '';
            let acreage = parseFloat(acreageText.replace(/[^0-9.]/g, '')) || 0.1;
            
            // If we got a very small number, it might be in square feet - check for conversion
            if (acreage > 1000 && acreageText.toLowerCase().includes('sq')) {
              // Convert square feet to acres (1 acre = 43,560 sq ft)
              acreage = acreage / 43560;
              console.log(`  Additional page converted from sq ft: ${acreageText} -> ${acreage.toFixed(2)} acres`);
            }
            
            console.log(`  Additional page found acreage text: "${acreageText}" -> parsed as: ${acreage}`);
            
            // Use same township detection logic as main function
            let extractedCity = 'New Castle';
            
            const pageHTML = document.documentElement.innerHTML;
            const cityPageText = document.body ? document.body.textContent || '' : '';
            
            // Look for the specific "District X: Township Name" pattern
            const districtPattern = /District\s+\d+:\s*([A-Za-z0-9\s]+?)(?:\s*\n|\s*\r|\s*<|\s*$|\s{3,})/i;
            const districtMatch = cityPageText.match(districtPattern) || pageHTML.match(districtPattern);
            
            if (districtMatch && districtMatch[1]) {
              let rawTownship = districtMatch[1].trim();
              console.log(`  Additional page found district pattern: "${districtMatch[0]}" -> "${rawTownship}"`);
              
              // Clean up any extra whitespace
              rawTownship = rawTownship.replace(/\s+/g, ' ').trim();
              
              // Map township name to our expected format
              const townshipLower = rawTownship.toLowerCase();
              if (townshipLower.includes('scott')) {
                extractedCity = 'Scott';
              } else if (townshipLower.includes('slippery rock')) {
                extractedCity = 'Slippery Rock';
              } else if (townshipLower.includes('ellwood')) {
                extractedCity = 'Ellwood City';
              } else if (townshipLower.includes('wilmington')) {
                extractedCity = 'Wilmington';
              } else if (townshipLower.includes('grove city')) {
                extractedCity = 'Grove City';
              } else if (townshipLower.includes('pulaski')) {
                extractedCity = 'Pulaski';
              } else if (townshipLower.includes('new beaver')) {
                extractedCity = 'New Beaver';
              } else if (townshipLower.includes('mahoning')) {
                extractedCity = 'Mahoning';
              } else if (townshipLower.includes('neshannock')) {
                extractedCity = 'Neshannock';
              } else if (townshipLower.includes('union')) {
                extractedCity = 'Union';
              } else if (townshipLower.includes('new castle')) {
                extractedCity = 'New Castle';
              } else if (townshipLower.includes('bessemer')) {
                extractedCity = 'Bessemer';
              } else {
                extractedCity = rawTownship.length < 30 ? rawTownship : 'New Castle';
              }
            } else {
              // Fallback to content search
              const pageContent = (pageHTML + ' ' + cityPageText).toLowerCase();
              if (pageContent.includes('slippery rock')) {
                extractedCity = 'Slippery Rock';
              } else if (pageContent.includes('scott')) {
                extractedCity = 'Scott';
              } else if (pageContent.includes('ellwood')) {
                extractedCity = 'Ellwood City';
              } else if (pageContent.includes('wilmington')) {
                extractedCity = 'Wilmington';
              } else if (pageContent.includes('pulaski')) {
                extractedCity = 'Pulaski';
              } else if (pageContent.includes('new beaver')) {
                extractedCity = 'New Beaver';
              } else if (pageContent.includes('mahoning')) {
                extractedCity = 'Mahoning';
              } else if (pageContent.includes('neshannock')) {
                extractedCity = 'Neshannock';
              } else if (pageContent.includes('union')) {
                extractedCity = 'Union';
              }
            }
            
            const parcelId = undefined; // Not extracted in additional pages for simplicity
            
            // Look for Assessment field in additional pages too
            let assessedValue = null;
            const additionalPageText = document.body ? document.body.textContent || '' : '';
            const assessmentPattern = /Assessment\s*\$([0-9,]+)/i;
            const assessmentMatch = additionalPageText.match(assessmentPattern);
            
            if (assessmentMatch && assessmentMatch[1]) {
              assessedValue = parseInt(assessmentMatch[1].replace(/,/g, ''));
              console.log(`  Additional page found assessment: "${assessmentMatch[0]}" -> $${assessedValue}`);
            }

            return {
              owner_name: ownerName,
              address: actualAddress,
              city: extractedCity,
              acreage: acreage,
              assessed_value: assessedValue ?? undefined,
              property_type: 'Unknown',
              parcel_id: parcelId ?? undefined,
              search_criteria: searchCriteria
            };
          }, link.address, criteria);
          
          await propertyPage.close();
          
          // Add all properties - filtering will be done in main function
          additionalProperties.push(propertyData);
          console.log(`Found additional property: ${propertyData.address} in ${propertyData.city}, acreage: ${propertyData.acreage}`);
          
          if (additionalProperties.length >= needed) break;
          
        } catch (error) {
          console.log(`Error processing additional property ${link.address}:`, error instanceof Error ? error instanceof Error ? error.message : error : error);
        }
      }
    }
  } catch (error) {
    console.log('Error searching additional pages:', error instanceof Error ? error.message : error);
  }
  
  return additionalProperties;
}

/**
 * Scrapes property data from Lawrence County GIS system using Puppeteer.
 * Searches properties based on acreage criteria and extracts owner, address, and assessment data.
 * @param criteria Search criteria including min/max acreage
 * @returns Promise with array of scraped property data
 */
export async function scrapeLawrenceCountyGIS(criteria: GISSearchCriteria): Promise<NewScrapedProperty[]> {
  let browser: Browser | undefined;
  
  try {
    console.log('Starting browser-based GIS scrape for:', criteria);
    
    // Launch headless browser - use different config for production vs development
    const isProduction = process.env.NODE_ENV === 'production';
    const isVercel = process.env.VERCEL === '1';
    
    if (isProduction && isVercel) {
      // Use @sparticuz/chromium for Vercel serverless functions
      console.log('Using serverless Chromium for Vercel deployment');
      browser = await puppeteer.launch({
        args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
        defaultViewport: { width: 1280, height: 720 },
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    } else {
      // Use local Chromium for development or non-Vercel production
      console.log('Using local Puppeteer for development/local production');
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }) as Browser;
    }
    
    const page = await browser.newPage();
    
    // Set realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('Navigating to GIS website...');
    await page.goto('https://gis.vgsi.com/lawrencecountypa/Sales.aspx', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('Page loaded, inspecting form structure...');
    
    // First, let's inspect what's actually on the page
    const pageContent = await page.evaluate(() => {
      // Get all input elements
      const inputs = Array.from(document.querySelectorAll('input'));
      const buttons = Array.from(document.querySelectorAll('button'));
      const selects = Array.from(document.querySelectorAll('select'));
      const checkboxes = inputs.filter(input => input.type === 'checkbox');
      const submitButtons = [...inputs.filter(input => input.type === 'submit'), ...buttons];
      
      return {
        checkboxCount: checkboxes.length,
        checkboxes: checkboxes.map(cb => ({ id: cb.id, name: cb.name, value: cb.value })),
        submitButtons: submitButtons.map(btn => ({ 
          id: btn.id, 
          value: btn.value || btn.textContent?.trim(), 
          type: btn.type 
        })),
        selects: selects.map(sel => ({ 
          id: sel.id, 
          name: sel.name,
          options: Array.from(sel.options).map(opt => ({ value: opt.value, text: opt.text }))
        }))
      };
    });
    
    console.log('Page inspection completed - found', pageContent.checkboxCount, 'checkboxes and', pageContent.submitButtons.length, 'submit buttons');
    
    console.log(`Scraping properties with acreage ${criteria.min_acreage}-${criteria.max_acreage} from all townships`);
    
    // Try to find model checkboxes with different patterns
    const modelPatterns = [
      'input[type="checkbox"][id*="Model"]',
      'input[type="checkbox"][name*="Model"]',
      'input[type="checkbox"][id*="cbl"]'
    ];
    
    let checkedModels = 0;
    for (const pattern of modelPatterns) {
      try {
        const modelBoxes = await page.$$(pattern);
        console.log(`Found ${modelBoxes.length} checkboxes with pattern: ${pattern}`);
        
        // Check all model checkboxes
        for (let i = 0; i < modelBoxes.length; i++) {
          try {
            await modelBoxes[i].click();
            checkedModels++;
            console.log(`Checked model box ${i + 1}`);
          } catch (error) {
            console.log(`Could not check model box ${i + 1}:`, error instanceof Error ? error.message : error);
          }
        }
        
        if (checkedModels > 0) break;
      } catch (error) {
        console.log(`Pattern ${pattern} failed:`, error instanceof Error ? error.message : error);
      }
    }
    
    console.log(`Checked ${checkedModels} model checkboxes`);
    
    // Set the land area range before searching
    console.log(`Setting land area range: ${criteria.min_acreage} to ${criteria.max_acreage} acres`);
    
    try {
      // First, let's inspect ALL input fields on the page to find the right ones
      const allInputs = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        return inputs.map(input => ({
          id: input.id,
          name: input.name,
          type: input.type,
          value: input.value,
          placeholder: input.placeholder || '',
          className: input.className || ''
        }));
      });
      
      // Debug: Uncomment next line if you need to see all fields again
      // console.log('All input fields on page:', JSON.stringify(allInputs, null, 2));
      
      // Look for land area input fields based on the inspection
      let minAcreageField = null;
      let maxAcreageField = null;
      
      // Try to find fields that might contain land area values (look for fields with values like 0.23, 0.57, etc.)
      const potentialFields = allInputs.filter((input: any) => // eslint-disable-line @typescript-eslint/no-explicit-any 
        input.type === 'text' && 
        input.value && 
        input.value.match(/^\d+\.?\d*$/) && 
        parseFloat(input.value) < 100 // Likely to be acreage values
      );
      
      console.log('Found', potentialFields.length, 'potential land area fields');
      
      if (potentialFields.length >= 2) {
        // Use the first two fields that look like acreage values
        minAcreageField = await page.$(`input[id="${potentialFields[0].id}"]`);
        maxAcreageField = await page.$(`input[id="${potentialFields[1].id}"]`);
        console.log(`Found potential min field: ${potentialFields[0].id}, max field: ${potentialFields[1].id}`);
      }
      
      // If we found the fields, set the values
      if (minAcreageField && maxAcreageField) {
        // Clear existing values and set new ones
        await minAcreageField.click({ clickCount: 3 }); // Select all text
        await minAcreageField.type(criteria.min_acreage.toString());
        console.log(`Set minimum acreage to: ${criteria.min_acreage}`);
        
        await maxAcreageField.click({ clickCount: 3 }); // Select all text  
        await maxAcreageField.type(criteria.max_acreage.toString());
        console.log(`Set maximum acreage to: ${criteria.max_acreage}`);
      } else {
        console.log('Could not find land area input fields, will filter results after scraping');
      }
      
    } catch (error) {
      console.log('Error setting land area range:', error instanceof Error ? error.message : error);
    }
    
    // Set sales price range to reasonable values to avoid filtering out properties
    console.log('Setting sales price range to reasonable values...');
    
    try {
      // Look for sales price fields - they might have different names/IDs
      const allInputsForPrice = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        return inputs.map(input => ({
          id: input.id,
          name: input.name,
          type: input.type,
          value: input.value,
          placeholder: input.placeholder || '',
          className: input.className || ''
        })).filter(input => 
          input.type === 'text' && 
          (input.id.toLowerCase().includes('price') || 
           input.name.toLowerCase().includes('price') ||
           input.id.toLowerCase().includes('sale') ||
           input.name.toLowerCase().includes('sale') ||
           // Look for fields with high numeric values that might be price fields
           (input.value && input.value.match(/^\d{4,}$/) && parseInt(input.value) > 1000)
          )
        );
      });
      
      console.log('Found', allInputsForPrice.length, 'potential sales price fields');
      
      // Try to find min and max price fields
      let minPriceField = null;
      let maxPriceField = null;
      
      // Look for price fields by common patterns - focus on actual PRICE fields, not date fields
      const priceFieldPatterns = [
        { min: 'MainContent_txtSalePriceFrom', max: 'MainContent_txtSalePriceTo' },
        { min: 'ctl00$MainContent$txtSalePriceFrom', max: 'ctl00$MainContent$txtSalePriceTo' },
        { min: 'txtPriceFrom', max: 'txtPriceTo' },
        { min: 'txtSalePriceFrom', max: 'txtSalePriceTo' }
      ];
      
      for (const pattern of priceFieldPatterns) {
        try {
          const minField = await page.$(`input[id="${pattern.min}"], input[name="${pattern.min}"]`);
          const maxField = await page.$(`input[id="${pattern.max}"], input[name="${pattern.max}"]`);
          
          if (minField && maxField) {
            minPriceField = minField;
            maxPriceField = maxField;
            console.log(`Found price fields: ${pattern.min} and ${pattern.max}`);
            break;
          }
        } catch {
          // Try next pattern
        }
      }
      
      // If we found specific price field candidates from inspection, use those
      if (!minPriceField && !maxPriceField && allInputsForPrice.length >= 2) {
        // Filter out date fields and prioritize actual price fields
        const actualPriceFields = allInputsForPrice.filter((field: any) => // eslint-disable-line @typescript-eslint/no-explicit-any 
          !field.className.includes('datepicker') && // Exclude date picker fields
          !field.value.includes('/') && // Exclude fields with date-like values
          !field.id.toLowerCase().includes('date') &&
          (field.id.toLowerCase().includes('price') || field.value.match(/^\d{4,}$/)) // Must be price-related
        );
        
        if (actualPriceFields.length >= 2) {
          try {
            minPriceField = await page.$(`input[id="${actualPriceFields[0].id}"]`);
            maxPriceField = await page.$(`input[id="${actualPriceFields[1].id}"]`);
            console.log(`Using filtered price fields: ${actualPriceFields[0].id}, ${actualPriceFields[1].id}`);
          } catch (error) {
            console.log('Could not use filtered price fields:', error instanceof Error ? error.message : error);
          }
        } else {
          console.log('No suitable price fields found after filtering out date fields');
        }
      }
      
      // Set reasonable price range if we found the fields
      if (minPriceField && maxPriceField) {
        // Set minimum to $80,000 and maximum to $9,999,999 to capture most properties
        await minPriceField.click({ clickCount: 3 });
        await minPriceField.type('80000');
        console.log('Set minimum sales price to: $80,000');
        
        await maxPriceField.click({ clickCount: 3 });
        await maxPriceField.type('9999999');
        console.log('Set maximum sales price to: $9,999,999');
      } else {
        console.log('Could not find sales price fields - search may be limited by default price range');
      }
      
    } catch (error) {
      console.log('Error setting sales price range:', error instanceof Error ? error.message : error);
    }
    
    // Look for styles checkboxes and check all link
    const stylesPatterns = [
      'input[type="checkbox"][id*="Style"]',
      'input[type="checkbox"][name*="Style"]'
    ];
    
    let checkedStyles = false;
    
    // First try to find the specific "check all" checkbox that was found in inspection
    try {
      await page.click('#chkAllStyle');
      console.log('Found and clicked the chkAllStyle checkbox');
      checkedStyles = true;
    } catch {
      console.log('chkAllStyle checkbox not found, trying other patterns...');
      
      // Try other "check all" patterns
      const checkAllPatterns = [
        'a[href*="javascript"][title*="all"]',
        'a[href*="javascript"]:contains("All")',
        'input[type="button"][value*="All"]',
        'button:contains("All")'
      ];
      
      for (const pattern of checkAllPatterns) {
        try {
          await page.click(pattern);
          console.log(`Found and clicked check all with pattern: ${pattern}`);
          checkedStyles = true;
          break;
        } catch {
          // Try next pattern
        }
      }
    }
    
    // If no check all found, check individual style boxes
    if (!checkedStyles) {
      for (const pattern of stylesPatterns) {
        try {
          const styleBoxes = await page.$$(pattern);
          console.log(`Found ${styleBoxes.length} style checkboxes with pattern: ${pattern}`);
          
          for (const box of styleBoxes) {
            try {
              await box.click();
            } catch {
              // Continue with next box
            }
          }
          
          if (styleBoxes.length > 0) {
            checkedStyles = true;
            break;
          }
        } catch (error) {
          console.log(`Style pattern ${pattern} failed:`, error instanceof Error ? error.message : error);
        }
      }
    }
    
    console.log(`Styles handled: ${checkedStyles}`);
    
    // Find and click submit button
    const submitPatterns = [
      'input[type="submit"]',
      'button[type="submit"]',
      'input[value*="Search"]',
      'input[value*="Submit"]',
      'button:contains("Search")',
      'button:contains("Submit")'
    ];
    
    let submitted = false;
    for (const pattern of submitPatterns) {
      try {
        await page.click(pattern);
        console.log(`Submitted form with pattern: ${pattern}`);
        submitted = true;
        break;
      } catch (error) {
        console.log(`Submit pattern ${pattern} failed:`, error instanceof Error ? error.message : error);
      }
    }
    
    if (!submitted) {
      throw new Error('Could not find submit button');
    }
    
    // Wait for results to load
    await delay(5000);
    
    console.log('Search submitted, parsing results...');
    
    // Try to navigate to a random page of results to get more variety
    const randomPage = Math.floor(Math.random() * 10) + 1; // Pages 1-10 for more variety
    if (randomPage > 1) {
      try {
        console.log(`Attempting to navigate to page ${randomPage} for more varied results...`);
        
        // Look for page links
        const pageLinks = await page.$$eval('a[href*="Page"]', links => 
          links.map((link: any) => ({ href: link.href, text: link.textContent?.trim() })) // eslint-disable-line @typescript-eslint/no-explicit-any
        );
        
        const targetPageLink = pageLinks.find((link: any) => // eslint-disable-line @typescript-eslint/no-explicit-any 
          (link as any).text && (link as any).text.includes(randomPage.toString()) // eslint-disable-line @typescript-eslint/no-explicit-any
        );
        
        if (targetPageLink) {
          await page.goto(targetPageLink.href, { waitUntil: 'domcontentloaded', timeout: 10000 });
          await delay(3000);
          console.log(`Successfully navigated to page ${randomPage}`);
        } else {
          console.log(`Page ${randomPage} link not found, using default results`);
        }
      } catch (error) {
        console.log(`Could not navigate to page ${randomPage}:`, error instanceof Error ? error.message : error);
      }
    }
    
    // Parse the results page for property links with enhanced debugging
    const propertyLinks = await page.evaluate(() => {
      const links: Array<{ address: string; href: string }> = [];
      
      // Debug: Log page content to understand structure
      console.log('Page title:', document.title);
      console.log('Page URL:', window.location.href);
      console.log('Total links on page:', document.querySelectorAll('a').length);
      console.log('Total table cells:', document.querySelectorAll('td').length);
      
      // Look for clickable elements that contain addresses with broader patterns
      const addressPatterns = [
        'a[href*="Property"]',
        'a[href*="Detail"]', 
        'a[href*="PropertyCard"]',
        'a[href*="property"]',
        'td a',
        'tr a',
        'a' // Catch all links as fallback
      ];
      
      addressPatterns.forEach(pattern => {
        const elements = document.querySelectorAll(pattern);
        console.log(`Pattern "${pattern}" found ${elements.length} elements`);
        
        elements.forEach((element, index) => {
          const text = element.textContent?.trim();
          const href = element.getAttribute('href');
          
          if (index < 3) { // Log first 3 for debugging
            console.log(`  Element ${index}: text="${text}", href="${href}"`);
          }
          
          // Much stricter address matching - only real addresses
          if (text && href && 
              text.match(/^\d+\s+[A-Z]/i) && // Must start with number and letter
              text.match(/\b(ST|RD|AVE|DR|LN|WAY|BLVD|STREET|ROAD|AVENUE|DRIVE|LANE)\b/i) && // Must have street type
              text.length > 8 && text.length < 40 && // Reasonable length
              !text.match(/search|refine|area|land|submit|button/i) // Exclude UI elements
          ) {
            links.push({
              address: text,
              href: href.startsWith('http') ? href : `https://gis.vgsi.com${href.startsWith('/') ? '' : '/'}${href}`
            });
          }
        });
      });
      
      console.log(`Total property links found: ${links.length}`);
      
      // Remove duplicates based on href
      const uniqueLinks: Array<{ address: string; href: string }> = [];
      const seenHrefs = new Set<string>();
      
      links.forEach(link => {
        if (!seenHrefs.has(link.href)) {
          seenHrefs.add(link.href);
          uniqueLinks.push(link);
        }
      });
      
      console.log(`Unique property links after deduplication: ${uniqueLinks.length}`);
      
      // Shuffle the links to get different results each time
      for (let i = uniqueLinks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [uniqueLinks[i], uniqueLinks[j]] = [uniqueLinks[j], uniqueLinks[i]];
      }
      
      // Return more links to have better selection
      return uniqueLinks.slice(0, Math.min(20, uniqueLinks.length));
    });
    
    console.log(`Found ${propertyLinks.length} property links`);
    
    // If we found fewer than 10 links, try to find more by looking for pagination or "next" buttons
    if (propertyLinks.length < 10) {
      try {
        const moreLinks = await page.evaluate(() => {
          const additionalLinks: Array<{ address: string; href: string }> = [];
          
          // Look for pagination buttons (removed invalid :contains selector)
          // const nextButtons = document.querySelectorAll('a[href*="Page"], input[value*="Next"]');
          
          // Also look for more address links we might have missed
          const allLinks = document.querySelectorAll('a[href]');
          allLinks.forEach(element => {
            const text = element.textContent?.trim();
            const href = element.getAttribute('href');
            
            if (text && href && 
                text.match(/\d+\s+[A-Z]/i) && // Starts with number and letter (address pattern)
                text.length > 5 && text.length < 50) { // Reasonable address length
              additionalLinks.push({
                address: text,
                href: href.startsWith('http') ? href : `https://gis.vgsi.com${href.startsWith('/') ? '' : '/'}${href}`
              });
            }
          });
          
          return additionalLinks;
        });
        
        console.log(`Found ${moreLinks.length} additional potential property links`);
        
        // Add unique links to our collection
        const existingHrefs = new Set(propertyLinks.map((link: any) => link.href)); // eslint-disable-line @typescript-eslint/no-explicit-any
        const newLinks = moreLinks.filter((link: any) => !existingHrefs.has(link.href)); // eslint-disable-line @typescript-eslint/no-explicit-any
        
        // Shuffle and add up to 10 more links
        for (let i = newLinks.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [newLinks[i], newLinks[j]] = [newLinks[j], newLinks[i]];
        }
        
        propertyLinks.push(...newLinks.slice(0, Math.max(0, 15 - propertyLinks.length)));
        console.log(`Total property links after expansion: ${propertyLinks.length}`);
        
      } catch (error) {
        console.log('Could not find additional property links:', error instanceof Error ? error.message : error);
      }
    }
    
    const properties: NewScrapedProperty[] = [];
    
    // Process properties in larger batches for better performance
    const batchSize = 5; // Process 5 properties at a time
    const batches: Array<Array<{ address: string; href: string }>> = [];
    
    for (let i = 0; i < propertyLinks.length; i += batchSize) {
      batches.push(propertyLinks.slice(i, i + batchSize));
    }
    
    console.log(`Processing ${propertyLinks.length} properties in ${batches.length} batches of ${batchSize}`);
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`Processing batch ${batchIndex + 1}/${batches.length}`);
      
      const batchPromises = batch.map(async (link) => {
        try {
          // Create a new page for each property in the batch to allow parallel processing
          if (!browser) throw new Error('Browser not initialized');
          const propertyPage = await browser.newPage();
          await propertyPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
          
          console.log(`Fetching details for: ${link.address}`);
          await propertyPage.goto(link.href, { waitUntil: 'domcontentloaded', timeout: 10000 }); // Faster loading
          
          // Extract property details from the page
          const propertyData = await propertyPage.evaluate((address: string, searchCriteria: { min_acreage: number; max_acreage: number; township?: string }) => {
            const getText = (selector: string) => {
              const element = document.querySelector(selector);
              return element ? element.textContent?.trim() || '' : '';
            };
            
            // Look for common property detail patterns using XPath for text content search
            // const getTextByContent = (text: string) => {
            //   // Escape quotes and special characters to prevent XPath injection
            //   const escapedText = text.replace(/"/g, '&quot;').replace(/'/g, '&apos;');
            //   const xpath = `//*[contains(text(), "${escapedText}")]`;
            //   const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            //   return result.singleNodeValue ? result.singleNodeValue.textContent?.trim() || '' : '';
            // };
            
            const getTextByContentInNextCell = (text: string) => {
              // Escape quotes and special characters to prevent XPath injection
              const escapedText = text.replace(/"/g, '&quot;').replace(/'/g, '&apos;');
              const xpath = `//td[contains(text(), "${escapedText}")]/following-sibling::td[1]`;
              const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
              return result.singleNodeValue ? result.singleNodeValue.textContent?.trim() || '' : '';
            };
            
            // Extract the actual property address from the prominent display
            let actualAddress = address; // fallback to link address
            
            // Look for the property address in prominent locations
            const locationText = getTextByContentInNextCell('Location') || '';
            if (locationText && locationText.match(/^\d+\s+[A-Z]/i)) {
              actualAddress = locationText;
              console.log(`  Found property address from Location field: "${actualAddress}"`);
            } else {
              // Look for large/prominent address display at top of page
              const headingElements = document.querySelectorAll('h1, h2, h3, .large, .title, [style*="font-size"], [style*="large"]');
              for (const element of headingElements) {
                const text = element.textContent?.trim() || '';
                if (text && text.match(/^\d+\s+[A-Z]/i) && text.length < 50) {
                  actualAddress = text;
                  console.log(`  Found property address from prominent heading: "${actualAddress}"`);
                  break;
                }
              }
              
              // Also check for divs or spans with address-like content near the top
              const topElements = document.querySelectorAll('div, span, p');
              for (let i = 0; i < Math.min(10, topElements.length); i++) {
                const element = topElements[i];
                const text = element.textContent?.trim() || '';
                if (text && text.match(/^\d+\s+[A-Z]/i) && 
                    text.length < 50 && 
                    !text.includes('Owner') && 
                    !text.includes('Co-Owner')) {
                  actualAddress = text;
                  console.log(`  Found property address from top element: "${actualAddress}"`);
                  break;
                }
              }
            }
            
            console.log(`  Using property address: "${actualAddress}"`);
            
            // Extract owner name but avoid getting owner's address
            let ownerName = 'Unknown';
            
            // Try different owner name patterns
            const ownerFromSpan = getText('span[id*="Owner"]');
            const ownerFromCell = getTextByContentInNextCell('Owner');
            const ownerFromName = getText('span[id*="Name"]');
            
            // Use the first non-address-like owner name found
            const ownerCandidates = [ownerFromSpan, ownerFromCell, ownerFromName].filter(name => {
              if (!name || !name.trim() || name.length > 100) return false;
              
              const nameTrimmed = name.trim();
              
              // Improved address detection - look for common address patterns
              const isLikelyAddress = (
                nameTrimmed.includes(' ST ') || nameTrimmed.endsWith(' ST') ||
                nameTrimmed.includes(' AVE ') || nameTrimmed.endsWith(' AVE') ||
                nameTrimmed.includes(' DR ') || nameTrimmed.endsWith(' DR') ||
                nameTrimmed.includes(' RD ') || nameTrimmed.endsWith(' RD') ||
                nameTrimmed.includes(' LN ') || nameTrimmed.endsWith(' LN') ||
                nameTrimmed.includes(' WAY ') || nameTrimmed.endsWith(' WAY') ||
                nameTrimmed.includes(' BLVD ') || nameTrimmed.endsWith(' BLVD') ||
                nameTrimmed.includes('PA ') ||
                nameTrimmed.includes('NEW CASTLE') ||
                // Only reject if it's clearly a street address pattern (number + single letter + space + word)
                nameTrimmed.match(/^\d+\s+[A-Z]\s+[A-Z]/)
              );
              
              return !isLikelyAddress;
            });
            
            if (ownerCandidates.length > 0) {
              ownerName = ownerCandidates[0];
            }
            
            console.log(`  Found owner name: "${ownerName}"`);
            
            // Look for "Deeded Acres" pattern specifically
            const acreageText = getTextByContentInNextCell('Deeded Acres') ||
                               getText('span[id*="Acre"]') || 
                               getTextByContentInNextCell('Acre') ||
                               getTextByContentInNextCell('Land') ||
                               getTextByContentInNextCell('Lot Size') ||
                               getTextByContentInNextCell('Total Acres') ||
                               getText('span[id*="Land"]') ||
                               getText('span[id*="Lot"]') || '';
            let acreage = parseFloat(acreageText.replace(/[^0-9.]/g, '')) || 0.1;
            
            // If we got a very small number, it might be in square feet - check for conversion
            if (acreage > 1000 && acreageText.toLowerCase().includes('sq')) {
              // Convert square feet to acres (1 acre = 43,560 sq ft)
              acreage = acreage / 43560;
              console.log(`  Converted from sq ft: ${acreageText} -> ${acreage.toFixed(2)} acres`);
            }
            
            console.log(`  Found acreage text: "${acreageText}" -> parsed as: ${acreage}`);
            
            // Look for Assessment field - search for "Assessment $" pattern in page content
            let assessedValue = null;
            
            // First try the table cell approach
            const valueText = getTextByContentInNextCell('Assessment') || 
                             getText('span[id*="Assessment"]') || '';
            
            console.log(`  Found assessment text from cell/span: "${valueText}"`);
            
            if (valueText.trim()) {
              const numericMatch = valueText.match(/[\$]?([0-9,]+)/);
              if (numericMatch) {
                assessedValue = parseInt(numericMatch[1].replace(/,/g, ''));
                console.log(`  Extracted assessed value from cell: $${assessedValue}`);
              }
            }
            
            // If that didn't work, search the entire page content for "Assessment $" pattern
            if (!assessedValue) {
              const assessmentPageText = document.body ? document.body.textContent || '' : '';
              const assessmentPattern = /Assessment\s*\$([0-9,]+)/i;
              const assessmentMatch = assessmentPageText.match(assessmentPattern);
              
              if (assessmentMatch && assessmentMatch[1]) {
                assessedValue = parseInt(assessmentMatch[1].replace(/,/g, ''));
                console.log(`  Found assessment value in page text: "${assessmentMatch[0]}" -> $${assessedValue}`);
              } else {
                console.log(`  No assessment value found in page text`);
              }
            }
            
            const parcelId = getText('span[id*="Parcel"]') || 
                            getText('span[id*="ID"]') || undefined;
            
            // Try to extract city from the page - no zip code needed since GIS doesn't provide reliable ones
            let extractedCity = '';
            
            // Look for city/township patterns on the page
            const cityText = getTextByContentInNextCell('City') || 
                           getTextByContentInNextCell('Municipality') ||
                           getTextByContentInNextCell('Township') ||
                           getText('span[id*="City"]') ||
                           getText('span[id*="Municipality"]') ||
                           getText('span[id*="Township"]') || '';
            
            // Debug: log what we found
            console.log(`Property detail extraction for ${actualAddress}:`);
            console.log(`  Found city text: "${cityText}"`);
            
            // Use city/township text directly from page if found and clean
            if (cityText.trim() && cityText.length < 50 && !cityText.includes('<')) {
              extractedCity = cityText.trim();
              console.log(`  Using city from page: "${extractedCity}"`);
            } else {
              // Search the entire page content for township/city names
              // const pageHTML = document.documentElement.innerHTML;
              const mainPageText = document.body ? document.body.textContent || '' : '';
              
              console.log(`  Searching page content for District X: Township pattern...`);
              
              // Look for the specific "District X: Township Name" pattern with better boundary detection
              const districtPattern = /District\s+\d+:\s*([A-Za-z0-9\s]+?)(?:\s*\n|\s*\r|\s*<|\s*$|\s{3,})/i;
              const districtMatch = mainPageText.match(districtPattern);
              
              if (districtMatch && districtMatch[1]) {
                let rawTownship = districtMatch[1].trim();
                // Clean up any extra whitespace or partial words
                rawTownship = rawTownship.replace(/\s+/g, ' ').trim();
                console.log(`  Found district pattern: "${districtMatch[0]}" -> "${rawTownship}"`);
                
                // Map township name to our expected format
                const townshipLower = rawTownship.toLowerCase();
                if (townshipLower.includes('scott')) {
                  extractedCity = 'Scott';
                } else if (townshipLower.includes('slippery rock')) {
                  extractedCity = 'Slippery Rock';
                } else if (townshipLower.includes('ellwood')) {
                  extractedCity = 'Ellwood City';
                } else if (townshipLower.includes('wilmington')) {
                  extractedCity = 'Wilmington';
                } else if (townshipLower.includes('grove city')) {
                  extractedCity = 'Grove City';
                } else if (townshipLower.includes('pulaski')) {
                  extractedCity = 'Pulaski';
                } else if (townshipLower.includes('new beaver')) {
                  extractedCity = 'New Beaver';
                } else if (townshipLower.includes('mahoning')) {
                  extractedCity = 'Mahoning';
                } else if (townshipLower.includes('neshannock')) {
                  extractedCity = 'Neshannock';
                } else if (townshipLower.includes('union')) {
                  extractedCity = 'Union';
                } else if (townshipLower.includes('taylor')) {
                  extractedCity = 'Taylor';
                } else if (townshipLower.includes('hickory')) {
                  extractedCity = 'Hickory';
                } else if (townshipLower.includes('shenango')) {
                  extractedCity = 'Shenango';
                } else if (townshipLower.includes('wayne')) {
                  extractedCity = 'Wayne';
                } else if (townshipLower.includes('perry')) {
                  extractedCity = 'Perry';
                } else if (townshipLower.includes('washington')) {
                  extractedCity = 'Washington';
                } else if (townshipLower.includes('plain grove')) {
                  extractedCity = 'Plain Grove';
                } else if (townshipLower.includes('little beaver')) {
                  extractedCity = 'Little Beaver';
                } else if (townshipLower.includes('north beaver')) {
                  extractedCity = 'North Beaver';
                } else if (townshipLower.includes('new castle')) {
                  extractedCity = 'New Castle';
                } else if (townshipLower.includes('bessemer')) {
                  extractedCity = 'Bessemer';
                } else {
                  // Use cleaned township name if we can't map it
                  extractedCity = rawTownship.length < 30 ? rawTownship : 'New Castle';
                }
                
                console.log(`  Mapped township "${rawTownship}" to "${extractedCity}"`);
              } else {
                // Fallback: Look for city names in clean text content
                const cleanPageText = mainPageText.replace(/\s+/g, ' ').toLowerCase();
                console.log(`  District pattern not found, using fallback search...`);
                
                if (cleanPageText.includes('wilmington township') || cleanPageText.includes('wilmington twp')) {
                  extractedCity = 'Wilmington';
                } else if (cleanPageText.includes('slippery rock')) {
                  extractedCity = 'Slippery Rock';
                } else if (cleanPageText.includes('scott township') || cleanPageText.includes('scott twp')) {
                  extractedCity = 'Scott';
                } else if (cleanPageText.includes('ellwood city')) {
                  extractedCity = 'Ellwood City';
                } else if (cleanPageText.includes('grove city')) {
                  extractedCity = 'Grove City';
                } else if (cleanPageText.includes('pulaski township') || cleanPageText.includes('pulaski twp')) {
                  extractedCity = 'Pulaski';
                } else if (cleanPageText.includes('new beaver')) {
                  extractedCity = 'New Beaver';
                } else if (cleanPageText.includes('mahoning township') || cleanPageText.includes('mahoning twp')) {
                  extractedCity = 'Mahoning';
                } else if (cleanPageText.includes('neshannock township') || cleanPageText.includes('neshannock twp')) {
                  extractedCity = 'Neshannock';
                } else if (cleanPageText.includes('union township') || cleanPageText.includes('union twp')) {
                  extractedCity = 'Union';
                } else if (cleanPageText.includes('bessemer')) {
                  extractedCity = 'Bessemer';
                } else {
                  extractedCity = 'New Castle';
                  console.log(`  No township found, defaulting to New Castle`);
                }
                
                console.log(`  Fallback search found: "${extractedCity}"`);
              }
            }
            
            return {
              owner_name: ownerName,
              address: actualAddress,
              city: extractedCity,
              acreage: acreage,
              assessed_value: assessedValue ?? undefined,
              property_type: 'Unknown',
              parcel_id: parcelId ?? undefined,
              search_criteria: searchCriteria
            };
          }, link.address, criteria);
          
          await propertyPage.close();
          return propertyData;
          
        } catch (error) {
          console.error(`Error fetching details for ${link.address}:`, error);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      properties.push(...batchResults.filter(prop => prop !== null));
      
      // Smaller delay between batches for speed
      if (batchIndex < batches.length - 1) {
        await delay(1000);
      }
    }
    
    // Remove duplicates (acreage filtering should be handled by the search form)
    const filteredProperties = properties.filter((prop, index, arr) => {
      // Remove duplicates by address
      const isDuplicate = arr.findIndex(p => p.address.toLowerCase() === prop.address.toLowerCase()) !== index;
      if (isDuplicate) {
        console.log(`  Filtered out ${prop.address}: duplicate address`);
        return false;
      }
      
      console.log(`  Keeping ${prop.address}: acreage ${prop.acreage}`);
      return true;
    });
    
    console.log(`Successfully scraped ${properties.length} properties, ${filteredProperties.length} after removing duplicates`);
    
    // Debug: Log filtered properties 
    console.log('Filtered properties:');
    filteredProperties.forEach((prop, index) => {
      console.log(`${index + 1}. Property found in ${prop.city}, Acreage: ${prop.acreage}`);
    });
    
    // If we have fewer than 10 properties, try multiple strategies to get more
    const finalProperties = filteredProperties;
    
    if (finalProperties.length < 10) {
      console.log(`Only found ${finalProperties.length} properties, searching for more...`);
      
      try {
        // Strategy 1: Go back and try pagination
        await page.goBack();
        await delay(2000);
        
        const moreResults = await searchAdditionalPages(page, browser, criteria, 10 - finalProperties.length);
        
        // Filter additional results for duplicates only
        const filteredMoreResults = moreResults.filter((prop) => {
          const isDuplicate = finalProperties.some(existing => 
            existing.address.toLowerCase() === prop.address.toLowerCase()
          );
          if (isDuplicate) {
            console.log(`  Additional search filtered out ${prop.address}: duplicate address`);
            return false;
          }
          
          console.log(`  Additional search keeping ${prop.address}: acreage ${prop.acreage}`);
          return true;
        });
        
        finalProperties.push(...filteredMoreResults);
        console.log(`After additional search: ${finalProperties.length} total properties`);
        
        // Strategy 2: If still not enough, try expanding acreage range slightly
        if (finalProperties.length < 10) {
          console.log(`Still need ${10 - finalProperties.length} more properties, trying expanded search...`);
          
          // Expand range by 20% and search again
          const expandedMin = Math.max(0.1, criteria.min_acreage * 0.8);
          const expandedMax = criteria.max_acreage * 1.2;
          
          console.log(`Expanding search from ${criteria.min_acreage}-${criteria.max_acreage} to ${expandedMin}-${expandedMax} acres`);
          
          // Try a new search with expanded criteria
          await page.goto('https://gis.vgsi.com/lawrencecountypa/Search.aspx', { waitUntil: 'networkidle2' });
          await delay(1000);
          
          // Set expanded acreage range
          await page.evaluate((minAcres: number, maxAcres: number) => {
            const minField = document.querySelector('#MainContent_txtLandFrom') as HTMLInputElement;
            const maxField = document.querySelector('#MainContent_txtLandTo') as HTMLInputElement;
            if (minField && maxField) {
              minField.value = minAcres.toString();
              maxField.value = maxAcres.toString();
            }
          }, expandedMin, expandedMax);
          
          // Quick search for a few more properties
          const expandedResults = await searchAdditionalPages(page, browser, {...criteria, min_acreage: expandedMin, max_acreage: expandedMax}, 5);
          
          const filteredExpandedResults = expandedResults.filter((prop) => {
            const isDuplicate = finalProperties.some(existing => 
              existing.address.toLowerCase() === prop.address.toLowerCase()
            );
            const inOriginalRange = prop.acreage >= criteria.min_acreage && prop.acreage <= criteria.max_acreage;
            
            if (isDuplicate) {
              console.log(`  Expanded search filtered out ${prop.address}: duplicate`);
              return false;
            }
            
            // Prefer properties in original range, but allow some outside if needed
            if (inOriginalRange || finalProperties.length < 8) {
              console.log(`  Expanded search keeping ${prop.address}: acreage ${prop.acreage}`);
              return true;
            }
            
            return false;
          });
          
          finalProperties.push(...filteredExpandedResults);
          console.log(`After expanded search: ${finalProperties.length} total properties`);
        }
        
      } catch (error) {
        console.log('Could not search for additional properties:', error instanceof Error ? error.message : error);
      }
    }
    
    // Return up to 10 properties
    return finalProperties.slice(0, 10);
    
  } catch (error) {
    console.error('Error in browser-based scraping:', error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}